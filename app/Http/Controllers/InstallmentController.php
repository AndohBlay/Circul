<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\InstallmentPlan;
use App\Models\InstallmentSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class InstallmentController extends Controller
{
    private string $paystackSecret;
    private string $paystackUrl;

    public function __construct()
    {
        $this->paystackSecret = config('services.paystack.secret_key');
        $this->paystackUrl    = config('services.paystack.payment_url');
    }

    // Create installment plan for an order
    public function createPlan(Request $request): JsonResponse
    {
        $request->validate([
            'order_id'           => 'required|exists:orders,id',
            'total_installments' => 'required|integer|min:2|max:12',
            'down_payment'       => 'required|numeric|min:0',
            'frequency'          => 'required|in:weekly,monthly',
        ]);

        $order = Order::where('user_id', Auth::id())
            ->findOrFail($request->order_id);

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'This order has already been paid or cancelled',
            ], 422);
        }

        if ($order->payment_type !== 'installment') {
            return response()->json([
                'message' => 'This order is set up for full payment',
            ], 422);
        }

        if ($order->installmentPlan) {
            return response()->json([
                'message' => 'Installment plan already exists for this order',
            ], 422);
        }

        $downPayment      = $request->down_payment;
        $remaining        = $order->total_amount - $downPayment;
        $amountPerInstall = round($remaining / ($request->total_installments - 1), 2);

        DB::transaction(function () use ($request, $order, $downPayment, $amountPerInstall) {

            $plan = InstallmentPlan::create([
                'order_id'               => $order->id,
                'total_installments'     => $request->total_installments,
                'amount_per_installment' => $amountPerInstall,
                'down_payment'           => $downPayment,
                'frequency'              => $request->frequency,
            ]);

            // Generate schedule rows
            $schedules   = [];
            $schedules[] = [
                'plan_id'    => $plan->id,
                'amount_due' => $downPayment,
                'due_date'   => now()->toDateString(),
                'status'     => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            for ($i = 1; $i < $request->total_installments; $i++) {
                $dueDate = $request->frequency === 'monthly'
                    ? now()->addMonths($i)->toDateString()
                    : now()->addWeeks($i)->toDateString();

                $schedules[] = [
                    'plan_id'    => $plan->id,
                    'amount_due' => $amountPerInstall,
                    'due_date'   => $dueDate,
                    'status'     => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            InstallmentSchedule::insert($schedules);
        });

        $plan = InstallmentPlan::with('schedules')
            ->where('order_id', $order->id)
            ->first();

        return response()->json([
            'message' => 'Installment plan created successfully',
            'plan'    => $plan,
        ], 201);
    }

    // Get my installment plans
    public function myPlans(): JsonResponse
    {
        $plans = InstallmentPlan::with(['schedules', 'order'])
            ->whereHas('order', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->get();

        return response()->json($plans);
    }

    // Get single plan with schedules
    public function show($planId): JsonResponse
    {
        $plan = InstallmentPlan::with(['schedules.payment', 'order'])
            ->whereHas('order', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->findOrFail($planId);

        return response()->json($plan);
    }

    // Initialize payment for a specific schedule
    public function initializeSchedulePayment(Request $request, $scheduleId): JsonResponse
    {
        $schedule = InstallmentSchedule::whereHas('plan.order', function ($q) {
            $q->where('user_id', Auth::id());
        })->findOrFail($scheduleId);

        if ($schedule->status === 'paid') {
            return response()->json(['message' => 'This installment has already been paid'], 422);
        }

        $payment = Payment::create([
            'order_id'       => $schedule->plan->order_id,
            'amount'         => $schedule->amount_due,
            'payment_method' => 'paystack',
            'status'         => 'pending',
        ]);

        $response = Http::withToken($this->paystackSecret)
            ->post("{$this->paystackUrl}/transaction/initialize", [
                'email'     => Auth::user()->email,
                'amount'    => $schedule->amount_due * 100,
                'reference' => 'INST-' . $payment->id . '-' . time(),
                'metadata'  => [
                    'schedule_id' => $schedule->id,
                    'payment_id'  => $payment->id,
                    'order_id'    => $schedule->plan->order_id,
                ],
            ]);

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Failed to initialize payment',
            ], 500);
        }

        $data = $response->json();

        $payment->update([
            'transaction_ref' => $data['data']['reference'],
        ]);

        return response()->json([
            'message'     => 'Payment initialized',
            'payment_url' => $data['data']['authorization_url'],
            'reference'   => $data['data']['reference'],
            'payment_id'  => $payment->id,
        ]);
    }

    // Verify installment payment
    public function verifySchedulePayment(Request $request): JsonResponse
    {
        $request->validate([
            'reference'   => 'required|string',
            'schedule_id' => 'required|exists:installment_schedules,id',
        ]);

        $payment = Payment::where('transaction_ref', $request->reference)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->status === 'successful') {
            return response()->json(['message' => 'Payment already verified']);
        }

        $response = Http::withToken($this->paystackSecret)
            ->get("{$this->paystackUrl}/transaction/verify/{$request->reference}");

        if (!$response->successful()) {
            return response()->json(['message' => 'Verification failed'], 500);
        }

        $data = $response->json('data');

        if ($data['status'] === 'success') {

            DB::transaction(function () use ($payment, $request) {

                $payment->update([
                    'status'  => 'successful',
                    'paid_at' => now(),
                ]);

                $schedule = InstallmentSchedule::find($request->schedule_id);
                $schedule->update([
                    'status'     => 'paid',
                    'payment_id' => $payment->id,
                ]);

                // Check if all schedules are paid
                $plan           = $schedule->plan;
                $unpaidCount    = $plan->schedules()->where('status', '!=', 'paid')->count();

                if ($unpaidCount === 0) {
                    $plan->order->update(['status' => 'paid']);
                } else {
                    $plan->order->update(['status' => 'partially_paid']);
                }
            });

            return response()->json([
                'message' => 'Installment payment successful',
            ]);
        }

        $payment->update(['status' => 'failed']);

        return response()->json(['message' => 'Payment failed'], 422);
    }
}