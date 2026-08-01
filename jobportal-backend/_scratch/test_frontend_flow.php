<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Requests\LoginRequest;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "=== TESTING COMPLETE FRONTEND FLOW ===\n\n";

    // Step 1: Login
    echo "Step 1: Logging in test user...\n";

    $loginData = [
        'email' => 'testuser@example.com',
        'password' => 'TestPass123!'
    ];

    $request = new LoginRequest();
    $request->merge($loginData);
    $request->setMethod('POST');

    $authController = new AuthController();
    $loginResponse = $authController->login($request);

    if ($loginResponse->getStatusCode() === 200) {
        $responseData = json_decode($loginResponse->getContent(), true);
        echo "✅ Login successful!\n";
        echo "Token: " . substr($responseData['access_token'], 0, 20) . "...\n";
        $token = $responseData['access_token'];
    } else {
        echo "❌ Login failed: " . $loginResponse->getContent() . "\n";
        exit(1);
    }

    // Step 2: Access Profile (simulating authenticated request)
    echo "\nStep 2: Accessing profile with authentication...\n";

    // Create authenticated request
    $profileRequest = Request::create('/api/profile', 'GET', [], [], [], [
        'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        'CONTENT_TYPE' => 'application/json',
    ]);

    $profileController = new ProfileController();
    $profileResponse = $profileController->show($profileRequest);

    if ($profileResponse->getStatusCode() === 200) {
        $profileData = json_decode($profileResponse->getContent(), true);
        echo "✅ Profile access successful!\n";
        echo "User: " . ($profileData['data']['name'] ?? 'Unknown') . "\n";
        echo "Email: " . ($profileData['data']['email'] ?? 'Unknown') . "\n";
    } else {
        echo "❌ Profile access failed: " . $profileResponse->getContent() . "\n";
        exit(1);
    }

    echo "\n=== FRONTEND FLOW TEST COMPLETED SUCCESSFULLY ===\n";

} catch (Exception $e) {
    echo "❌ Error during testing: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>