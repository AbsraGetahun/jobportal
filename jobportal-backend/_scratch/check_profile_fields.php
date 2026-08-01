<?php
// Simple script to check if profile fields exist in the database

// Include Laravel's bootstrap file
require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

// Start the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get the database connection
$db = DB::connection();

// Check if the profile fields exist in the users table
try {
    $columns = $db->select("PRAGMA table_info(users)");
    
    echo "Users table columns:\n";
    foreach ($columns as $column) {
        echo "- " . $column->name . " (" . $column->type . ")\n";
    }
    
    // Check if specific profile fields exist
    $profileFields = ['age', 'gender', 'location'];
    $missingFields = [];
    
    foreach ($profileFields as $field) {
        $found = false;
        foreach ($columns as $column) {
            if ($column->name === $field) {
                $found = true;
                break;
            }
        }
        if (!$found) {
            $missingFields[] = $field;
        }
    }
    
    if (empty($missingFields)) {
        echo "All profile fields (age, gender, location) exist in the users table.\n";
    } else {
        echo "Missing profile fields: " . implode(', ', $missingFields) . "\n";
    }
} catch (Exception $e) {
    echo "Error checking database: " . $e->getMessage() . "\n";
}