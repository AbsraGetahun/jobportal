<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\FieldOfStudy;
use App\Services\NotificationService;

class EmailVerificationController extends Controller
{
    /**
     * Mark the user's email address as verified.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Request $request, User $user)
    {
        if (! URL::hasValidSignature($request)) {
            return response()->json(['message' => 'Invalid verification link'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 200);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully'], 200);
    }

    /**
     * Resend the email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent'], 200);
    }
    
    /**
     * Verify registration email and create user account.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $token
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyRegistration(Request $request, string $token)
    {
        // Check if registration data exists for this token
        $userData = Cache::get('registration_' . $token);
        
        if (!$userData) {
            return response()->json(['message' => 'Invalid or expired verification link'], 400);
        }
        
        // Check if user already exists (double-check)
        if (User::where('email', $userData['email'])->exists() || User::where('username', $userData['username'])->exists()) {
            // Remove the temporary data
            Cache::forget('registration_' . $token);
            
            return response()->json(['message' => 'The username or email has already been taken.'], 422);
        }
        
        // Handle field of study - save to database if it doesn't exist
        $fieldOfStudy = null;
        if (!empty($userData['fieldOfStudy'])) {
            // Check if field of study already exists
            $fieldOfStudyRecord = FieldOfStudy::firstOrCreate(
                ['name' => $userData['fieldOfStudy']],
                ['name' => $userData['fieldOfStudy']]
            );
            $fieldOfStudy = $fieldOfStudyRecord->name;
        }
        
        // Create user with properly mapped fields
        $user = User::create([
            'name' => $userData['name'],
            'username' => $userData['username'],
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
            'age' => $userData['age'] ?? null,
            'gender' => $userData['gender'] ?? null,
            'location' => $userData['location'] ?? null,
            'phone' => $userData['phone'] ?? null,
            'degree' => $userData['degree'] ?? null,
            'fieldOfStudy' => $fieldOfStudy,
            'graduationYear' => $userData['graduationYear'] ?? null,
            'experience' => $userData['experience'] ?? null,
            'hasCompany' => $userData['hasCompany'] ?? null,
            'companyName' => $userData['companyName'] ?? null,
            'companyLocation' => $userData['companyLocation'] ?? null,
            'employeesCount' => $userData['employeesCount'] ?? null,
            'establishmentYear' => $userData['establishmentYear'] ?? null,
            'address' => $userData['address'] ?? null,
            'website' => $userData['website'] ?? null,
        ]);

        // Remove the temporary data
        Cache::forget('registration_' . $token);

        // Mark the email as verified since they clicked the verification link
        $user->markEmailAsVerified();

        // Send notification to admins about new user registration
        NotificationService::notifyAdminNewUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Registration completed successfully. You can now log in to your account.'
        ], 200);
    }
}