<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Job;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Notification System ===\n\n";

// Get admin user
$admin = User::where('is_admin', true)->first();
if (!$admin) {
    echo "❌ No admin user found. Please create an admin user first.\n";
    exit(1);
}

echo "Admin user found: {$admin->name} (ID: {$admin->id})\n\n";

// Get an employer user (create one if doesn't exist)
$employer = User::where('hasCompany', true)->first();
if (!$employer) {
    echo "Creating test employer...\n";
    $employer = User::create([
        'name' => 'Test Employer',
        'username' => 'test_employer_' . time(),
        'email' => 'employer_' . time() . '@test.com',
        'password' => bcrypt('password123'),
        'is_admin' => false,
        'hasCompany' => true
    ]);
    echo "✓ Test employer created (ID: {$employer->id})\n\n";
} else {
    echo "Using existing employer: {$employer->name} (ID: {$employer->id})\n\n";
}

// Simulate job creation with notification
echo "Creating test job...\n";

$job = Job::create([
    'employer_id' => $employer->id,
    'title' => 'Test Job for Notifications',
    'description' => 'This is a test job to check notification system',
    'location' => 'Test City',
    'job_type' => 'full-time',
    'experience_level' => 'mid',
    'salary_min' => 50000,
    'salary_max' => 70000,
    'category' => 'IT',
    'is_remote' => false,
    'is_active' => true,
    'status' => 'pending'
]);

echo "✓ Job created (ID: {$job->id})\n\n";

// Manually create notification (simulating what happens in JobController)
echo "Creating notification for admin...\n";

$notification = Notification::create([
    'user_id' => $admin->id,
    'type' => 'job_posted',
    'title' => 'New Job Posted for Review',
    'message' => "A new job '{$job->title}' has been posted by {$employer->name} and requires approval.",
    'data' => ['job_id' => $job->id],
    'is_read' => false
]);

echo "✓ Notification created (ID: {$notification->id})\n\n";

// Check notifications for admin
echo "Checking admin notifications...\n";
$adminNotifications = Notification::where('user_id', $admin->id)->get();

echo "Admin has {$adminNotifications->count()} notifications:\n";
foreach ($adminNotifications as $notif) {
    echo "- ID: {$notif->id}, Type: {$notif->type}, Title: {$notif->title}\n";
    echo "  Message: {$notif->message}\n";
    echo "  Read: " . ($notif->is_read ? 'Yes' : 'No') . "\n\n";
}

// Test notification API endpoint
echo "Testing notification API endpoint...\n";
echo "You can test this by:\n";
echo "1. Login as admin user\n";
echo "2. Call GET /api/notifications\n";
echo "3. You should see the notification about the new job\n\n";

// Cleanup
echo "Cleaning up test data...\n";
Notification::where('user_id', $admin->id)->where('data->job_id', $job->id)->delete();
$job->delete();
if (strpos($employer->username, 'test_employer_') === 0) {
    $employer->delete();
    echo "✓ Test employer deleted\n";
}
echo "✓ Test data cleaned up\n\n";

echo "=== Test Complete ===\n";
echo "If you see notifications in the admin interface, the system is working!\n";