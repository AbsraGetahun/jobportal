<?php
require_once 'vendor/autoload.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

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

    // Set a password that meets the requirements: uppercase, lowercase, number, special char
    $newPassword = 'Admin123!';

    // Hash the password
    $hashedPassword = Hash::make($newPassword);

    // Update the admin user's password
    $adminUser->update(['password' => $hashedPassword]);

    echo "Admin password updated successfully!\n";
    echo "New password: " . $newPassword . "\n";
    echo "Email: admin@jobportal.com\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>