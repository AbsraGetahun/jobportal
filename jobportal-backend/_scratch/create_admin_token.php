<?php
require_once 'vendor/autoload.php';

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Bootstrap the Laravel application
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "Laravel application bootstrapped successfully\n";

    // Find the admin user
    $adminUser = User::where('email', 'admin@jobportal.com')->first();

    if (!$adminUser) {
        echo "Admin user not found!\n";
        exit(1);
    }

    echo "Found admin user: " . $adminUser->name . " (ID: " . $adminUser->id . ")\n";
    echo "Is admin: " . ($adminUser->is_admin ? 'Yes' : 'No') . "\n";

    // Create a personal access token for the admin user
    $token = $adminUser->createToken('admin-token');

    echo "\nAdmin Access Token:\n";
    echo $token->plainTextToken . "\n";

    echo "\nToken details:\n";
    echo "Token ID: " . $token->accessToken->id . "\n";
    echo "Token Name: " . $token->accessToken->name . "\n";
    echo "Token Abilities: " . json_encode($token->accessToken->abilities) . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>