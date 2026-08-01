<?php
require 'vendor/autoload.php';

// Create a mock application
$app = new \Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Register the necessary service providers
$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

// Bootstrap the application
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

// Check if the controller class exists
if (class_exists('App\Http\Controllers\RecommendationController')) {
    echo "Controller class exists\n";
    
    // Try to instantiate the controller using the container
    try {
        $controller = $app->make('App\Http\Controllers\RecommendationController');
        echo "Controller instantiated successfully using container\n";
        
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