<?php
require_once 'vendor/autoload.php';

try {
    // Load the .env file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Get database path from .env
    $dbPath = $_ENV['DB_DATABASE'] ?? 'database/database.sqlite';
    
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
    
    // Try to query the database
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables in database:\n";
    foreach ($tables as $table) {
        echo "- " . $table . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>