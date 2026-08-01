#!/usr/bin/env php
<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;

function checkProfileUpdate() {
    try {
        // Load the .env file
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->load();

        // Bootstrap the Laravel application
        $app = require_once __DIR__.'/bootstrap/app.php';
        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        echo "✓ Laravel application bootstrapped successfully\n";

        // Get a user to test with (ID 2)
        $user = \App\Models\User::find(2);
        
        if (!$user) {
            echo "✗ User with ID 2 not found\n";
            return false;
        }
        
        echo "✓ Found user: " . $user->name . " (" . $user->email . ")\n";
        
        // Create test data
        $requestData = [
            'name' => 'Profile Update Test',
            'degree' => 'Computer Science',
            'fieldOfStudy' => 'Software Engineering',
            'experience' => 3,
            'phone' => '987-654-3210',
            'address' => '456 Oak Street',
            'website' => 'https://test-profile-update.com'
        ];
        
        // Create request
        $request = Request::create('/api/profile', 'PUT', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode($requestData));
        
        // Manually set the request data
        $request->request->add($requestData);
        
        // Authenticate the user
        \Illuminate\Support\Facades\Auth::login($user);
        
        echo "✓ User authenticated\n";
        
        // Create ProfileController instance
        $controller = new ProfileController();
        
        // Call the update method
        echo "→ Calling profile update method...\n";
        $response = $controller->update($request);
        
        if ($response->getStatusCode() === 200) {
            echo "✓ Profile update successful! Status: " . $response->getStatusCode() . "\n";
            
            // Check if the user data was updated
            $updatedUser = \App\Models\User::find(2);
            echo "✓ User data updated:\n";
            echo "  Name: " . $updatedUser->name . "\n";
            echo "  Degree: " . ($updatedUser->degree ?? 'NULL') . "\n";
            echo "  Phone: " . ($updatedUser->phone ?? 'NULL') . "\n";
            echo "  Updated at: " . $updatedUser->updated_at . "\n";
            
            return true;
        } else {
            echo "✗ Profile update failed with status: " . $response->getStatusCode() . "\n";
            return false;
        }
        
    } catch (Exception $e) {
        echo "✗ Error: " . $e->getMessage() . "\n";
        return false;
    }
}

// Run the check
echo "Checking if profile update is working...\n";
echo "=====================================\n";

if (checkProfileUpdate()) {
    echo "=====================================\n";
    echo "✓ Profile update is working correctly!\n";
} else {
    echo "=====================================\n";
    echo "✗ Profile update is NOT working!\n";
}
?>