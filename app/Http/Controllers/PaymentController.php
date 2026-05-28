<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    private string $paystackSecret;
    private string $paystackUrl;

    public function __construct()
    {
        $this->paystackSecret = config('services.paystack.secret_key');
        $this->paystackUrl    = config('services.paystack.payment_url');
    }

    // Initialize full payment
    public function initializeFullPayment(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::where('user_id', Auth::id())
            ->findOrFail($request->order_id);

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'This order has already been paid or cancelled',
            ], 422);
        }

        if ($order->payment_type !== 'full') {
            return response()->json([
                'message' => 'This order is set up for installment payment',
            ], 422);
        }

        // Create a pending payment record
        $payment = Payment::create([
            'order_id'       => $order->id,
            'amount'         => $order->total_amount,
            'payment_method' => 'paystack',
            'status'         => 'pending',
        ]);

        // Initialize transaction with Paystack
        $response = Http::withToken($this->paystackSecret)
            ->post("{$this->paystackUrl}/transaction/initialize", [
                'email'     => Auth::user()->email,
                'amount'    => $order->total_amount * 100, // Paystack uses kobo/pesewas
                'reference' => 'PAY-' . $payment->id . '-' . time(),
                'metadata'  => [
                    'order_id'   => $order->id,
                    'payment_id' => $payment->id,
                    'user_id'    => Auth::id(),
                ],
            ]);

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Failed to initialize payment',
                'error'   => $response->json(),
            ], 500);
        }

        $data = $response->json();

        // Save the transaction reference
        $payment->update([
            'transaction_ref' => $data['data']['reference'],
        ]);

        return response()->json([
            'message'          => 'Payment initialized',
            'payment_url'      => $data['data']['authorization_url'],
            'reference'        => $data['data']['reference'],
            'payment_id'       => $payment->id,
        ]);
    }

    // Verify full payment after redirect
    public function verifyFullPayment(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $request->reference;

        // Check for duplicate processing
        $payment = Payment::where('transaction_ref', $reference)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->status === 'successful') {
            return response()->json(['message' => 'Payment already verified']);
        }

        // Verify with Paystack
        $response = Http::withToken($this->paystackSecret)
            ->get("{$this->paystackUrl}/transaction/verify/{$reference}");

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Verification failed',
            ], 500);
        }

        $data = $response->json('data');

        if ($data['status'] === 'success') {
            $payment->update([
                'status'  => 'successful',
                'paid_at' => now(),
            ]);

            $payment->order->update(['status' => 'paid']);

            return response()->json([
                'message' => 'Payment successful',
                'order'   => $payment->order->load(['items.product']),
            ]);
        }

        $payment->update(['status' => 'failed']);

        return response()->json(['message' => 'Payment failed'], 422);
    }

    // Paystack webhook
    public function webhook(Request $request): JsonResponse
    {
        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        $payload   = $request->getContent();

        if ($signature !== hash_hmac('sha512', $payload, $this->paystackSecret)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->json('event');
        $data  = $request->json('data');

        if ($event === 'charge.success') {
            $reference = $data['reference'];

            $payment = Payment::where('transaction_ref', $reference)->first();

            // Idempotency check - don't process twice
            if ($payment && $payment->status !== 'successful') {
                $payment->update([
                    'status'  => 'successful',
                    'paid_at' => now(),
                ]);

                $payment->order->update(['status' => 'paid']);
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }
}