<?php
require 'vendor/autoload.php';

// Check if the controller class exists
if (class_exists('App\Http\Controllers\RecommendationController')) {
    echo "Controller class exists\n";
    
    // Try to instantiate the controller
    try {
        $controller = new App\Http\Controllers\RecommendationController();
        echo "Controller instantiated successfully\n";
    } catch (Exception $e) {
        echo "Error instantiating controller: " . $e->getMessage() . "\n";
    }
} else {
    echo "Controller class does not exist\n";
}