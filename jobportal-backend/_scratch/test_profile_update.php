<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "Laravel application bootstrapped successfully\n";

    // Get a user to test with (ID 2)
    $user = \App\Models\User::find(2);
    
    if (!$user) {
        echo "User with ID 2 not found\n";
        exit(1);
    }
    
    echo "Found user: " . $user->name . " (" . $user->email . ")\n";
    
    // Create a proper request with JSON data
    $requestData = [
        'name' => 'Updated Test User',
        'degree' => 'Computer Science',
        'fieldOfStudy' => 'Software Engineering',
        'experience' => 5,
        'phone' => '123-456-7890',
        'address' => '123 Main St',
        'website' => 'https://example.com'
    ];
    
    // Create request using the Laravel helper
    $request = Request::create('/api/profile', 'PUT', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
    ], json_encode($requestData));
    
    // Manually set the request data for validation to work
    $request->request->add($requestData);
    
    echo "Request data: ";
    print_r($request->all());
    
    // Authenticate the user
    \Illuminate\Support\Facades\Auth::login($user);
    
    echo "User authenticated\n";
    
    // Create ProfileController instance
    $controller = new ProfileController();
    
    // Call the update method
    echo "Calling profile update method...\n";
    $response = $controller->update($request);
    
    echo "Profile update response status: " . $response->getStatusCode() . "\n";
    echo "Profile update response content: " . $response->getContent() . "\n";
    
    // Check if the user data was updated
    $updatedUser = \App\Models\User::find(2);
    echo "Updated user name: " . $updatedUser->name . "\n";
    echo "Updated user degree: " . ($updatedUser->degree ?? 'NULL') . "\n";
    echo "Updated user phone: " . ($updatedUser->phone ?? 'NULL') . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>