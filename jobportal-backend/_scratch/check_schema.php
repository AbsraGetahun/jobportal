<?php
require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    $stmt = $pdo->query("PRAGMA table_info(users)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Users table schema:\n";
    foreach ($columns as $column) {
        echo "- {$column['name']}: {$column['type']}" . ($column['notnull'] === 0 ? ' (nullable)' : '') . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}