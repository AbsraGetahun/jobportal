<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(): JsonResponse
    {
        $user = auth()->user();
        return response()->json(['data' => $user]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Log incoming request data for debugging (can be removed in production)
        \Log::info('🔄 PROFILE UPDATE REQUEST RECEIVED', [
            'has_phone' => $request->has('phone'),
            'phone_value' => $request->input('phone'),
            'phone_type' => gettype($request->input('phone')),
            'all_input' => $request->all(),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type')
        ]);

        try {
            $validatedData = $request->validate([
                'name' => 'nullable|string|max:255',
                'username' => [
                    'nullable',
                    'string',
                    'max:255',
                    'alpha_dash',
                    Rule::unique('users', 'username')->ignore($user->id),
                ],
                'email' => [
                    'nullable',
                    'string',
                    'email:rfc',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'degree' => 'nullable|string|max:255',
                'fieldOfStudy' => 'nullable|string|max:255',
                'graduationYear' => 'nullable|integer|min:1900|max:' . date('Y'),
                'experience' => 'nullable|integer|min:0|max:50',
                'hasCompany' => 'nullable|boolean',
                'companyName' => 'nullable|string|max:255',
                'companyLocation' => 'nullable|string|max:255',
                'employeesCount' => 'nullable|integer|min:1|max:1000000',
                'establishmentYear' => 'nullable|integer|min:1900|max:' . date('Y'),
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'age' => 'nullable|integer|min:1|max:120',
                'gender' => 'nullable|string|in:male,female,other',
                'location' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'website' => 'nullable|url|max:255',
            ]);

            // Log validation success (can be removed in production)
            \Log::info('Profile validation passed', [
                'phone_value' => $validatedData['phone'] ?? null
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ VALIDATION FAILED:', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
        
        // Ensure name field has a value if it's empty
        if (empty($validatedData['name'])) {
            $validatedData['name'] = $user->name;
        }

        // Explicitly handle phone field - convert empty string to null
        \Log::info('📞 BEFORE PHONE HANDLING', [
            'phone_in_validated' => $validatedData['phone'] ?? 'NOT_SET',
            'phone_type' => gettype($validatedData['phone'] ?? null),
            'isset_phone' => isset($validatedData['phone'])
        ]);

        if (isset($validatedData['phone'])) {
            if ($validatedData['phone'] === '' || $validatedData['phone'] === null) {
                $validatedData['phone'] = null;
            } else {
                // Trim whitespace and ensure it's not just spaces
                $phone = trim($validatedData['phone']);
                $validatedData['phone'] = $phone === '' ? null : $phone;
            }
        }

        \Log::info('📞 AFTER PHONE HANDLING', [
            'phone_after_handling' => $validatedData['phone'] ?? 'NOT_SET',
            'phone_type_after' => gettype($validatedData['phone'] ?? null)
        ]);

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $validatedData['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
        }

        // Update user profile
        \Log::info('🔄 ABOUT TO UPDATE USER', [
            'user_id' => $user->id,
            'data_to_update' => $validatedData,
            'phone_in_update' => $validatedData['phone'] ?? 'NOT_SET'
        ]);

        // Try explicit phone field update first
        if (isset($validatedData['phone'])) {
            $user->phone = $validatedData['phone'];
            \Log::info('📞 EXPLICIT PHONE UPDATE', [
                'user_id' => $user->id,
                'phone_set_to' => $user->phone,
                'phone_type' => gettype($user->phone)
            ]);
            $user->save(); // Save immediately after setting phone
        }

        $user->update($validatedData);

        \Log::info('✅ USER UPDATED', [
            'user_id' => $user->id,
            'phone_after_update' => $user->phone,
            'phone_type_after_update' => gettype($user->phone)
        ]);

        $user->refresh();

        \Log::info('🔄 USER REFRESHED', [
            'user_id' => $user->id,
            'phone_after_refresh' => $user->phone,
            'phone_type_after_refresh' => gettype($user->phone)
        ]);

        return response()->json(['data' => $user]);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'current_password' => 'required|string|min:8',
            'password' => 'required|string|min:8|confirmed|different:current_password',
        ]);

        // Check if the current password is correct
        if (!Hash::check($validatedData['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        // Update the password
        $user->update([
            'password' => Hash::make($validatedData['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Update the authenticated user's notification preferences.
     */
    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'job_alerts' => 'boolean',
            'application_updates' => 'boolean',
            'company_news' => 'boolean',
            'profile_suggestions' => 'boolean',
            'saved_jobs_notifications' => 'boolean',
        ]);

        // Update notification preferences
        $user->update($validatedData);

        // Refresh the user to get updated data
        $user->refresh();

        return response()->json([
            'message' => 'Notification preferences updated successfully',
            'data' => [
                'email_notifications' => $user->email_notifications,
                'sms_notifications' => $user->sms_notifications,
                'push_notifications' => $user->push_notifications,
                'job_alerts' => $user->job_alerts,
                'application_updates' => $user->application_updates,
                'company_news' => $user->company_news,
                'profile_suggestions' => $user->profile_suggestions,
                'saved_jobs_notifications' => $user->saved_jobs_notifications,
            ]
        ]);
    }

    /**
     * Get the authenticated user's notification preferences.
     */
    public function getNotificationPreferences(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'data' => [
                'email_notifications' => $user->email_notifications,
                'sms_notifications' => $user->sms_notifications,
                'push_notifications' => $user->push_notifications,
                'job_alerts' => $user->job_alerts,
                'application_updates' => $user->application_updates,
                'company_news' => $user->company_news,
                'profile_suggestions' => $user->profile_suggestions,
                'saved_jobs_notifications' => $user->saved_jobs_notifications,
            ]
        ]);
    }

    /**
     * Delete the authenticated user's account.
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        // Check if the password is correct
        if (!Hash::check($validatedData['password'], $user->password)) {
            return response()->json(['message' => 'Password is incorrect'], 400);
        }

        // Delete profile picture if it exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Delete the user
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
