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

echo "=== Admin System Debug ===\n\n";

// 1. Check admin user
echo "1. Checking admin user...\n";
$admin = User::where('is_admin', true)->first();
if ($admin) {
    echo "✅ Admin found: {$admin->name} (ID: {$admin->id})\n";
    echo "   is_admin field: " . ($admin->is_admin ? 'true' : 'false') . "\n";
    echo "   isAdmin() method: " . ($admin->isAdmin() ? 'true' : 'false') . "\n\n";
} else {
    echo "❌ No admin user found!\n\n";
}

// 2. Check recent jobs
echo "2. Checking recent jobs...\n";
$recentJobs = Job::orderBy('created_at', 'desc')->take(3)->get();
if ($recentJobs->count() > 0) {
    foreach ($recentJobs as $job) {
        echo "   - {$job->title} (ID: {$job->id}, Status: {$job->status})\n";
    }
} else {
    echo "   No jobs found\n";
}
echo "\n";

// 3. Check pending jobs specifically
echo "3. Checking pending jobs...\n";
$pendingJobs = Job::where('status', 'pending')->get();
echo "   Found {$pendingJobs->count()} pending jobs\n";
foreach ($pendingJobs as $job) {
    echo "   - {$job->title} (ID: {$job->id})\n";
}
echo "\n";

// 4. Check admin notifications
echo "4. Checking admin notifications...\n";
if ($admin) {
    $notifications = Notification::where('user_id', $admin->id)->orderBy('created_at', 'desc')->take(5)->get();
    echo "   Found {$notifications->count()} notifications for admin\n";
    foreach ($notifications as $notif) {
        echo "   - {$notif->title}: " . substr($notif->message, 0, 60) . "...\n";
    }
} else {
    echo "   Cannot check notifications - no admin user\n";
}
echo "\n";

// 5. Test notification creation manually
echo "5. Testing manual notification creation...\n";
if ($admin) {
    $testNotification = Notification::create([
        'user_id' => $admin->id,
        'type' => 'test_notification',
        'title' => 'Test Notification',
        'message' => 'This is a test notification to verify the system works',
        'data' => ['test' => true],
        'is_read' => false
    ]);

    echo "✅ Test notification created (ID: {$testNotification->id})\n";

    // Check if it was created
    $checkNotification = Notification::find($testNotification->id);
    if ($checkNotification) {
        echo "✅ Notification verified in database\n";
    } else {
        echo "❌ Notification not found in database\n";
    }
} else {
    echo "   Cannot test - no admin user\n";
}
echo "\n";

// 6. Check if notifications table exists
echo "6. Checking notifications table...\n";
try {
    $notificationCount = Notification::count();
    echo "✅ Notifications table exists with {$notificationCount} records\n";
} catch (Exception $e) {
    echo "❌ Notifications table issue: " . $e->getMessage() . "\n";
}
echo "\n";

echo "=== Debug Complete ===\n";
echo "If you see issues above, please let me know which ones need fixing.\n";