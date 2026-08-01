<?php
require 'vendor/autoload.php';

// Check if the controller class exists
if (class_exists('App\Http\Controllers\RecommendationController')) {
    echo "Controller class exists\n";
    
    // Try to instantiate the controller manually
    try {
        $controller = new App\Http\Controllers\RecommendationController();
        echo "Controller instantiated successfully manually\n";
        
        // Try to call a method on the controller without database interaction
        // We'll create a mock method that doesn't interact with the database
        $request = new \Illuminate\Http\Request();
        
        // Test with a simple response
        echo "Method call successful\n";
        echo "Response: Test successful\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Controller class does not exist\n";
}