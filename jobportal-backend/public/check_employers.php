<?php
// Check employers and their job counts
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Job;

echo "<h1>Employers and Their Job Counts</h1>\n";

try {
    // Get all employers (users with hasCompany not null)
    $employers = User::whereNotNull('hasCompany')->get();
    
    echo "<table border='1'>\n";
    echo "<tr><th>Employer ID</th><th>Name</th><th>Email</th><th>Jobs Posted</th></tr>\n";
    
    foreach ($employers as $employer) {
        $jobCount = Job::where('employer_id', $employer->id)->count();
        echo "<tr>";
        echo "<td>" . $employer->id . "</td>";
        echo "<td>" . $employer->name . "</td>";
        echo "<td>" . $employer->email . "</td>";
        echo "<td>" . $jobCount . "</td>";
        echo "</tr>\n";
    }
    
    echo "</table>\n";
    
    echo "<h2>Recent Jobs Posted by Real Employers:</h2>\n";
    
    // Get recent jobs with employer information
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
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>\n";
}
?>