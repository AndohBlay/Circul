<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\InstallmentController;
use App\Http\Controllers\AdminDashboardController;

// Public routes
Route::middleware('throttle:register')->post('/register', [AuthController::class, 'register']);
Route::middleware('throttle:login')->post('/login', [AuthController::class, 'login']);

// Paystack webhook (public)
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Social Auth
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Client order routes
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Payment routes
    Route::post('/payments/initialize', [PaymentController::class, 'initializeFullPayment']);
    Route::post('/payments/verify', [PaymentController::class, 'verifyFullPayment']);

    // Installment routes
    Route::post('/installments/plan', [InstallmentController::class, 'createPlan']);
    Route::get('/installments', [InstallmentController::class, 'myPlans']);
    Route::get('/installments/{planId}', [InstallmentController::class, 'show']);
    Route::post('/installments/schedule/{scheduleId}/pay', [InstallmentController::class, 'initializeSchedulePayment']);
    Route::post('/installments/verify', [InstallmentController::class, 'verifySchedulePayment']);

    // Admin only routes
    Route::middleware('role:admin|superadmin')->group(function () {
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::put('/admin/products/{id}', [ProductController::class, 'update']);
        Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'stats']);
        Route::get('/admin/dashboard/low-stock', [AdminDashboardController::class, 'lowStockProducts']);
        Route::get('/admin/dashboard/overdue-installments', [AdminDashboardController::class, 'overdueInstallments']);
    });
});