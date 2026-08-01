<?php
// Test script to verify webhook handling

require_once __DIR__.'/vendor/autoload.php';

// Bootstrap Laravel application
$app = require_once __DIR__.'/bootstrap/app.php';

// Handle the request through the kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;

// Create a mock request to test the webhook
$payload = '{
  "id": "evt_test_webhook",
  "object": "event",
  "api_version": "2020-08-27",
  "created": 1679481600,
  "data": {
    "object": {
      "id": "cs_test_webhook",
      "object": "checkout.session",
      "amount_total": 999,
      "currency": "usd",
      "metadata": {
        "payment_type": "subscription",
        "user_id": 1,
        "plan_type": "premium",
        "billing_period": "monthly"
      }
    }
  },
  "type": "checkout.session.completed"
}';

// Create a mock request object with a valid signature
$timestamp = time();
$secret = env('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');
$signature = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);

$request = Request::create('/api/payments/webhook', 'POST', [], [], [], [
    'HTTP_STRIPE_SIGNATURE' => 't=' . $timestamp . ',v1=' . $signature,
], $payload);

// Include the PaymentController
require_once __DIR__.'/app/Http/Controllers/PaymentController.php';

// Create an instance of the PaymentController
$paymentController = new \App\Http\Controllers\PaymentController();

// Call the handleWebhook method
try {
    $response = $paymentController->handleWebhook($request);
    echo "Webhook handled successfully\n";
    echo "Response: " . $response->getContent() . "\n";
} catch (Exception $e) {
    echo "Error handling webhook: " . $e->getMessage() . "\n";
}