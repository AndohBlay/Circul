<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\IdentityVerification;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class SuperAdminController extends Controller
{
    protected SmsService $sms;

    // Inject SMS service dependency directly into constructor
    public function __construct(SmsService $sms)
    {
        $this->sms = $sms;
    }

    // List all staff members holding admin role assignments
    public function listAdmins(): JsonResponse
    {
        $admins = User::role('admin')->latest()->get();

        return response()->json($admins);
    }

    // Monitor actions and audit changes performed by specific administrators
    public function monitorAdminActivity($id): JsonResponse
    {
        $admin = User::role('admin')->findOrFail($id);

        // Fetch verification approvals completed by this specific team member
        $kycApprovals = IdentityVerification::where('verified_by', $admin->id)
            ->with('user:id,name,email')
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'admin_profile' => $admin,
            'audit_logs' => [
                'kyc_verifications_processed' => $kycApprovals,
                'total_kyc_processed_count' => $kycApprovals->count(),
            ]
        ]);
    }

    // Comprehensive cross-staff administrative performance monitoring dashboard
    public function adminPerformanceStats(): JsonResponse
    {
        // Aggregate breakdown of which admin has completed identity compliance checks
        $performance = DB::table('identity_verifications')
            ->join('users', 'identity_verifications.verified_by', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', DB::raw('count(identity_verifications.id) as total_verified'))
            ->groupBy('users.id', 'users.name', 'users.email')
            ->get();

        return response()->json($performance);
    }

    // Create a new administrative user with immediate active privileges
    public function createAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'required|string|unique:users,phone',
            'password' => ['required', Password::defaults()],
        ]);

        $user = User::create([
            'name'              => $request->name,
            'email'             => $request->email,
            'phone'             => $request->phone,
            'password'          => Hash::make($request->password),
            'phone_verified_at' => Carbon::now(),
        ]);

        $user->assignRole('admin');

        // Deliver plain temporary account credentials via system gateway
        $this->sms->send(
            $request->phone,
            "Welcome to Circul Admin. Your account has been created. Email: {$request->email}, Password: {$request->password}. Please change your password after login."
        );

        return response()->json([
            'message' => 'Admin created successfully',
            'admin'   => $user,
        ], 201);
    }

    // Update profile data fields on a specific target admin user
    public function updateAdmin(Request $request, $id): JsonResponse
    {
        $admin = User::role('admin')->findOrFail($id);

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|unique:users,phone,' . $id,
        ]);

        $admin->update($request->only(['name', 'email', 'phone']));

        return response()->json([
            'message' => 'Admin updated successfully',
            'admin'   => $admin,
        ]);
    }

    // Explicitly reset an existing administrator profile password string
    public function resetAdminPassword(Request $request, $id): JsonResponse
    {
        $request->validate([
            'password' => ['required', Password::defaults()],
        ]);

        $admin = User::role('admin')->findOrFail($id);

        $admin->update([
            'password' => Hash::make($request->password),
        ]);

        // Deliver immediate notifications regarding updated session values
        $this->sms->send(
            $admin->phone,
            "Circul: Your admin password has been reset. New password: {$request->password}. Please login and change it immediately."
        );

        return response()->json([
            'message' => 'Admin password reset successfully',
        ]);
    }

    // Demote admin to regular client privileges and revoke access tokens
    public function deactivateAdmin($id): JsonResponse
    {
        $admin = User::role('admin')->findOrFail($id);

        $admin->tokens()->delete();
        $admin->syncRoles(['client']);

        return response()->json([
            'message' => 'Admin deactivated successfully. They now have client access only.',
        ]);
    }

    // Elevate client profile status assignments back to active administrator
    public function reactivateAdmin($id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'User is already an admin'], 422);
        }

        $user->syncRoles(['admin']);

        return response()->json([
            'message' => 'Admin reactivated successfully',
        ]);
    }

    // Retrieve a paginated collection list of registered buyer profiles
    public function listClients(Request $request): JsonResponse
    {
        $query = User::role('client')->latest();

        // Apply basic wild-card matching logic over text search parameter strings
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $clients = $query->paginate(15);

        return response()->json($clients);
    }

    // Calculate aggregated summary operational statistics across roles counts
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_admins'      => User::role('admin')->count(),
            'total_clients'     => User::role('client')->count(),
            'total_superadmins' => User::role('superadmin')->count(),
        ]);
    }

    // Modify active structural login credentials and profiles for the current master operator
    public function updateProfile(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = auth()->user();

        $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|required|string|min:8|confirmed',
        ]);

        $updateData = [];
        if ($request->has('name')) {
            $updateData['name'] = $request->name;
        }
        if ($request->has('email')) {
            $updateData['email'] = $request->email;
        }
        if ($request->has('password')) {
            $updateData['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Superadmin credentials updated successfully.',
            'user'    => $user->only(['id', 'name', 'email']),
        ]);
    }
} 