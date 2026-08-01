<?php
require 'vendor/autoload.php';

// Check if the controller class exists
if (class_exists('App\Http\Controllers\RecommendationController')) {
    echo "Controller class exists\n";
    
    // Try to instantiate the controller manually
    try {
        $controller = new App\Http\Controllers\RecommendationController();
        echo "Controller instantiated successfully manually\n";
        
        // Try to call a method on the controller
        $request = new \Illuminate\Http\Request();
        $response = $controller->getRecommendations($request);
        echo "Method call successful\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Controller class does not exist\n";
}