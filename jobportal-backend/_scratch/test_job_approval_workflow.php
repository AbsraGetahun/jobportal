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

echo "=== Job Approval Workflow Test ===\n\n";

// Test 1: Create a test employer
echo "1. Creating test employer...\n";
$employer = User::create([
    'name' => 'Test Employer',
    'username' => 'test_employer_' . time(),
    'email' => 'test_employer_' . time() . '@example.com',
    'password' => bcrypt('password123'),
    'is_admin' => false,
    'hasCompany' => true
]);
echo "✓ Employer created with ID: {$employer->id}\n\n";

// Test 2: Create a test admin
echo "2. Creating test admin...\n";
$admin = User::create([
    'name' => 'Test Admin',
    'username' => 'test_admin_' . time(),
    'email' => 'test_admin_' . time() . '@example.com',
    'password' => bcrypt('password123'),
    'is_admin' => true,
    'hasCompany' => false
]);
echo "✓ Admin created with ID: {$admin->id}\n\n";

// Test 3: Create a job (should be pending)
echo "3. Creating test job...\n";
$job = Job::create([
    'employer_id' => $employer->id,
    'title' => 'Test Software Developer',
    'description' => 'This is a test job posting',
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
echo "✓ Job created with ID: {$job->id}, Status: {$job->status}\n\n";

// Test 4: Check if notification was created for admin
echo "4. Checking admin notifications...\n";
$adminNotifications = Notification::where('user_id', $admin->id)
    ->where('type', 'job_posted')
    ->where('data->job_id', $job->id)
    ->get();

if ($adminNotifications->count() > 0) {
    echo "✓ Admin notification created: {$adminNotifications->first()->message}\n\n";
} else {
    echo "✗ No admin notification found\n\n";
}

// Test 5: Approve the job
echo "5. Approving the job...\n";
$job->update(['status' => 'approved']);
echo "✓ Job status updated to: {$job->status}\n\n";

// Test 6: Check if notification was created for employer
echo "6. Checking employer notifications...\n";
$employerNotifications = Notification::where('user_id', $employer->id)
    ->where('type', 'job_approved')
    ->where('data->job_id', $job->id)
    ->get();

if ($employerNotifications->count() > 0) {
    echo "✓ Employer notification created: {$employerNotifications->first()->message}\n\n";
} else {
    echo "✗ No employer notification found\n\n";
}

// Test 7: Check if approved job appears in public listings
echo "7. Checking if approved job appears in public listings...\n";
$publicJobs = Job::where('status', 'approved')
    ->where('is_active', true)
    ->get();

$found = false;
foreach ($publicJobs as $publicJob) {
    if ($publicJob->id === $job->id) {
        $found = true;
        break;
    }
}

if ($found) {
    echo "✓ Approved job appears in public listings\n\n";
} else {
    echo "✗ Approved job does not appear in public listings\n\n";
}

// Test 8: Reject the job
echo "8. Rejecting the job...\n";
$job->update(['status' => 'rejected']);
echo "✓ Job status updated to: {$job->status}\n\n";

// Test 9: Check rejection notification
echo "9. Checking rejection notification...\n";
$rejectionNotifications = Notification::where('user_id', $employer->id)
    ->where('type', 'job_rejected')
    ->where('data->job_id', $job->id)
    ->get();

if ($rejectionNotifications->count() > 0) {
    echo "✓ Rejection notification created: {$rejectionNotifications->first()->message}\n\n";
} else {
    echo "✗ No rejection notification found\n\n";
}

// Test 10: Check if rejected job doesn't appear in public listings
echo "10. Checking if rejected job doesn't appear in public listings...\n";
$publicJobsAfterRejection = Job::where('status', 'approved')
    ->where('is_active', true)
    ->get();

$stillFound = false;
foreach ($publicJobsAfterRejection as $publicJob) {
    if ($publicJob->id === $job->id) {
        $stillFound = true;
        break;
    }
}

if (!$stillFound) {
    echo "✓ Rejected job does not appear in public listings\n\n";
} else {
    echo "✗ Rejected job still appears in public listings\n\n";
}

// Cleanup
echo "11. Cleaning up test data...\n";
Notification::where('user_id', $employer->id)->orWhere('user_id', $admin->id)->delete();
$job->delete();
$employer->delete();
$admin->delete();
echo "✓ Test data cleaned up\n\n";

echo "=== Test Complete ===\n";
echo "If all tests passed (marked with ✓), the job approval workflow is working correctly!\n";