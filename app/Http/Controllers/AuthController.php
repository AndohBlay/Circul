<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected SmsService $sms;

    public function __construct(SmsService $sms)
    {
        $this->sms = $sms;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $existingPhone = User::where('phone', $request->phone)->exists();
        if ($existingPhone) {
            return response()->json([
                'message' => 'This phone number is already registered. Please use a different phone number or log in.'
            ], 422);
        }

        $existingEmail = User::where('email', $request->email)->exists();
        if ($existingEmail) {
            return response()->json([
                'message' => 'This email address is already registered. Please use a different email address or log in.'
            ], 422);
        }

        $otp     = strval(random_int(100000, 999999));
        $expires = Carbon::now()->addMinutes(10);

        $user = User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'phone'          => $request->phone,
            'otp_code'       => $otp,
            'otp_expires_at' => $expires,
        ]);

        $user->assignRole('client');

        $this->sms->send(
            $request->phone,
            "Your Circul verification code is: {$otp}. It expires in 10 minutes."
        );

        return response()->json([
            'message' => 'Registration successful. Please verify your phone number with the OTP sent to ' . $request->phone,
            'user_id' => $user->id,
        ], 201);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp'     => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->hasVerifiedPhone()) {
            return response()->json(['message' => 'Phone already verified'], 422);
        }

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP code'], 422);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 422);
        }

        $user->update([
            'phone_verified_at' => Carbon::now(),
            'otp_code'          => null,
            'otp_expires_at'    => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Phone verified successfully',
            'token'   => $token,
            'user'    => $user->load('roles'),
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->hasVerifiedPhone()) {
            return response()->json(['message' => 'Phone already verified'], 422);
        }

        $otp     = strval(random_int(100000, 999999));
        $expires = Carbon::now()->addMinutes(10);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => $expires,
        ]);

        $this->sms->send(
            $user->phone,
            "Your new Circul verification code is: {$otp}. It expires in 10 minutes."
        );

        return response()->json([
            'message' => 'OTP resent to ' . $user->phone,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|exists:users,phone',
        ]);

        $user = User::where('phone', $request->phone)->firstOrFail();

        $otp     = strval(random_int(100000, 999999));
        $expires = Carbon::now()->addMinutes(15);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => $expires,
        ]);

        $this->sms->send(
            $user->phone,
            "Your Circul password reset code is: {$otp}. It expires in 15 minutes."
        );

        return response()->json([
            'message' => 'Password reset code has been sent to your phone number.',
            'user_id' => $user->id,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'user_id'  => 'required|exists:users,id',
            'otp'      => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid reset code'], 422);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'Reset code has expired.'], 422);
        }

        $user->update([
            'password'       => Hash::make($request->password),
            'otp_code'       => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Your password has been reset successfully. You can now log in.',
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($loginField, $request->login)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->provider && !$user->password) {
            return response()->json([
                'message' => 'This account uses ' . $user->provider . ' login. Please sign in with ' . $user->provider . '.',
            ], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->hasVerifiedPhone()) {
            return response()->json([
                'message' => 'Please verify your phone number before logging in.',
                'user_id' => $user->id,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user->load('roles'),
        ]);
    }

    public function logout(): JsonResponse
    {
        Auth::user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->load('roles'),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided current password does not match our records.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Your password has been changed successfully.',
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(Auth::user()->load('roles'));
    }
}