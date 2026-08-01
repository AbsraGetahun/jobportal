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

echo "🧪 TESTING PROFILE CONTROLLER PHONE HANDLING\n";
echo "=============================================\n\n";

try {
    // Find a user without phone number
    $user = User::whereNull('phone')->whereNotNull('hasCompany')->first();

    if (!$user) {
        echo "❌ No user found without phone number\n";
        exit(1);
    }

    echo "👤 Found user: {$user->name} (ID: {$user->id})\n";
    echo "📧 Email: {$user->email}\n";
    echo "📱 Current phone: " . ($user->phone ?? 'NULL') . "\n\n";

    // Test 1: Update with phone number via ProfileController
    echo "🧪 TEST 1: Update with phone number via ProfileController\n";
    echo "========================================================\n";

    $requestData1 = [
        'name' => $user->name,
        'phone' => '+251977586823',
        'email' => $user->email
    ];

    $request1 = Request::create('/api/profile', 'PUT', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
    ], json_encode($requestData1));
    $request1->request->add($requestData1);

    // Authenticate user
    \Illuminate\Support\Facades\Auth::login($user);

    $controller = new ProfileController();
    $response1 = $controller->update($request1);

    $updatedUser1 = User::find($user->id);
    echo "📝 Response status: " . $response1->getStatusCode() . "\n";
    echo "📱 Phone after update: " . ($updatedUser1->phone ?? 'NULL') . "\n\n";

    // Test 2: Update with empty string via ProfileController
    echo "🧪 TEST 2: Update with empty string via ProfileController\n";
    echo "=========================================================\n";

    $requestData2 = [
        'name' => $user->name,
        'phone' => '', // Empty string
        'email' => $user->email
    ];

    $request2 = Request::create('/api/profile', 'PUT', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
    ], json_encode($requestData2));
    $request2->request->add($requestData2);

    $response2 = $controller->update($request2);

    $updatedUser2 = User::find($user->id);
    echo "📝 Response status: " . $response2->getStatusCode() . "\n";
    echo "📱 Phone after empty string update: " . ($updatedUser2->phone ?? 'NULL') . "\n";
    echo "📱 Phone type: " . gettype($updatedUser2->phone) . "\n";
    echo "📱 Phone is null?: " . (is_null($updatedUser2->phone) ? 'YES' : 'NO') . "\n\n";

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

    if ($updatedUser1->phone === '+251977586823') {
        echo "✅ Phone number updates work correctly\n";
    } else {
        echo "❌ Phone number updates are NOT working\n";
    }

    if (is_null($updatedUser2->phone)) {
        echo "✅ Empty string to NULL conversion works correctly\n";
    } else {
        echo "❌ Empty string to NULL conversion is NOT working\n";
        echo "   Expected: NULL, Got: '" . ($updatedUser2->phone ?? 'NULL') . "'\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "🔍 Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>