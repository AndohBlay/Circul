<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\InstallmentController;
use App\Http\Controllers\IdentityVerificationController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SuperAdminController;

// Public auth routes
Route::middleware('throttle:register')->post('/register', [AuthController::class, 'register']);
Route::middleware('throttle:login')->post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Social authentication callback endpoints
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// Public inventory display routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Public order status tracking endpoint
Route::get('/orders/track', [OrderController::class, 'trackByNumber']);

// Public payment incoming provider webhooks
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Authenticated user route endpoints group
// Applied 'throttle:api' here to cover all authenticated client and admin requests
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // User session management actions
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user/change-password', [AuthController::class, 'changePassword']);

    // Client order placement operations
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/user/orders/history', [OrderController::class, 'myHistory']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Client direct non-split payment settlements
    Route::post('/payments/initialize', [PaymentController::class, 'initializeFullPayment']);
    Route::post('/payments/verify', [PaymentController::class, 'verifyFullPayment']);

    // Client structured installment financing configurations
    Route::post('/installments/plan', [InstallmentController::class, 'createPlan']);
    Route::get('/installments', [InstallmentController::class, 'myPlans']);
    Route::get('/installments/{planId}', [InstallmentController::class, 'show']);
    Route::post('/installments/schedule/{scheduleId}/pay', [InstallmentController::class, 'initializeSchedulePayment']);
    Route::post('/installments/verify', [InstallmentController::class, 'verifySchedulePayment']);

    // Client identity (Ghana Card / KYC) verification submission + status check
    Route::post('/identity/submit', [IdentityVerificationController::class, 'submitIdentity']);
    Route::get('/identity/status', [IdentityVerificationController::class, 'checkMyStatus']);

    // Joint operational admin and superadmin route group
    Route::middleware('role:admin|superadmin')->group(function () {
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::put('/admin/products/{id}', [ProductController::class, 'update']);
        Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'stats']);
        Route::get('/admin/dashboard/low-stock', [AdminDashboardController::class, 'lowStockProducts']);
        Route::get('/admin/dashboard/overdue-installments', [AdminDashboardController::class, 'overdueInstallments']);

        // Staff review queue for client identity verification submissions
        Route::get('/admin/identity-verifications', [IdentityVerificationController::class, 'adminIndex']);
        Route::put('/admin/identity-verifications/{id}/review', [IdentityVerificationController::class, 'reviewIdentity']);
    });

    // Executive level superadmin only management group
    Route::middleware('role:superadmin')->group(function () {
        Route::put('/superadmin/profile', [SuperAdminController::class, 'updateProfile']);
        Route::get('/superadmin/admins', [SuperAdminController::class, 'listAdmins']);
        Route::post('/superadmin/admins', [SuperAdminController::class, 'createAdmin']);
        Route::get('/superadmin/admins/performance', [SuperAdminController::class, 'adminPerformanceStats']);
        Route::put('/superadmin/admins/{id}', [SuperAdminController::class, 'updateAdmin']);
        Route::post('/superadmin/admins/{id}/reset-password', [SuperAdminController::class, 'resetAdminPassword']);
        Route::delete('/superadmin/admins/{id}/deactivate', [SuperAdminController::class, 'deactivateAdmin']);
        Route::post('/superadmin/admins/{id}/reactivate', [SuperAdminController::class, 'reactivateAdmin']);
        Route::get('/superadmin/admins/{id}/activity', [SuperAdminController::class, 'monitorAdminActivity']);
        Route::get('/superadmin/clients', [SuperAdminController::class, 'listClients']);
        Route::get('/superadmin/stats', [SuperAdminController::class, 'stats']);
    });
});
