#!/usr/bin/env php
<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;

function checkProfileStatus() {
    try {
        // Load the .env file
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->load();

        // Bootstrap the Laravel application
        $app = require_once __DIR__.'/bootstrap/app.php';
        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        // Get a user to test with (ID 2)
        $user = \App\Models\User::find(2);
        
        if (!$user) {
            echo "User with ID 2 not found\n";
            return false;
        }
        
        // Create minimal test data
        $requestData = [
            'name' => $user->name // Keep the same name
        ];
        
        // Create request
        $request = Request::create('/api/profile', 'PUT', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode($requestData));
        
        // Manually set the request data
        $request->request->add($requestData);
        
        // Authenticate the user
        \Illuminate\Support\Facades\Auth::login($user);
        
        // Create ProfileController instance
        $controller = new ProfileController();
        
        // Call the update method
        $response = $controller->update($request);
        
        if ($response->getStatusCode() === 200) {
            return true;
        } else {
            return false;
        }
        
    } catch (Exception $e) {
        return false;
    }
}

// Run the check
if (checkProfileStatus()) {
    echo "Profile update: OK\n";
} else {
    echo "Profile update: FAILED\n";
}
?>