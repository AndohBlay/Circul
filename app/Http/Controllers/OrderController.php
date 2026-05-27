<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Http\Requests\StoreOrderRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = DB::transaction(function () use ($request) {

                $totalAmount = 0;
                $orderItems  = [];

                foreach ($request->items as $item) {
                    // Lock the product row to prevent overselling
                    $product = Product::lockForUpdate()->find($item['product_id']);

                    if (!$product || !$product->is_active) {
                        throw new \Exception("Product {$item['product_id']} is not available.");
                    }

                    if ($product->stock_quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product: {$product->name}. Available: {$product->stock_quantity}");
                    }

                    // Snapshot price at time of order
                    $unitPrice    = $product->price;
                    $totalAmount += $unitPrice * $item['quantity'];

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'quantity'   => $item['quantity'],
                        'unit_price' => $unitPrice,
                    ];

                    // Decrement stock
                    $product->decrement('stock_quantity', $item['quantity']);
                }

                // Create the order
                $order = Order::create([
                    'user_id'      => Auth::id(),
                    'status'       => 'pending',
                    'payment_type' => $request->payment_type,
                    'total_amount' => $totalAmount,
                ]);

                // Create order items
                $order->items()->createMany($orderItems);

                return $order;
            });

            return response()->json([
                'message' => 'Order placed successfully',
                'order'   => $order->load(['items.product', 'user']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function index(): JsonResponse
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show($id): JsonResponse
    {
        $order = Order::with(['items.product', 'payments'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($order);
    }

    public function cancel($id): JsonResponse
    {
        $order = Order::where('user_id', Auth::id())
            ->findOrFail($id);

        if (!in_array($order->status, ['pending'])) {
            return response()->json([
                'message' => 'Only pending orders can be cancelled',
            ], 422);
        }

        // Restore stock
        foreach ($order->items as $item) {
            $item->product->increment('stock_quantity', $item->quantity);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
        ]);
    }
}