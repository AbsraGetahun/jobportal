<?php

try {
    // Create a new SQLite database file using PDO
    $pdo = new PDO('sqlite:database/database.sqlite');
    
    // Create a simple table to test the database
    $pdo->exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    
    echo "Database created successfully.\n";
} catch (PDOException $e) {
    echo "Error creating database: " . $e->getMessage() . "\n";
}