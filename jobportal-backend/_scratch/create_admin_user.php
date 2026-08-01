<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Creating Admin User ===\n\n";

// Check if admin user already exists
$existingAdmin = User::where('is_admin', true)->first();

if ($existingAdmin) {
    echo "Admin user already exists:\n";
    echo "ID: {$existingAdmin->id}\n";
    echo "Name: {$existingAdmin->name}\n";
    echo "Email: {$existingAdmin->email}\n";
    echo "Username: {$existingAdmin->username}\n\n";
    exit(0);
}

// Create admin user
echo "Creating new admin user...\n";

try {
    $admin = User::create([
        'name' => 'System Administrator',
        'username' => 'admin',
        'email' => 'admin@jobportal.com',
        'password' => bcrypt('admin123'),
        'is_admin' => true,
        'hasCompany' => false,
        'is_verified' => true
    ]);

    echo "✓ Admin user created successfully!\n";
    echo "ID: {$admin->id}\n";
    echo "Name: {$admin->name}\n";
    echo "Email: {$admin->email}\n";
    echo "Username: {$admin->username}\n";
    echo "Password: admin123\n\n";

    echo "You can now login as admin and test the notification system.\n";
    echo "When employers post jobs, notifications will be sent to this admin user.\n";

} catch (Exception $e) {
    echo "❌ Error creating admin user: " . $e->getMessage() . "\n";
    exit(1);
}