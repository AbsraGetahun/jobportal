<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Configure the database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => __DIR__ . '/database/database.sqlite',
    'prefix' => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// List of tables to drop
$tables = ['sessions', 'migrations', 'users', 'password_reset_tokens', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'personal_access_tokens', 'companies', 'jobs', 'applications', 'job_views'];

// Drop each table if it exists
foreach ($tables as $table) {
    try {
        Capsule::schema()->dropIfExists($table);
        echo "Table '$table' dropped successfully.\n";
    } catch (Exception $e) {
        echo "Error dropping table '$table': " . $e->getMessage() . "\n";
    }
}