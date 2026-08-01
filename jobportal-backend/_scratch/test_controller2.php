<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

// Test if we can resolve the controller
try {
    $controller = app()->make('App\Http\Controllers\RecommendationController');
    echo "Controller resolved successfully: " . get_class($controller) . "\n";
    
    // Test if we can call a method on the controller
    $response = $controller->getRecommendations(request());
    echo "Method call successful\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}