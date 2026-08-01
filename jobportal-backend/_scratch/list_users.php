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
    
    // Get first 5 users
    $stmt = $pdo->query("SELECT id, name, email FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "First 5 users:\n";
    foreach ($users as $user) {
        echo "ID: " . $user['id'] . ", Name: " . $user['name'] . ", Email: " . $user['email'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>