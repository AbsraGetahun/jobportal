<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\FieldOfStudy;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use App\Notifications\VerifyEmail;
use App\Notifications\RegisterVerifyEmail;
use Illuminate\Support\Str;
use App\Services\NotificationService;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        // Log incoming request for debugging
        \Log::info('Registration attempt', [
            'request_data' => $request->except(['password', 'password_confirmation']),
            'has_password' => $request->has('password'),
            'has_password_confirmation' => $request->has('password_confirmation'),
        ]);

        // Get validated data from the request
        try {
            $data = $request->validated();
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->except(['password', 'password_confirmation']),
            ]);
            throw $e;
        }
        
        // Check if user already exists (case-insensitive for MySQL compatibility)
        if (User::whereRaw('LOWER(email) = ?', [strtolower($data['email'])])->exists() || 
            User::whereRaw('LOWER(username) = ?', [strtolower($data['username'])])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'The username or email has already been taken.'
            ], 422);
        }
        
        // Check if email verification is required
        if (!env('REQUIRE_EMAIL_VERIFICATION', true)) {
            // Email verification is not required, create user directly
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'age' => $data['age'] ?? null,
                'gender' => $data['gender'] ?? null,
                'location' => $data['location'] ?? null,
                'phone' => $data['phone'] ?? null,
                'degree' => $data['degree'] ?? null,
                'fieldOfStudy' => $data['fieldOfStudy'] ?? null,
                'graduationYear' => $data['graduationYear'] ?? null,
                'experience' => $data['experience'] ?? null,
                'hasCompany' => $data['hasCompany'] ?? null,
                'companyName' => $data['companyName'] ?? null,
                'companyLocation' => $data['companyLocation'] ?? null,
                'employeesCount' => $data['employeesCount'] ?? null,
                'establishmentYear' => $data['establishmentYear'] ?? null,
                'address' => $data['address'] ?? null,
                'website' => $data['website'] ?? null,
            ]);

            // Mark email as verified since verification is not required
            $user->markEmailAsVerified();

            // Send notification to admins about new user registration
            NotificationService::notifyAdminNewUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Registration completed successfully. You can now log in to your account.',
                'user' => $user
            ], 201);
        }
        
        // Use the name field directly from validation
        $name = $data['name'];
        
        // Handle field of study - save to database if it doesn't exist
        $fieldOfStudy = null;
        if (!empty($data['fieldOfStudy'])) {
            // Check if field of study already exists
            $fieldOfStudyRecord = FieldOfStudy::firstOrCreate(
                ['name' => $data['fieldOfStudy']],
                ['name' => $data['fieldOfStudy']]
            );
            $fieldOfStudy = $fieldOfStudyRecord->name;
        }
        
        // Prepare user data for temporary storage
        $userData = [
            'name' => $name,
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'], // Store plain password temporarily
            'age' => $data['age'] ?? null,
            'gender' => $data['gender'] ?? null,
            'location' => $data['location'] ?? null,
            'phone' => $data['phone'] ?? null,
            'degree' => $data['degree'] ?? null,
            'fieldOfStudy' => $fieldOfStudy,
            'graduationYear' => $data['graduationYear'] ?? null,
            'experience' => $data['experience'] ?? null,
            'hasCompany' => $data['hasCompany'] ?? null,
            'companyName' => $data['companyName'] ?? null,
            'companyLocation' => $data['companyLocation'] ?? null,
            'employeesCount' => $data['employeesCount'] ?? null,
            'establishmentYear' => $data['establishmentYear'] ?? null,
            'address' => $data['address'] ?? null,
            'website' => $data['website'] ?? null,
        ];
        
        // Generate a unique token for this registration
        $token = Str::uuid()->toString();
        
        // Store registration data temporarily (expires in 24 hours)
        Cache::put('registration_' . $token, $userData, now()->addHours(24));
        
        // Create a new user instance (not persisted) for notification
        $user = new User([
            'email' => $data['email']
        ]);
        
        // Send registration verification notification
        $user->notify(new RegisterVerifyEmail($userData, $token));

        return response()->json([
            'success' => true,
            'message' => 'Registration initiated. Please check your email to verify your account and complete registration.'
        ], 201);
    }

    // Login user with validation from LoginRequest
 public function login(LoginRequest $request)
{
    $data = $request->validated();

    $user = User::where('email', $data['email'])->first();

    if (!$user || !Hash::check($data['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Check if email is verified (unless verification is not required)
    if (env('REQUIRE_EMAIL_VERIFICATION', true) && !$user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Please verify your email address before logging in'], 401);
    }

    // Check if user type matches the expected type from frontend
    if (isset($data['userType'])) {
        switch ($data['userType']) {
            case 'employer':
                // An employer is identified by having hasCompany set (either true or false, but not null)
                if (is_null($user->hasCompany)) {
                    return response()->json(['message' => 'This account is not registered as an employer'], 401);
                }
                break;
            case 'jobseeker':
                // A job seeker is identified by having hasCompany as null
                if (!is_null($user->hasCompany) || $user->is_admin) {
                    return response()->json(['message' => 'This account is not registered as a job seeker'], 401);
                }
                break;
            case 'admin':
                if (!$user->is_admin) {
                    return response()->json(['message' => 'This account is not registered as an admin'], 401);
                }
                break;
        }
    }

    // Generate token using Laravel Sanctum
    $plainTextToken = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'access_token' => $plainTextToken,
        'token_type' => 'Bearer',
        'message' => 'Login successful'
    ]);
}


    // Logout user by deleting current access token
    public function logout()
    {
        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out'
        ]);
    }

    // Get currently authenticated user info
    public function user()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
}
