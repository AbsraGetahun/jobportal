<?php
require_once 'vendor/autoload.php';

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Get database path from .env
    $dbPath = __DIR__ . '/' . ($_ENV['DB_DATABASE'] ?? 'database/database.sqlite');

    echo "Database path: " . $dbPath . "\n";

    // Check if file exists
    if (file_exists($dbPath)) {
        echo "Database file exists\n";
    } else {
        echo "Database file does not exist\n";
        exit(1);
    }

    // Try to connect to the database
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Successfully connected to the database\n";

    // Check for admin users
    $stmt = $pdo->query("SELECT id, name, email, is_admin FROM users WHERE is_admin = 1");
    $adminUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "\nAdmin users:\n";
    if (count($adminUsers) > 0) {
        foreach ($adminUsers as $user) {
            echo "ID: " . $user['id'] . ", Name: " . $user['name'] . ", Email: " . $user['email'] . ", is_admin: " . $user['is_admin'] . "\n";
        }
    } else {
        echo "No admin users found!\n";
    }

    // Check all users with is_admin field
    $stmt = $pdo->query("SELECT id, name, email, is_admin FROM users LIMIT 10");
    $allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "\nFirst 10 users with is_admin field:\n";
    foreach ($allUsers as $user) {
        echo "ID: " . $user['id'] . ", Name: " . $user['name'] . ", Email: " . $user['email'] . ", is_admin: " . ($user['is_admin'] ? 'true' : 'false') . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>