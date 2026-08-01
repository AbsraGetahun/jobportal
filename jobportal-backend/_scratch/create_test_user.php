<?php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Hash;
use App\Models\User;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "Laravel application bootstrapped successfully\n";

    // Check if test user already exists
    $existingUser = User::where('email', 'testuser@example.com')->first();

    if ($existingUser) {
        echo "Test user already exists. Deleting and recreating...\n";
        $existingUser->delete();
    }

    // Create a new test user
    $user = new User();
    $user->name = 'Test User';
    $user->username = 'testuser';
    $user->email = 'testuser@example.com';
    $user->password = Hash::make('TestPass123!');
    $user->save();

    echo "Test user created successfully!\n";
    echo "Email: testuser@example.com\n";
    echo "Password: TestPass123!\n";
    echo "User ID: " . $user->id . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>