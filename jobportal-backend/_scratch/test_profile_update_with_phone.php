<?php
require_once 'vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Create a test user with a unique email
$email = 'test_' . time() . '@example.com';
$user = \App\Models\User::factory()->create([
    'name' => 'Test User',
    'email' => $email,
    'phone' => null, // Initially null
]);

// Create a token for the user
$token = $user->createToken('test-token')->plainTextToken;

// Simulate a profile update with phone number
// We'll create a mock request with FormData
$requestData = [
    'name' => 'Updated Test User',
    'email' => $email,
    'phone' => '+1234567890',
    'username' => 'testuser_' . time(),
];

// Log in as the user
\Auth::login($user);

// Create a mock request
$request = new \Illuminate\Http\Request();
$request->setMethod('PUT');
$request->request->add($requestData);
$request->headers->set('Content-Type', 'multipart/form-data');

// Call the profile update method
$controller = new \App\Http\Controllers\ProfileController();
$response = $controller->update($request);

// Check if the response is successful
if ($response->status() === 200) {
    echo "Profile update successful!\n";
    
    // Refresh the user data
    $user->refresh();
    
    // Check if phone field was updated
    if ($user->phone === '+1234567890') {
        echo "Phone field successfully updated to: " . $user->phone . "\n";
    } else {
        echo "ERROR: Phone field was not updated. Current value: " . $user->phone . "\n";
    }
    
    // Output the full user data for verification
    echo "Full user data:\n";
    print_r($user->toArray());
} else {
    echo "Profile update failed with status: " . $response->status() . "\n";
    echo "Response content: " . $response->getContent() . "\n";
}

// Clean up - delete the test user
$user->delete();