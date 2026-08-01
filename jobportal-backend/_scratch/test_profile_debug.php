<?php
// Test script to debug profile update issue
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔍 PROFILE UPDATE DEBUG TEST\n";
echo "==============================\n\n";

// Test 1: Check current user data
echo "📋 TEST 1: Current User Data\n";
$user = User::find(22); // Replace with your user ID
if ($user) {
    echo "User ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Phone: " . ($user->phone ?? 'NULL') . "\n";
    echo "Username: " . ($user->username ?? 'NULL') . "\n";
    echo "Location: " . ($user->location ?? 'NULL') . "\n";
} else {
    echo "❌ User not found!\n";
}
echo "\n";

// Test 2: Simulate profile update
echo "📝 TEST 2: Simulating Profile Update\n";

$testData = [
    'name' => 'Test User Updated',
    'phone' => '+1234567890',
    'location' => 'Test City'
    // Removed email to avoid unique constraint error
];

echo "Data to update:\n";
foreach ($testData as $key => $value) {
    echo "  $key: $value\n";
}
echo "\n";

// Update the user directly
$user->update($testData);
$user->refresh();

echo "✅ Update completed!\n";
echo "Updated user data:\n";
echo "Name: " . $user->name . "\n";
echo "Phone: " . ($user->phone ?? 'NULL') . "\n";
echo "Location: " . ($user->location ?? 'NULL') . "\n";
echo "Email: " . $user->email . "\n";

echo "\n🎯 TEST COMPLETE\n";
?>