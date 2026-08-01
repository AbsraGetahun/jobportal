<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test admin API endpoints
echo "=== Testing Admin API Endpoints ===\n\n";

// Test 1: Get system settings
echo "1. Testing /api/admin/settings endpoint...\n";
try {
    $response = file_get_contents('http://127.0.0.1:8000/api/admin/settings');
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✓ System settings API working - " . count($data['data']) . " settings found\n";
        echo "  Sample settings:\n";
        foreach (array_slice($data['data'], 0, 3) as $setting) {
            echo "    - {$setting['key']}: {$setting['value']}\n";
        }
    } else {
        echo "✗ System settings API returned unexpected response\n";
        var_dump($data);
    }
} catch (Exception $e) {
    echo "✗ System settings API failed: " . $e->getMessage() . "\n";
}

// Test 2: Get fraud alerts
echo "\n2. Testing /api/admin/fraud/alerts endpoint...\n";
try {
    $response = file_get_contents('http://127.0.0.1:8000/api/admin/fraud/alerts');
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✓ Fraud alerts API working - " . count($data['data']) . " alerts found\n";
    } else {
        echo "✗ Fraud alerts API returned unexpected response\n";
        var_dump($data);
    }
} catch (Exception $e) {
    echo "✗ Fraud alerts API failed: " . $e->getMessage() . "\n";
}

// Test 3: Get CMS pages
echo "\n3. Testing /api/admin/cms/pages endpoint...\n";
try {
    $response = file_get_contents('http://127.0.0.1:8000/api/admin/cms/pages');
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✓ CMS pages API working - " . count($data['data']) . " pages found\n";
    } else {
        echo "✗ CMS pages API returned unexpected response\n";
        var_dump($data);
    }
} catch (Exception $e) {
    echo "✗ CMS pages API failed: " . $e->getMessage() . "\n";
}

// Test 4: Get support tickets
echo "\n4. Testing /api/admin/support/tickets endpoint...\n";
try {
    $response = file_get_contents('http://127.0.0.1:8000/api/admin/support/tickets');
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        echo "✓ Support tickets API working - " . count($data['data']) . " tickets found\n";
    } else {
        echo "✗ Support tickets API returned unexpected response\n";
        var_dump($data);
    }
} catch (Exception $e) {
    echo "✗ Support tickets API failed: " . $e->getMessage() . "\n";
}

echo "\n=== API Test Summary ===\n";
echo "If all tests show ✓, then the backend APIs are working correctly.\n";
echo "The frontend should now be able to connect and display data.\n";
echo "\nFrontend URL: http://localhost:3001\n";
echo "Backend URL: http://127.0.0.1:8000\n";