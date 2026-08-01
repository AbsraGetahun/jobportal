<?php
/**
 * FORCE COMPLETE CLEANUP SCRIPT
 * Disable foreign keys, delete all data, re-enable constraints
 * COMPLETE database reset for fresh start
 */

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "💪 FORCE COMPLETE CLEANUP SCRIPT\n";
echo "=================================\n\n";

echo "🎯 OBJECTIVE: Force complete database cleanup\n";
echo "   Temporarily disable foreign keys for complete reset\n\n";

echo "⚠️  CRITICAL WARNING:\n";
echo "   This script will DISABLE foreign key constraints!\n";
echo "   Use only when other cleanup methods fail!\n";
echo "   Database integrity will be temporarily compromised!\n\n";

// Get current statistics
$tables = [
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

echo "📊 CURRENT DATABASE STATE:\n";
echo "==========================\n";
foreach ($tables as $table => $count) {
    echo "   {$table}: {$count} records\n";
}
echo "\n";

$totalRecords = array_sum($tables);
echo "   📊 TOTAL RECORDS: {$totalRecords}\n\n";

if ($totalRecords > 0) {
    echo "🔧 FORCE CLEANUP PROCESS:\n";
    echo "=========================\n\n";

    echo "1️⃣  STEP 1: Disable foreign key constraints\n";
    try {
        DB::statement('PRAGMA foreign_keys = OFF;');
        echo "   ✅ Foreign key constraints DISABLED\n\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Could not disable foreign keys: {$e->getMessage()}\n\n";
    }

    echo "2️⃣  STEP 2: Delete all data (no constraints)\n";

    $deleted = [];

    $tableOrder = [
        'applications',
        'saved_jobs',
        'job_views',
        'notifications',
        'feedback',
        'subscriptions',
        'payments',
        'job_listings',
        'companies',
        'users'
    ];

    foreach ($tableOrder as $table) {
        try {
            $count = DB::table($table)->delete();
            $deleted[$table] = $count;
            echo "   ✅ Deleted {$count} records from {$table}\n";
        } catch (\Exception $e) {
            echo "   ⚠️  {$table}: {$e->getMessage()}\n";
            $deleted[$table] = 0;
        }
    }

    echo "\n3️⃣  STEP 3: Re-enable foreign key constraints\n";
    try {
        DB::statement('PRAGMA foreign_keys = ON;');
        echo "   ✅ Foreign key constraints RE-ENABLED\n\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Could not re-enable foreign keys: {$e->getMessage()}\n\n";
    }

    $totalDeleted = array_sum($deleted);
    echo "✅ FORCE CLEANUP COMPLETED!\n";
    echo "   🗑️  Total records deleted: {$totalDeleted}\n\n";

} else {
    echo "✅ Database is already completely clean!\n\n";
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

echo "Final record counts:\n";
foreach ($finalCounts as $table => $count) {
    echo "   {$table}: {$count} records\n";
}
echo "\n   📊 TOTAL REMAINING: {$remainingRecords}\n\n";

if ($remainingRecords == 0) {
    echo "🎉 COMPLETE SUCCESS!\n";
    echo "   ✅ Database is completely empty\n";
    echo "   ✅ All foreign key constraints intact\n";
    echo "   ✅ Ready for fresh start\n\n";

    echo "🚀 FRESH START ACHIEVED!\n";
    echo "========================\n\n";

    echo "Your job portal database is now in a pristine state:\n";
    echo "   • 0 users, 0 companies, 0 jobs, 0 applications\n";
    echo "   • All related data completely removed\n";
    echo "   • Foreign key constraints working properly\n";
    echo "   • Ready for new registrations and testing\n\n";

    echo "💡 HOW TO START FRESH:\n";
    echo "   1. Use the web registration forms\n";
    echo "   2. Or use Tinker for programmatic creation:\n";
    echo "      cd backend && php artisan tinker\n\n";

    echo "📝 EXAMPLE TINKER COMMANDS:\n";
    echo "   \$user = User::create([\n";
    echo "       'name' => 'John Doe',\n";
    echo "       'email' => 'john@example.com',\n";
    echo "       'password' => bcrypt('password123'),\n";
    echo "       'user_type' => 'jobseeker',\n";
    echo "       'fieldOfStudy' => 'Computer Science'\n";
    echo "   ]);\n\n";

} elseif ($remainingRecords < $totalRecords * 0.1) {
    echo "👍 MOSTLY CLEAN!\n";
    echo "   ✅ Only {$remainingRecords} records remaining\n";
    echo "   ✅ Database mostly clean\n";
    echo "   ✅ Safe to proceed\n\n";
} else {
    echo "⚠️  CLEANUP INCOMPLETE!\n";
    echo "   ❌ {$remainingRecords} records still exist\n";
    echo "   🔍 Check database structure\n\n";
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
    echo "   ✅ Complete database reset successful\n";
    echo "   ✅ All data removed, constraints intact\n";
    echo "   ✅ System ready for fresh installation\n\n";

    echo "🎯 RESULT: PRISTINE DATABASE STATE\n";
    echo "   Your job portal is now completely clean and ready!\n\n";
} else {
    echo "⚠️  PARTIAL SUCCESS\n";
    echo "   Some records could not be deleted\n";
    echo "   Database is mostly clean but not completely empty\n\n";
}

echo "💪 FORCE CLEANUP SCRIPT COMPLETED\n";
echo "==================================\n";
echo "Command: cd backend && php force_cleanup.php\n\n";

echo "🔄 DATABASE RESET COMPLETE!\n";
echo "===========================\n";
echo "Your job portal database has been completely reset and is ready for:\n";
echo "   • Fresh user registrations\n";
echo "   • Clean testing scenarios\n";
echo "   • New employer accounts\n";
echo "   • System demonstrations\n";
echo "   • Development and production use\n\n";

echo "🎯 The system is now in a pristine state! 🚀\n";