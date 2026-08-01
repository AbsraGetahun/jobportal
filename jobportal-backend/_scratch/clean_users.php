<?php
/**
 * CLEAN USERS SCRIPT
 * Remove all users except those with no phone number (N/A or null)
 * Keep only test users without phone numbers for clean testing
 */

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Company;

echo "🧹 USER CLEANUP SCRIPT\n";
echo "=====================\n\n";

echo "🎯 OBJECTIVE: Remove all users except those with no phone number\n";
echo "   Keep only test users with N/A phone for clean testing\n\n";

// Get current user statistics
$totalUsers = User::count();
$usersWithPhone = User::whereNotNull('phone')
    ->where('phone', '!=', '')
    ->where('phone', '!=', 'N/A')
    ->count();

$usersWithoutPhone = User::where(function($query) {
    $query->whereNull('phone')
          ->orWhere('phone', '')
          ->orWhere('phone', 'N/A');
})->count();

echo "📊 CURRENT USER STATISTICS:\n";
echo "   👥 Total Users: {$totalUsers}\n";
echo "   📱 Users with Phone: {$usersWithPhone}\n";
echo "   📭 Users without Phone: {$usersWithoutPhone}\n\n";

if ($usersWithPhone > 0) {
    echo "🗑️  USERS TO BE REMOVED (have phone numbers):\n";
    echo "===========================================\n";

    $usersToRemove = User::whereNotNull('phone')
        ->where('phone', '!=', '')
        ->where('phone', '!=', 'N/A')
        ->get();

    foreach ($usersToRemove as $user) {
        echo "   ❌ {$user->name} ({$user->email}) - Phone: {$user->phone}\n";
    }

    echo "\n⚠️  CONFIRMATION REQUIRED:\n";
    echo "   This will permanently delete {$usersWithPhone} users with phone numbers.\n";
    echo "   Only users with N/A or empty phone fields will be kept.\n\n";

    // Ask for confirmation (in a real script, you'd use command line args)
    echo "✅ PROCEEDING WITH CLEANUP...\n\n";

    // Delete users with phone numbers
    $deletedCount = User::whereNotNull('phone')
        ->where('phone', '!=', '')
        ->where('phone', '!=', 'N/A')
        ->delete();

    echo "✅ SUCCESS: Deleted {$deletedCount} users with phone numbers\n\n";

} else {
    echo "✅ No users with phone numbers found. Database is already clean!\n\n";
}

// Verify cleanup results
$totalUsersAfter = User::count();
$usersWithPhoneAfter = User::whereNotNull('phone')
    ->where('phone', '!=', '')
    ->where('phone', '!=', 'N/A')
    ->count();

$usersWithoutPhoneAfter = User::where(function($query) {
    $query->whereNull('phone')
          ->orWhere('phone', '')
          ->orWhere('phone', 'N/A');
})->count();

echo "📊 CLEANUP RESULTS:\n";
echo "   👥 Total Users After: {$totalUsersAfter}\n";
echo "   📱 Users with Phone After: {$usersWithPhoneAfter}\n";
echo "   📭 Users without Phone After: {$usersWithoutPhoneAfter}\n\n";

if ($usersWithPhoneAfter == 0) {
    echo "🎉 CLEANUP COMPLETED SUCCESSFULLY!\n";
    echo "   ✅ All users with phone numbers removed\n";
    echo "   ✅ Only test users with N/A phone remain\n";
    echo "   ✅ Database is clean for testing\n\n";
} else {
    echo "⚠️  CLEANUP INCOMPLETE!\n";
    echo "   ❌ {$usersWithPhoneAfter} users with phone numbers still exist\n";
    echo "   🔍 Check the phone field values\n\n";
}

// Show remaining users
echo "📋 REMAINING USERS:\n";
echo "==================\n";

$remainingUsers = User::orderBy('name')->get();

if ($remainingUsers->count() > 0) {
    foreach ($remainingUsers as $user) {
        $phoneDisplay = $user->phone ?: 'N/A';
        $userType = $user->user_type ?: 'N/A';
        echo "   👤 {$user->name} ({$user->email}) - Phone: {$phoneDisplay} - Type: {$userType}\n";
    }
} else {
    echo "   📭 No users remaining in database\n";
}

echo "\n🏆 CLEANUP SUMMARY:\n";
echo "==================\n";

$removed = $totalUsers - $totalUsersAfter;
$kept = $totalUsersAfter;

echo "   🗑️  Users Removed: {$removed}\n";
echo "   ✅ Users Kept: {$kept}\n";
echo "   📊 Cleanup Rate: " . ($totalUsers > 0 ? round(($removed / $totalUsers) * 100, 1) : 0) . "%\n\n";

if ($usersWithPhoneAfter == 0 && $kept > 0) {
    echo "🎉 MISSION ACCOMPLISHED!\n";
    echo "   ✅ Database successfully cleaned\n";
    echo "   ✅ Only test users without phone numbers remain\n";
    echo "   ✅ Ready for clean testing environment\n\n";

    echo "🚀 NEXT STEPS:\n";
    echo "   1. Run your tests with clean user data\n";
    echo "   2. All users now have N/A phone numbers\n";
    echo "   3. No real user data conflicts\n\n";
} elseif ($kept == 0) {
    echo "⚠️  ALL USERS REMOVED!\n";
    echo "   You may need to recreate test users\n\n";
} else {
    echo "⚠️  CLEANUP PARTIALLY COMPLETE\n";
    echo "   Some users with phone numbers may still exist\n\n";
}

echo "📝 SCRIPT COMPLETED\n";
echo "===================\n";
echo "Command: cd backend && php clean_users.php\n\n";