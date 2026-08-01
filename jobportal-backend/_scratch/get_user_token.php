<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Requests\LoginRequest;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "Laravel application bootstrapped successfully\n";

    // Create login request data
    $loginData = [
        'email' => 'test@example.com',
        'password' => 'password' // Default password for test users
    ];
    
    // Create LoginRequest
    $request = new LoginRequest();
    $request->merge($loginData);
    $request->setMethod('POST');
    $request->setJson(new \Symfony\Component\HttpFoundation\ParameterBag($loginData));
    
    // Create AuthController instance
    $controller = new AuthController();
    
    // Call the login method
    echo "Calling login method...\n";
    $response = $controller->login($request);
    
    if ($response->getStatusCode() === 200) {
        $responseData = json_decode($response->getContent(), true);
        echo "Login successful!\n";
        echo "Token: " . $responseData['access_token'] . "\n";
        echo "Token Type: " . $responseData['token_type'] . "\n";
    } else {
        echo "Login failed with status: " . $response->getStatusCode() . "\n";
        echo "Response: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>