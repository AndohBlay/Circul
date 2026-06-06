<?php

namespace App\Http\Controllers;

use App\Models\IdentityVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class IdentityVerificationController extends Controller
{
    // Submit KYC identity parameters for validation queues
    public function submitIdentity(Request $request): JsonResponse
    {
        $request->validate([
            'id_type'        => 'required|in:ghana_card,voter_id,passport,drivers_license,ssnit',
            'id_number'      => 'required|string|max:100',
            'id_front_image' => 'required|image|max:4096',
            'id_back_image'  => 'required_unless:id_type,passport|image|max:4096',
            'selfie_image'   => 'required|image|max:4096',
        ]);

        $existing = IdentityVerification::where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have an active or pending identity verification request.'], 422);
        }

        $frontPath = $request->file('id_front_image')->store('identities/front', 'public');
        $backPath  = $request->hasFile('id_back_image') ? $request->file('id_back_image')->store('identities/back', 'public') : null;
        $selfiePath = $request->file('selfie_image')->store('identities/selfies', 'public');

        $verification = IdentityVerification::create([
            'user_id'        => Auth::id(),
            'id_type'        => $request->id_type,
            'id_number'      => $request->id_number,
            'id_front_image' => $frontPath,
            'id_back_image'  => $backPath,
            'selfie_image'   => $selfiePath,
            'status'         => 'pending',
        ]);

        return response()->json([
            'message'      => 'Identity verification documents uploaded successfully.',
            'verification' => $verification
        ], 201);
    }

    // Retrieve active validation progress records for authenticated client session
    public function checkMyStatus(): JsonResponse
    {
        $verification = IdentityVerification::where('user_id', Auth::id())->latest()->first();

        if (!$verification) {
            return response()->json(['status' => 'unverified', 'message' => 'No identity documents submitted yet.']);
        }

        return response()->json($verification);
    }

    // List paginated identity validation files inside control staff panels
    public function adminIndex(Request $request): JsonResponse
    {
        $query = IdentityVerification::with('user:id,name,email')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    // Process approval decisions while binding administrative audit footprints
    public function reviewIdentity(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status'           => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|string|max:500|nullable',
        ]);

        $verification = IdentityVerification::findOrFail($id);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'This verification request has already been processed.'], 422);
        }

        $verification->update([
            'status'           => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'verified_at'      => Carbon::now(),
            'verified_by'      => Auth::id(),
        ]);

        return response()->json([
            'message'      => "Identity application successfully marked as {$request->status}.",
            'verification' => $verification
        ]);
    }
}