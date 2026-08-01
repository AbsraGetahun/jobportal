<?php
// Clean up test jobs and only keep real employer jobs
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Job;

echo "<h1>Cleaning Up Test Jobs</h1>\n";

try {
    // Get all employers (users with hasCompany not null)
    $employers = User::whereNotNull('hasCompany')->pluck('id');
    
    echo "<p>Found " . $employers->count() . " employers in the system</p>\n";
    
    // Get all jobs that don't belong to real employers
    $testJobs = Job::whereNotIn('employer_id', $employers)->get();
    
    echo "<p>Found " . $testJobs->count() . " test jobs to delete</p>\n";
    
    // Delete test jobs
    $deletedCount = 0;
    foreach ($testJobs as $job) {
        $job->delete();
        $deletedCount++;
    }
    
    echo "<p style='color: green;'>Successfully deleted " . $deletedCount . " test jobs</p>\n";
    
    // Show remaining jobs
    $remainingJobs = Job::count();
    echo "<p>Total jobs remaining: " . $remainingJobs . "</p>\n";
    
    // Show recent jobs with employer information
    echo "<h2>Recent Jobs Posted by Real Employers:</h2>\n";
    
    $recentJobs = Job::with('employer')->orderBy('created_at', 'desc')->limit(20)->get();
    
    echo "<table border='1'>\n";
    echo "<tr><th>Job ID</th><th>Title</th><th>Employer Name</th><th>Employer Email</th><th>Posted At</th></tr>\n";
    
    foreach ($recentJobs as $job) {
        echo "<tr>";
        echo "<td>" . $job->id . "</td>";
        echo "<td>" . $job->title . "</td>";
        echo "<td>" . ($job->employer ? $job->employer->name : 'Unknown') . "</td>";
        echo "<td>" . ($job->employer ? $job->employer->email : 'Unknown') . "</td>";
        echo "<td>" . $job->created_at . "</td>";
        echo "</tr>\n";
    }
    
    echo "</table>\n";
    
    // Show employer job counts
    echo "<h2>Employer Job Counts:</h2>\n";
    
    echo "<table border='1'>\n";
    echo "<tr><th>Employer ID</th><th>Name</th><th>Email</th><th>Jobs Posted</th></tr>\n";
    
    foreach ($employers as $employerId) {
        $employer = User::find($employerId);
        if ($employer) {
            $jobCount = Job::where('employer_id', $employerId)->count();
            echo "<tr>";
            echo "<td>" . $employer->id . "</td>";
            echo "<td>" . $employer->name . "</td>";
            echo "<td>" . $employer->email . "</td>";
            echo "<td>" . $jobCount . "</td>";
            echo "</tr>\n";
        }
    }
    
    echo "</table>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>\n";
}
?>