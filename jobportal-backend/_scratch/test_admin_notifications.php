<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing Admin Notifications System\n";
echo "===================================\n\n";

// Test 1: Check if admin users exist
echo "Test 1: Checking for admin users...\n";
$admins = User::where('is_admin', true)->get();
if ($admins->isEmpty()) {
    echo "❌ No admin users found. Creating a test admin...\n";

    // Create a test admin user
    $admin = User::create([
        'name' => 'Test Admin',
        'username' => 'testadmin',
        'email' => 'admin@test.com',
        'password' => bcrypt('password'),
        'is_admin' => true,
        'email_verified_at' => now(),
    ]);

    echo "✅ Created test admin: {$admin->name} ({$admin->email})\n";
    $admins = collect([$admin]);
} else {
    echo "✅ Found " . $admins->count() . " admin user(s)\n";
    foreach ($admins as $admin) {
        echo "   - {$admin->name} ({$admin->email})\n";
    }
}

echo "\n";

// Clean up any existing test data first
User::where('email', 'like', 'jobseeker@test.com')->delete();
User::where('email', 'like', 'employer@test.com')->delete();
Job::where('title', 'like', 'Test Software Developer Position%')->delete();

// Test 2: Test user registration notification
echo "Test 2: Testing user registration notification...\n";
$testUser = User::create([
    'name' => 'Test Job Seeker',
    'username' => 'testjobseeker_' . time(),
    'email' => 'jobseeker_' . time() . '@test.com',
    'password' => bcrypt('password'),
    'hasCompany' => null, // Job seeker
    'email_verified_at' => now(),
]);

echo "✅ Created test user: {$testUser->name}\n";

// Trigger notification manually
NotificationService::notifyAdminNewUser($testUser);

// Check if notification was created
$notifications = Notification::where('type', 'new_user_registration')
    ->where('user_id', $admins->first()->id)
    ->where('data->user_email', $testUser->email)
    ->get();

if ($notifications->isNotEmpty()) {
    echo "✅ Admin notification created for new user registration\n";
    echo "   Title: " . $notifications->first()->title . "\n";
    echo "   Message: " . $notifications->first()->message . "\n";
} else {
    echo "❌ Admin notification NOT created for new user registration\n";
}

echo "\n";

// Test 3: Test job posting notification
echo "Test 3: Testing job posting notification...\n";

// Create a test employer first
$employer = User::create([
    'name' => 'Test Employer',
    'username' => 'testemployer_' . time(),
    'email' => 'employer_' . time() . '@test.com',
    'password' => bcrypt('password'),
    'hasCompany' => true,
    'companyName' => 'Test Company',
    'email_verified_at' => now(),
]);

$testJob = Job::create([
    'title' => 'Test Software Developer Position',
    'description' => 'This is a test job posting for software developer',
    'location' => 'Nairobi, Kenya',
    'job_type' => 'full-time',
    'experience_level' => 'mid-level',
    'salary_min' => 50000,
    'salary_max' => 80000,
    'salary_type' => 'monthly',
    'category' => 'Technology',
    'employer_id' => $employer->id,
    'is_active' => true,
    'status' => 'pending',
]);

echo "✅ Created test job: {$testJob->title}\n";

// Trigger notification manually
NotificationService::notifyAdminNewJob($testJob);

// Check if notification was created
$jobNotifications = Notification::where('type', 'new_job_posting')
    ->where('user_id', $admins->first()->id)
    ->where('data->job_title', $testJob->title)
    ->get();

if ($jobNotifications->isNotEmpty()) {
    echo "✅ Admin notification created for new job posting\n";
    echo "   Title: " . $jobNotifications->first()->title . "\n";
    echo "   Message: " . $jobNotifications->first()->message . "\n";
} else {
    echo "❌ Admin notification NOT created for new job posting\n";
}

echo "\n";

// Test 4: Test job application notification
echo "Test 4: Testing job application notification...\n";

$testApplication = Application::create([
    'user_id' => $testUser->id,
    'job_id' => $testJob->id,
    'cover_letter' => 'This is a test application cover letter',
    'status' => 'pending',
]);

echo "✅ Created test application for job: {$testJob->title}\n";

// Trigger notification manually
NotificationService::notifyAdminNewApplication($testApplication);

// Check if notification was created
$appNotifications = Notification::where('type', 'new_job_application')
    ->where('user_id', $admins->first()->id)
    ->where('application_id', $testApplication->id)
    ->get();

if ($appNotifications->isNotEmpty()) {
    echo "✅ Admin notification created for new job application\n";
    echo "   Title: " . $appNotifications->first()->title . "\n";
    echo "   Message: " . $appNotifications->first()->message . "\n";
} else {
    echo "❌ Admin notification NOT created for new job application\n";
}

echo "\n";

// Summary
echo "Summary:\n";
echo "========\n";
$totalNotifications = Notification::whereIn('user_id', $admins->pluck('id'))->count();
echo "Total notifications in system: $totalNotifications\n";

$userRegCount = Notification::where('type', 'new_user_registration')->count();
$jobPostCount = Notification::where('type', 'new_job_posting')->count();
$jobAppCount = Notification::where('type', 'new_job_application')->count();

echo "User registration notifications: $userRegCount\n";
echo "Job posting notifications: $jobPostCount\n";
echo "Job application notifications: $jobAppCount\n";

echo "\n✅ Admin notification system test completed!\n";

// Clean up test data
echo "\nCleaning up test data...\n";
$testApplication->delete();
$testJob->delete();
$employer->delete();
$testUser->delete();

if (!User::where('email', 'admin@test.com')->exists()) {
    echo "Note: Test admin user was not created (already existed)\n";
}

echo "✅ Test data cleaned up\n";