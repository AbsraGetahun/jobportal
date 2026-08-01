<?php
/**
 * REMOVE ALL USERS EXCEPT ADMIN SCRIPT
 * Delete all users except the System Administrator (ID: 1)
 * Keep the admin account for system management
 */

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

echo "🗑️  REMOVE ALL USERS EXCEPT ADMIN\n";
echo "=================================\n\n";

echo "🎯 OBJECTIVE: Remove all users except System Administrator\n";
echo "   Keep admin account (ID: 1) for system management\n\n";

// Get current user statistics
$totalUsers = User::count();
$adminUser = User::find(1);

if (!$adminUser) {
    echo "❌ ERROR: System Administrator (ID: 1) not found!\n";
    echo "   Cannot proceed with cleanup as admin account is missing.\n\n";
    exit(1);
}

echo "👑 ADMIN ACCOUNT TO KEEP:\n";
echo "   ID: {$adminUser->id}\n";
echo "   Name: {$adminUser->name}\n";
echo "   Email: {$adminUser->email}\n\n";

$usersToDelete = User::where('id', '!=', 1)->count();

echo "📊 CLEANUP PLAN:\n";
echo "   👥 Total users: {$totalUsers}\n";
echo "   👑 Admin to keep: 1\n";
echo "   🗑️  Users to delete: {$usersToDelete}\n\n";

if ($usersToDelete > 0) {
    echo "🗑️  USERS TO BE REMOVED:\n";
    echo "=======================\n";

    $users = User::where('id', '!=', 1)->get();

    foreach ($users as $user) {
        echo "   ❌ {$user->name} ({$user->email}) - ID: {$user->id}\n";
    }

    echo "\n⚠️  CONFIRMATION:\n";
    echo "   This will permanently delete {$usersToDelete} users.\n";
    echo "   Only the System Administrator will remain.\n\n";

    // First, delete dependent records to avoid foreign key issues
    echo "🔧 CLEANUP SEQUENCE:\n";
    echo "===================\n\n";

    echo "1️⃣  STEP 1: Delete dependent records\n";

    // Delete records that depend on users
    $dependentTables = [
        'applications' => 'user_id',
        'saved_jobs' => 'user_id',
        'job_views' => 'user_id',
        'notifications' => 'user_id',
        'feedback' => 'user_id',
        'subscriptions' => 'user_id',
        'payments' => 'user_id',
        'companies' => 'user_id',
        'job_listings' => 'employer_id'
    ];

    $totalDependentDeleted = 0;

    foreach ($dependentTables as $table => $foreignKey) {
        try {
            // Delete records where the foreign key references users being deleted
            $userIds = User::where('id', '!=', 1)->pluck('id')->toArray();

            if (!empty($userIds)) {
                $deleted = DB::table($table)->whereIn($foreignKey, $userIds)->delete();
                if ($deleted > 0) {
                    echo "   ✅ Deleted {$deleted} records from {$table}\n";
                    $totalDependentDeleted += $deleted;
                }
            }
        } catch (\Exception $e) {
            echo "   ⚠️  {$table}: {$e->getMessage()}\n";
        }
    }

    echo "\n2️⃣  STEP 2: Delete user accounts\n";

    try {
        $deletedUsers = User::where('id', '!=', 1)->delete();
        echo "   ✅ Deleted {$deletedUsers} user accounts\n\n";
    } catch (\Exception $e) {
        echo "   ❌ Failed to delete users: {$e->getMessage()}\n\n";
        echo "💡 TIP: Try using the force cleanup script if this fails\n";
        echo "   cd backend && php force_cleanup.php\n\n";
        exit(1);
    }

    $totalDeleted = $totalDependentDeleted + $deletedUsers;

    echo "✅ CLEANUP COMPLETED!\n";
    echo "   🗑️  Total records deleted: {$totalDeleted}\n";
    echo "   👑 Admin account preserved: {$adminUser->name}\n\n";

} else {
    echo "✅ No users to delete. Only admin account exists.\n\n";
}

