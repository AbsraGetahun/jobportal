<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Models\User;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get the admin user
$admin = User::where('is_admin', true)->first();

if (!$admin) {
    echo "No admin user found!\n";
    exit(1);
}

echo "Admin user found: {$admin->email}\n";

// Create a test token for the admin user
$token = $admin->createToken('test-token')->plainTextToken;

echo "Generated token: {$token}\n";

// Test the API endpoint
$apiUrl = 'http://127.0.0.1:8000/api/admin/settings';
$headers = [
    'Authorization: Bearer ' . $token,
    'Accept: application/json',
    'Content-Type: application/json'
];

echo "\nTesting API endpoint: {$apiUrl}\n";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

echo "HTTP Status Code: {$httpCode}\n";
echo "Response:\n";
echo $response . "\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['data']) && is_array($data['data'])) {
        echo "\n✅ SUCCESS: Found " . count($data['data']) . " settings\n";
    } else {
        echo "\n❌ ERROR: Unexpected response format\n";
    }
} else {
    echo "\n❌ ERROR: API call failed\n";
}