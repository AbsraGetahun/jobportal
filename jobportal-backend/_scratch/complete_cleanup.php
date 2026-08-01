<?php
/**
 * COMPLETE DATABASE CLEANUP SCRIPT
 * Remove ALL data while respecting foreign key constraints
 * Leaves database completely clean for fresh start
 */

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🧹 COMPLETE DATABASE CLEANUP SCRIPT\n";
echo "===================================\n\n";

echo "🎯 OBJECTIVE: Complete database cleanup respecting foreign keys\n";
echo "   Remove all data in correct order to avoid constraint violations\n\n";

// Get current statistics
$tables = [
    'users' => \App\Models\User::count(),
    'companies' => \App\Models\Company::count(),
    'job_listings' => \App\Models\Job::count(),
    'applications' => \App\Models\Application::count(),
    'saved_jobs' => \App\Models\SavedJob::count(),
    'job_views' => \App\Models\JobView::count(),
    'notifications' => \App\Models\Notification::count(),
    'feedback' => \App\Models\Feedback::count(),
    'subscriptions' => \App\Models\Subscription::count(),
    'payments' => \App\Models\Payment::count(),
];

echo "📊 CURRENT DATABASE STATISTICS:\n";
echo "===============================\n";
foreach ($tables as $table => $count) {
    echo "   {$table}: {$count} records\n";
}
echo "\n";

$totalRecords = array_sum($tables);
echo "   📊 TOTAL RECORDS: {$totalRecords}\n\n";

if ($totalRecords > 0) {
    echo "🗑️  CLEANUP SEQUENCE (respecting foreign keys):\n";
    echo "===============================================\n\n";

    echo "1️⃣  STEP 1: Delete dependent records first\n";
    echo "   • Applications (depends on users, jobs)\n";
    echo "   • Saved jobs (depends on users, jobs)\n";
    echo "   • Job views (depends on users, jobs)\n";
    echo "   • Notifications (depends on users)\n";
    echo "   • Feedback (depends on users)\n";
    echo "   • Subscriptions (depends on users)\n";
    echo "   • Payments (depends on users)\n\n";

    // Delete in order of dependencies
    $deleted = [];

    try {
        $deleted['applications'] = DB::table('applications')->delete();
        echo "   ✅ Deleted {$deleted['applications']} applications\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Applications: {$e->getMessage()}\n";
    }

    try {
        $deleted['saved_jobs'] = DB::table('saved_jobs')->delete();
        echo "   ✅ Deleted {$deleted['saved_jobs']} saved jobs\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Saved jobs: {$e->getMessage()}\n";
    }

    try {
        $deleted['job_views'] = DB::table('job_views')->delete();
        echo "   ✅ Deleted {$deleted['job_views']} job views\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Job views: {$e->getMessage()}\n";
    }

    try {
        $deleted['notifications'] = DB::table('notifications')->delete();
        echo "   ✅ Deleted {$deleted['notifications']} notifications\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Notifications: {$e->getMessage()}\n";
    }

    try {
        $deleted['feedback'] = DB::table('feedback')->delete();
        echo "   ✅ Deleted {$deleted['feedback']} feedback records\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Feedback: {$e->getMessage()}\n";
    }

    try {
        $deleted['subscriptions'] = DB::table('subscriptions')->delete();
        echo "   ✅ Deleted {$deleted['subscriptions']} subscriptions\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Subscriptions: {$e->getMessage()}\n";
    }

    try {
        $deleted['payments'] = DB::table('payments')->delete();
        echo "   ✅ Deleted {$deleted['payments']} payments\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Payments: {$e->getMessage()}\n";
    }

    echo "\n2️⃣  STEP 2: Delete main entities\n";
    echo "   • Job listings (depends on users/companies)\n";
    echo "   • Companies (depends on users)\n";
    echo "   • Users (no dependencies)\n\n";

    try {
        $deleted['job_listings'] = DB::table('job_listings')->delete();
        echo "   ✅ Deleted {$deleted['job_listings']} job listings\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Job listings: {$e->getMessage()}\n";
    }

    try {
        $deleted['companies'] = DB::table('companies')->delete();
        echo "   ✅ Deleted {$deleted['companies']} companies\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Companies: {$e->getMessage()}\n";
    }

    try {
        $deleted['users'] = DB::table('users')->delete();
        echo "   ✅ Deleted {$deleted['users']} users\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Users: {$e->getMessage()}\n";
    }

    $totalDeleted = array_sum($deleted);
    echo "\n✅ CLEANUP COMPLETED!\n";
    echo "   🗑️  Total records deleted: {$totalDeleted}\n\n";

} else {
    echo "✅ Database is already clean!\n\n";
}

