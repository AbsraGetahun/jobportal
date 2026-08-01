<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

// Load Laravel application
$app = require_once 'bootstrap/app.php';

// Create a kernel instance
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Bootstrap the application
$kernel->bootstrap();

// Create a test user with a unique email
$email = 'test_' . time() . '@example.com';
$user = \App\Models\User::factory()->create([
    'name' => 'Test User',
    'email' => $email,
    'password' => bcrypt('password123'),
    'hasCompany' => null
]);

echo "Created test user with ID: " . $user->id . " and email: " . $email . "\n";

// Test subscription plans endpoint
echo "Testing subscription plans endpoint...\n";
$response = $kernel->handle(
    $request = Illuminate\Http\Request::create('/api/subscription/plans', 'GET')
);
echo "Response status: " . $response->getStatusCode() . "\n";
echo "Response content: " . $response->getContent() . "\n";

// Test payment checkout endpoint with missing amount field
echo "\nTesting payment checkout endpoint with missing amount field...\n";
$response = $kernel->handle(
    $request = Illuminate\Http\Request::create('/api/payments/checkout', 'POST', [], [], [], [
        'HTTP_AUTHORIZATION' => 'Bearer ' . auth()->login($user),
        'CONTENT_TYPE' => 'application/json'
    ], json_encode([
        'currency' => 'USD',
        'description' => 'Test Payment',
        'success_url' => 'http://localhost:3001/payment-success',
        'cancel_url' => 'http://localhost:3001/payment-cancelled',
        'payment_type' => 'subscription'
    ]))
);
echo "Response status: " . $response->getStatusCode() . "\n";
echo "Response content: " . $response->getContent() . "\n";

// Test payment checkout endpoint with valid data (this will fail without Stripe keys)
echo "\nTesting payment checkout endpoint with valid data...\n";
$response = $kernel->handle(
    $request = Illuminate\Http\Request::create('/api/payments/checkout', 'POST', [], [], [], [
        'HTTP_AUTHORIZATION' => 'Bearer ' . auth()->login($user),
        'CONTENT_TYPE' => 'application/json'
    ], json_encode([
        'amount' => 9.99,
        'currency' => 'USD',
        'description' => 'Test Payment',
        'success_url' => 'http://localhost:3001/payment-success',
        'cancel_url' => 'http://localhost:3001/payment-cancelled',
        'payment_type' => 'subscription'
    ]))
);
echo "Response status: " . $response->getStatusCode() . "\n";
echo "Response content: " . $response->getContent() . "\n";

echo "\nTest completed.\n";