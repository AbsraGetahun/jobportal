<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

// Bootstrap the application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

// Test if we can resolve the controller
try {
    $controller = app()->make('App\Http\Controllers\RecommendationController');
    echo "Controller resolved successfully: " . get_class($controller) . "\n";
    
    // Create a mock request
    $request = new \Illuminate\Http\Request();
    
    // Test if we can call a method on the controller
    $response = $controller->getRecommendations($request);
    echo "Method call successful\n";
    echo "Response: " . json_encode($response->getData()) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}