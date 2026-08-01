<?php
require_once 'vendor/autoload.php';

use App\Http\Requests\RegisterRequest;
use App\Http\Controllers\AuthController;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "Laravel application bootstrapped successfully\n";

    // Create a RegisterRequest instance
    $request = new RegisterRequest();
    
    // Set the request data
    $requestData = [
        'name' => 'Test User',
        'username' => 'testuser' . time(), // Make it unique
        'email' => 'test' . time() . '@example.com', // Make it unique
        'password' => 'TestPass123!',
        'password_confirmation' => 'TestPass123!',
        'degree' => 'Computer Science',
        'fieldOfStudy' => 'Software Engineering',
        'graduationYear' => 2020,
        'experience' => 5,
        'hasCompany' => false
    ];
    
    // Manually set the request data
    $request->replace($requestData);
    
    // Set the request method
    $request->setMethod('POST');
    
    // Validate the request
    $request->setContainer($app);
    $request->validateResolved();
    
    echo "Request data: ";
    print_r($request->all());
    
    // Check if the request passes validation
    if ($request->passesAuthorization() && !$request->failedAuthorization()) {
        echo "Request validation passed\n";
        
        // Create AuthController instance
        $controller = new AuthController();
        
        // Call the register method
        echo "Calling register method...\n";
        $response = $controller->register($request);
        
        echo "Registration response status: " . $response->getStatusCode() . "\n";
        echo "Registration response content: " . $response->getContent() . "\n";
    } else {
        echo "Request validation failed\n";
        echo "Errors: ";
        print_r($request->errors());
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>