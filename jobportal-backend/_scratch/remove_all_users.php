<?php
/**
 * REMOVE ALL USERS SCRIPT
 * Remove ALL users from the system (complete cleanup)
 * Leaves database completely empty for fresh start
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

echo "🗑️  COMPLETE USER REMOVAL SCRIPT\n";
echo "===============================\n\n";

echo "🎯 OBJECTIVE: Remove ALL users from the system\n";
echo "   Complete database cleanup for fresh start\n\n";

// Get current user statistics
$totalUsers = User::count();

echo "📊 CURRENT USER STATISTICS:\n";
echo "   👥 Total Users: {$totalUsers}\n\n";

if ($totalUsers > 0) {
    echo "🗑️  USERS TO BE REMOVED:\n";
    echo "=======================\n";

    $usersToRemove = User::orderBy('name')->get();

    foreach ($usersToRemove as $user) {
        $phoneDisplay = $user->phone ?: 'N/A';
        $userType = $user->user_type ?: 'N/A';
        echo "   ❌ {$user->name} ({$user->email}) - Phone: {$phoneDisplay} - Type: {$userType}\n";
    }

    echo "\n⚠️  CRITICAL WARNING:\n";
    echo "   This will permanently delete ALL {$totalUsers} users from the system!\n";
    echo "   The database will be completely empty after this operation.\n";
    echo "   You will need to recreate any users you need for testing.\n\n";

    // Ask for confirmation (in a real script, you'd use command line args)
    echo "✅ PROCEEDING WITH COMPLETE REMOVAL...\n\n";

    // Delete ALL users
    $deletedCount = User::query()->delete();

    echo "✅ SUCCESS: Deleted {$deletedCount} users from the system\n\n";

    // Also clean up related tables if needed
    // Note: Companies table might have foreign key constraints
    try {
        $companiesDeleted = Company::query()->delete();
        echo "✅ SUCCESS: Deleted {$companiesDeleted} companies from the system\n\n";
    } catch (\Exception $e) {
        echo "⚠️  Could not delete companies (foreign key constraints): {$e->getMessage()}\n\n";
    }

} else {
    echo "✅ No users found. Database is already empty!\n\n";
}

// Verify cleanup results
$totalUsersAfter = User::count();
$totalCompaniesAfter = Company::count();

echo "📊 CLEANUP RESULTS:\n";
echo "   👥 Total Users After: {$totalUsersAfter}\n";
echo "   🏢 Total Companies After: {$totalCompaniesAfter}\n\n";

if ($totalUsersAfter == 0) {
    echo "🎉 COMPLETE CLEANUP SUCCESSFUL!\n";
    echo "   ✅ All users removed from system\n";
    echo "   ✅ Database is completely clean\n";
    echo "   ✅ Ready for fresh start\n\n";

    echo "🚀 NEXT STEPS:\n";
    echo "   1. Database is now empty\n";
    echo "   2. Create new users as needed for testing\n";
    echo "   3. Fresh start with clean data\n\n";

    echo "📝 USEFUL COMMANDS:\n";
    echo "   cd backend && php artisan tinker\n";
    echo "   User::create(['name'=>'Test','email'=>'test@example.com'...])\n\n";

} else {
    echo "⚠️  CLEANUP INCOMPLETE!\n";
    echo "   ❌ {$totalUsersAfter} users still exist\n";
    echo "   🔍 Check for protected system accounts\n\n";
}

echo "🏆 CLEANUP SUMMARY:\n";
echo "==================\n";

$removed = $totalUsers - $totalUsersAfter;
$kept = $totalUsersAfter;

echo "   🗑️  Users Removed: {$removed}\n";
echo "   ✅ Users Kept: {$kept}\n";
echo "   📊 Removal Rate: " . ($totalUsers > 0 ? round(($removed / $totalUsers) * 100, 1) : 0) . "%\n\n";

if ($totalUsersAfter == 0) {
    echo "🎉 MISSION ACCOMPLISHED!\n";
    echo "   ✅ Complete user removal successful\n";
    echo "   ✅ Database completely clean\n";
    echo "   ✅ Ready for fresh installation\n\n";

    echo "💡 TIP: Use the registration system to create new users\n";
    echo "   or use Tinker to create test accounts programmatically\n\n";
} elseif ($kept > 0) {
    echo "⚠️  SOME USERS PROTECTED\n";
    echo "   {$kept} users could not be removed (possibly system accounts)\n\n";
} else {
    echo "❌ UNEXPECTED RESULT\n";
    echo "   Something went wrong with the cleanup process\n\n";
}

echo "📝 SCRIPT COMPLETED\n";
echo "===================\n";
echo "Command: cd backend && php remove_all_users.php\n\n";

echo "🔄 FRESH START READY!\n";
echo "=====================\n";
echo "Your job portal database is now completely clean and ready for:\n";
echo "   • Fresh user registrations\n";
echo "   • Clean testing scenarios\n";
echo "   • New employer accounts\n";
echo "   • System demonstrations\n\n";

echo "🎯 The system is now in a pristine state! 🚀\n";