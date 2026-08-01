<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configure the database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => $_ENV['DB_HOST'],
    'database'  => $_ENV['DB_DATABASE'],
    'username'  => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Check if the phone column exists in the users table
if (Schema::hasColumn('users', 'phone')) {
    echo "Phone column exists in the users table.\n";
} else {
    echo "Phone column does not exist in the users table.\n";
}

// Try to get user data
try {
    $user = Capsule::table('users')->where('id', 22)->first();
    if ($user) {
        echo "User data:\n";
        echo "ID: " . $user->id . "\n";
        echo "Name: " . $user->name . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Phone: " . ($user->phone ?? 'NULL') . "\n";
    } else {
        echo "User with ID 22 not found.\n";
    }
} catch (Exception $e) {
    echo "Error retrieving user data: " . $e->getMessage() . "\n";
}