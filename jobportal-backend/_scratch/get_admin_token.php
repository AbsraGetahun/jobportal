<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "Laravel application bootstrapped successfully\n";

    // Create login request data for admin user
    $loginData = [
        'email' => 'admin@jobportal.com',
        'password' => 'password' // Assuming default password
    ];

    // Create request
    $request = Request::create('/api/login', 'POST', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
    ], json_encode($loginData));

    // Manually set the request data
    $request->request->add($loginData);

    // Create AuthController instance
    $controller = new AuthController();

    // Call the login method
    echo "Attempting to login as admin...\n";
    $response = $controller->login($request);

    if ($response->getStatusCode() === 200) {
        $responseData = json_decode($response->getContent(), true);
        echo "Login successful!\n";
        echo "Token: " . $responseData['access_token'] . "\n";
        echo "Token Type: " . $responseData['token_type'] . "\n";
        echo "User: " . json_encode($responseData['user']) . "\n";
    } else {
        echo "Login failed with status: " . $response->getStatusCode() . "\n";
        echo "Response: " . $response->getContent() . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>