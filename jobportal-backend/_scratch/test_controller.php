<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

// Test if we can resolve the controller
try {
    $controller = app()->make('App\Http\Controllers\RecommendationController');
    echo "Controller resolved successfully: " . get_class($controller) . "\n";
} catch (Exception $e) {
    echo "Error resolving controller: " . $e->getMessage() . "\n";
}

// Test if we can resolve the controller using the class constant
try {
    $controller = app()->make(App\Http\Controllers\RecommendationController::class);
    echo "Controller resolved using class constant successfully: " . get_class($controller) . "\n";
} catch (Exception $e) {
    echo "Error resolving controller using class constant: " . $e->getMessage() . "\n";
}