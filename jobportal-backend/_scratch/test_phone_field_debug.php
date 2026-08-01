<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;
use App\Models\User;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 TESTING PHONE FIELD DEBUG\n";
echo "============================\n\n";

try {
    // Find a user to test with
    $user = User::find(29); // Use the same user ID from the logs

    if (!$user) {
        echo "❌ User with ID 29 not found\n";
        exit(1);
    }

    echo "👤 Found user: {$user->name} (ID: {$user->id})\n";
    echo "📧 Email: {$user->email}\n";
    echo "📱 Current phone: " . ($user->phone ?? 'NULL') . "\n\n";

    // Test 1: Direct model update
    echo "🧪 TEST 1: Direct model update\n";
    echo "===============================\n";

    $user->phone = '+251977586824';
    $user->save();

    echo "📱 Phone after direct update: " . ($user->phone ?? 'NULL') . "\n";

    // Refresh from database
    $user->refresh();
    echo "📱 Phone after refresh: " . ($user->phone ?? 'NULL') . "\n\n";

    // Test 2: Mass assignment update
    echo "🧪 TEST 2: Mass assignment update\n";
    echo "==================================\n";

    $user->update(['phone' => '+251977586825']);
    echo "📱 Phone after mass assignment: " . ($user->phone ?? 'NULL') . "\n";

    // Refresh from database
    $user->refresh();
    echo "📱 Phone after refresh: " . ($user->phone ?? 'NULL') . "\n\n";

    // Test 3: Check database directly
    echo "🧪 TEST 3: Direct database check\n";
    echo "===============================\n";

    $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
    $stmt = $pdo->prepare("SELECT phone FROM users WHERE id = ?");
    $stmt->execute([$user->id]);
    $dbResult = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "📊 Raw database value: " . ($dbResult['phone'] ?? 'NULL') . "\n";
    echo "📊 Database value type: " . gettype($dbResult['phone'] ?? null) . "\n\n";

    echo "🎯 CONCLUSION:\n";
    echo "=============\n";

    if ($user->phone === '+251977586825') {
        echo "✅ Phone field updates are working correctly\n";
    } else {
        echo "❌ Phone field updates are NOT working\n";
        echo "   Expected: +251977586825, Got: " . ($user->phone ?? 'NULL') . "\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "🔍 Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>