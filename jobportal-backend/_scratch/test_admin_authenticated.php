<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Models\User;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test admin API endpoints with authentication
echo "=== Testing Admin API Endpoints with Authentication ===\n\n";

// First, get an admin user and create a token
$admin = User::where('is_admin', true)->first();
if (!$admin) {
    echo "❌ No admin user found. Please create an admin user first.\n";
    exit(1);
}

echo "Found admin user: {$admin->name} ({$admin->email})\n";

// Create a personal access token for the admin
$token = $admin->createToken('admin-test-token')->plainTextToken;
echo "Created access token: " . substr($token, 0, 20) . "...\n\n";

// Test authenticated endpoints
$headers = [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
];

// Test 1: Get system settings
echo "1. Testing /api/admin/settings endpoint...\n";
$ch = curl_init('http://127.0.0.1:8000/api/admin/settings');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✅ System settings API working - " . count($data['data']) . " settings found\n";
        echo "  Sample settings:\n";
        foreach (array_slice($data['data'], 0, 3) as $setting) {
            echo "    - {$setting['key']}: {$setting['value']}\n";
        }
    } else {
        echo "❌ System settings API returned unexpected response\n";
        var_dump($data);
    }
} else {
    echo "❌ System settings API failed with HTTP {$httpCode}\n";
    echo "Response: " . substr($response, 0, 200) . "\n";
}

// Test 2: Get fraud alerts
echo "\n2. Testing /api/admin/fraud/alerts endpoint...\n";
$ch = curl_init('http://127.0.0.1:8000/api/admin/fraud/alerts');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✅ Fraud alerts API working - " . count($data['data']) . " alerts found\n";
    } else {
        echo "❌ Fraud alerts API returned unexpected response\n";
        var_dump($data);
    }
} else {
    echo "❌ Fraud alerts API failed with HTTP {$httpCode}\n";
    echo "Response: " . substr($response, 0, 200) . "\n";
}

// Test 3: Get CMS pages
echo "\n3. Testing /api/admin/cms/pages endpoint...\n";
$ch = curl_init('http://127.0.0.1:8000/api/admin/cms/pages');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✅ CMS pages API working - " . count($data['data']) . " pages found\n";
    } else {
        echo "❌ CMS pages API returned unexpected response\n";
        var_dump($data);
    }
} else {
    echo "❌ CMS pages API failed with HTTP {$httpCode}\n";
    echo "Response: " . substr($response, 0, 200) . "\n";
}

// Test 4: Get support tickets
echo "\n4. Testing /api/admin/support/tickets endpoint...\n";
$ch = curl_init('http://127.0.0.1:8000/api/admin/support/tickets');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✅ Support tickets API working - " . count($data['data']) . " tickets found\n";
    } else {
        echo "❌ Support tickets API returned unexpected response\n";
        var_dump($data);
    }
} else {
    echo "❌ Support tickets API failed with HTTP {$httpCode}\n";
    echo "Response: " . substr($response, 0, 200) . "\n";
}

echo "\n=== Authenticated API Test Summary ===\n";
echo "If all tests show ✅, then the backend APIs are working correctly with authentication.\n";
echo "The frontend should now be able to connect and display data when logged in as admin.\n";
echo "\nFrontend URL: http://localhost:3000\n";
echo "Backend URL: http://127.0.0.1:8000\n";
echo "Admin Token: " . substr($token, 0, 20) . "...\n";