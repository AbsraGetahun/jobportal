<?php
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configure the database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => __DIR__ . '/database/database.sqlite',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "🔍 PHONE UPDATE DEBUG TEST\n";
echo "==========================\n\n";

try {
    // Find a user without phone number
    $user = Capsule::table('users')
        ->whereNull('phone')
        ->whereNotNull('hasCompany') // Focus on employers
        ->first();

    if (!$user) {
        echo "❌ No user found without phone number\n";
        exit(1);
    }

    echo "👤 Found user: {$user->name} (ID: {$user->id})\n";
    echo "📧 Email: {$user->email}\n";
    echo "📱 Current phone: " . ($user->phone ?? 'NULL') . "\n\n";

    // Test 1: Update with phone number
    echo "🧪 TEST 1: Update with phone number\n";
    echo "===================================\n";

    $updateData = ['phone' => '+251977586823'];
    $result = Capsule::table('users')->where('id', $user->id)->update($updateData);

    $updatedUser = Capsule::table('users')->find($user->id);
    echo "📝 Update result: $result\n";
    echo "📱 Phone after update: " . ($updatedUser->phone ?? 'NULL') . "\n\n";

    // Test 2: Update with empty string
    echo "🧪 TEST 2: Update with empty string\n";
    echo "==================================\n";

    $updateData2 = ['phone' => ''];
    $result2 = Capsule::table('users')->where('id', $user->id)->update($updateData2);

    $updatedUser2 = Capsule::table('users')->find($user->id);
    echo "📝 Update result: $result2\n";
    echo "📱 Phone after empty string update: " . ($updatedUser2->phone ?? 'NULL') . "\n\n";

    // Test 3: Update with null
    echo "🧪 TEST 3: Update with null\n";
    echo "==========================\n";

    $updateData3 = ['phone' => null];
    $result3 = Capsule::table('users')->where('id', $user->id)->update($updateData3);

    $updatedUser3 = Capsule::table('users')->find($user->id);
    echo "📝 Update result: $result3\n";
    echo "📱 Phone after null update: " . ($updatedUser3->phone ?? 'NULL') . "\n\n";

    // Test 4: Check database directly
    echo "🧪 TEST 4: Direct database check\n";
    echo "===============================\n";

    $pdo = $capsule->getConnection()->getPdo();
    $stmt = $pdo->prepare("SELECT phone FROM users WHERE id = ?");
    $stmt->execute([$user->id]);
    $dbResult = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "📊 Raw database value: " . ($dbResult['phone'] ?? 'NULL') . "\n";
    echo "📊 Database value type: " . gettype($dbResult['phone'] ?? null) . "\n\n";

    echo "🎯 CONCLUSION:\n";
    echo "=============\n";

    if ($updatedUser->phone === '+251977586823') {
        echo "✅ Phone number updates work correctly\n";
    } else {
        echo "❌ Phone number updates are NOT working\n";
    }

    if (is_null($updatedUser3->phone)) {
        echo "✅ NULL updates work correctly\n";
    } else {
        echo "❌ NULL updates are NOT working\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "🔍 Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>