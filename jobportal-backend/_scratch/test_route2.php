<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

// Test if we can resolve the controller using the string format
try {
    $controller = app()->make('App\Http\Controllers\RecommendationController@getRecommendations');
    echo "Controller method resolved successfully: " . get_class($controller) . "\n";
} catch (Exception $e) {
    echo "Error resolving controller method: " . $e->getMessage() . "\n";
}

// Test if we can resolve the controller using the array format with full class name
try {
    $controller = app()->make(['App\Http\Controllers\RecommendationController', 'getRecommendations']);
    echo "Controller method resolved using array format successfully: " . get_class($controller[0]) . "\n";
} catch (Exception $e) {
    echo "Error resolving controller method using array format: " . $e->getMessage() . "\n";
}