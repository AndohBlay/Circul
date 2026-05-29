<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Payment;
use App\Models\InstallmentSchedule;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        // Revenue
        $totalRevenue = Payment::where('status', 'successful')->sum('amount');
        $monthRevenue = Payment::where('status', 'successful')
            ->whereMonth('paid_at', Carbon::now()->month)
            ->sum('amount');

        // Orders
        $totalOrders   = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $paidOrders    = Order::where('status', 'paid')->count();

        // Users
        $totalClients = User::role('client')->count();
        $newThisMonth = User::role('client')
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        // Products
        $totalProducts    = Product::count();
        $lowStockProducts = Product::where('stock_quantity', '<=', 5)
            ->where('is_active', true)
            ->count();

        // Installments
        $overdueInstallments = InstallmentSchedule::where('status', 'overdue')->count();

        // Recent orders
        $recentOrders = Order::with(['user', 'items.product'])
            ->latest()
            ->take(5)
            ->get();

        // Monthly revenue chart (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthlyRevenue[] = [
                'month'   => $month->format('M Y'),
                'revenue' => Payment::where('status', 'successful')
                    ->whereMonth('paid_at', $month->month)
                    ->whereYear('paid_at', $month->year)
                    ->sum('amount'),
            ];
        }

        return response()->json([
            'revenue' => [
                'total'        => $totalRevenue,
                'this_month'   => $monthRevenue,
                'monthly_chart'=> $monthlyRevenue,
            ],
            'orders' => [
                'total'   => $totalOrders,
                'pending' => $pendingOrders,
                'paid'    => $paidOrders,
            ],
            'clients' => [
                'total'         => $totalClients,
                'new_this_month'=> $newThisMonth,
            ],
            'products' => [
                'total'     => $totalProducts,
                'low_stock' => $lowStockProducts,
            ],
            'overdue_installments' => $overdueInstallments,
            'recent_orders'        => $recentOrders,
        ]);
    }

    public function lowStockProducts(): JsonResponse
    {
        $products = Product::with('category')
            ->where('stock_quantity', '<=', 5)
            ->where('is_active', true)
            ->orderBy('stock_quantity')
            ->get();

        return response()->json($products);
    }

    public function overdueInstallments(): JsonResponse
    {
        $schedules = InstallmentSchedule::with('plan.order.user')
            ->where('status', 'overdue')
            ->latest()
            ->get();

        return response()->json($schedules);
    }
}