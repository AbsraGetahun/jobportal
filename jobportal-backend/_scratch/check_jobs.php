<?php
require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

// Load the Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Use the Job model to fetch all jobs
use App\Models\Job;

try {
    $jobs = Job::all();
    echo "Total jobs: " . $jobs->count() . "\n";
    
    foreach ($jobs as $job) {
        echo "Job ID: " . $job->id . "\n";
        echo "Title: " . $job->title . "\n";
        echo "Is Active: " . ($job->is_active ? 'Yes' : 'No') . "\n";
        echo "------------------------\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}