// Verify cleanup results
echo "📊 CLEANUP VERIFICATION:\n";
echo "========================\n";

$finalCounts = [
    'users' => DB::table('users')->count(),
    'companies' => DB::table('companies')->count(),
    'job_listings' => DB::table('job_listings')->count(),
    'applications' => DB::table('applications')->count(),
    'saved_jobs' => DB::table('saved_jobs')->count(),
    'job_views' => DB::table('job_views')->count(),
    'notifications' => DB::table('notifications')->count(),
    'feedback' => DB::table('feedback')->count(),
    'subscriptions' => DB::table('subscriptions')->count(),
    'payments' => DB::table('payments')->count(),
];

$remainingRecords = array_sum($finalCounts);

echo "Remaining records:\n";
foreach ($finalCounts as $table => $count) {
    echo "   {$table}: {$count} records\n";
}
echo "\n   📊 TOTAL REMAINING: {$remainingRecords}\n\n";

if ($remainingRecords == 0) {
    echo "🎉 COMPLETE SUCCESS!\n";
    echo "   ✅ Database is completely clean\n";
    echo "   ✅ All foreign key constraints respected\n";
    echo "   ✅ Ready for fresh start\n\n";

    echo "🚀 FRESH START READY!\n";
    echo "=====================\n\n";

    echo "Your job portal database is now in a pristine state:\n";
    echo "   • 0 users, 0 companies, 0 jobs\n";
    echo "   • All related data cleaned up\n";
    echo "   • Foreign key constraints intact\n";
    echo "   • Ready for new registrations\n\n";

    echo "💡 HOW TO START FRESH:\n";
    echo "   1. Use the web interface to register new users\n";
    echo "   2. Or use Tinker for programmatic user creation:\n";
    echo "      cd backend && php artisan tinker\n";
    echo "      User::create(['name'=>'Test','email'=>'test@example.com'...])\n\n";

} elseif ($remainingRecords < $totalRecords * 0.1) {
    echo "👍 MOSTLY CLEAN!\n";
    echo "   ✅ {$remainingRecords} records remaining (minimal)\n";
    echo "   ✅ Database mostly clean\n";
    echo "   ✅ Safe to proceed\n\n";
} else {
    echo "⚠️  CLEANUP INCOMPLETE!\n";
    echo "   ❌ {$remainingRecords} records still exist\n";
    echo "   🔍 Check foreign key relationships\n\n";
}

echo "📝 CLEANUP SUMMARY:\n";
echo "==================\n";

$initialTotal = $totalRecords;
$finalTotal = $remainingRecords;
$actuallyDeleted = $initialTotal - $finalTotal;

echo "   📊 Initial records: {$initialTotal}\n";
echo "   🗑️  Records deleted: {$actuallyDeleted}\n";
echo "   ✅ Records remaining: {$finalTotal}\n";
echo "   📈 Cleanup rate: " . ($initialTotal > 0 ? round(($actuallyDeleted / $initialTotal) * 100, 1) : 0) . "%\n\n";

if ($finalTotal == 0) {
    echo "🏆 MISSION ACCOMPLISHED!\n";
    echo "   ✅ Complete database cleanup successful\n";
    echo "   ✅ All data removed respecting constraints\n";
    echo "   ✅ System ready for fresh installation\n\n";
} else {
    echo "⚠️  PARTIAL SUCCESS\n";
    echo "   Some records could not be deleted due to constraints\n";
    echo "   Database is mostly clean but not completely empty\n\n";
}

echo "🎯 CLEANUP SCRIPT COMPLETED\n";
echo "===========================\n";
echo "Command: cd backend && php complete_cleanup.php\n\n";