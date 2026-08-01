<?php
require 'vendor/autoload.php';

// Check if the controller class exists
if (class_exists('App\Http\Controllers\RecommendationController')) {
    echo "Controller class exists\n";
    
    // Try to instantiate the controller using the container
    try {
        $app = require_once 'bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
        $kernel->bootstrap();
        
        $controller = $app->make('App\Http\Controllers\RecommendationController');
        echo "Controller instantiated successfully using container\n";
    } catch (Exception $e) {
        echo "Error instantiating controller using container: " . $e->getMessage() . "\n";
    }
} else {
    echo "Controller class does not exist\n";
}