// Verify cleanup results
echo "📊 CLEANUP VERIFICATION:\n";
echo "========================\n";

$finalUserCount = User::count();
$remainingUsers = User::all();

echo "Remaining users:\n";
if ($remainingUsers->count() > 0) {
    foreach ($remainingUsers as $user) {
        echo "   👤 {$user->name} ({$user->email}) - ID: {$user->id}\n";
    }
} else {
    echo "   📭 No users remaining\n";
}

echo "\n📋 FINAL DATABASE STATE:\n";
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

echo "Record counts:\n";
foreach ($finalCounts as $table => $count) {
    echo "   {$table}: {$count} records\n";
}

$totalRemaining = array_sum($finalCounts);
echo "\n   📊 TOTAL RECORDS: {$totalRemaining}\n\n";

if ($finalUserCount == 1 && $remainingUsers->first()->id == 1) {
    echo "🎉 CLEANUP SUCCESSFUL!\n";
    echo "   ✅ All test users removed\n";
    echo "   ✅ System Administrator preserved\n";
    echo "   ✅ Database clean for admin use\n\n";

    echo "🚀 READY FOR ADMIN USE!\n";
    echo "=======================\n\n";

    echo "Your job portal now has:\n";
    echo "   • 1 System Administrator account\n";
    echo "   • Clean database for admin operations\n";
    echo "   • Ready for new user registrations\n";
    echo "   • Admin can manage the system\n\n";

    echo "💡 ADMIN CAN NOW:\n";
    echo "   • Register new users through the web interface\n";
    echo "   • Create test accounts using Tinker:\n";
    echo "     cd backend && php artisan tinker\n";
    echo "     User::create(['name'=>'Test','email'=>'test@example.com'...])\n";
    echo "   • Manage the system through admin panel\n\n";

} elseif ($finalUserCount == 0) {
    echo "⚠️  ALL USERS DELETED!\n";
    echo "   Even the admin account was removed.\n";
    echo "   You may need to recreate the admin account.\n\n";
} else {
    echo "⚠️  UNEXPECTED RESULT!\n";
    echo "   {$finalUserCount} users remain, but admin may not be preserved.\n\n";
}

echo "📝 CLEANUP SUMMARY:\n";
echo "==================\n";

$initialUsers = $totalUsers;
$finalUsers = $finalUserCount;
$usersDeleted = $initialUsers - $finalUsers;

echo "   👥 Initial users: {$initialUsers}\n";
echo "   🗑️  Users deleted: {$usersDeleted}\n";
echo "   👑 Users kept: {$finalUsers} (admin)\n";
echo "   📈 Cleanup rate: " . ($initialUsers > 0 ? round(($usersDeleted / $initialUsers) * 100, 1) : 0) . "%\n\n";

if ($finalUserCount == 1 && $remainingUsers->first()->id == 1) {
    echo "🏆 MISSION ACCOMPLISHED!\n";
    echo "   ✅ All test users removed successfully\n";
    echo "   ✅ System Administrator preserved\n";
    echo "   ✅ Database ready for admin operations\n\n";

    echo "🎯 RESULT: CLEAN ADMIN ENVIRONMENT\n";
    echo "   Your job portal is now ready for admin use!\n\n";
} else {
    echo "⚠️  CLEANUP PARTIALLY COMPLETE\n";
    echo "   Check the remaining users and database state\n\n";
}

echo "👑 ADMIN ACCOUNT DETAILS:\n";
echo "========================\n";
echo "   ID: {$adminUser->id}\n";
echo "   Name: {$adminUser->name}\n";
echo "   Email: {$adminUser->email}\n";
echo "   Role: System Administrator\n\n";

echo "🔐 ADMIN LOGIN:\n";
echo "   Email: {$adminUser->email}\n";
echo "   Password: [Use the original admin password]\n\n";

echo "📝 SCRIPT COMPLETED\n";
echo "===================\n";
echo "Command: cd backend && php remove_all_except_admin.php\n\n";