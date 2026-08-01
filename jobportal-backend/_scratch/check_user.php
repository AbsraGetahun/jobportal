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
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->execute(['test@example.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "User found:\n";
        echo "ID: " . $user['id'] . "\n";
        echo "Name: " . $user['name'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Password hash: " . $user['password'] . "\n";
    } else {
        echo "No user found with email test@example.com\n";
    }
    
    // Count total users
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Total users in database: " . $count . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>