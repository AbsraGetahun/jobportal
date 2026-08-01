<?php
// Debug script to check job posting and search issues
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Job;
use App\Models\User;

echo "<h1>Job Portal Debug Information</h1>\n";

// Check database connection
try {
    // Test database connection using Laravel's configuration
    $databasePath = __DIR__ . '/../database/database.sqlite';
    $pdo = new PDO('sqlite:' . $databasePath);
    echo "<p style='color: green;'>✓ Database connection successful</p>\n";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Database connection failed: " . $e->getMessage() . "</p>\n";
    exit;
}

// Check if there are any users
$users = User::count();
echo "<p>Total users in system: " . $users . "</p>\n";

// Check if there are any jobs
$totalJobs = Job::count();
echo "<p>Total jobs in system: " . $totalJobs . "</p>\n";

// Check active jobs
$activeJobs = Job::where('is_active', true)->count();
echo "<p>Active jobs (should appear in search): " . $activeJobs . "</p>\n";

// Show recent jobs
echo "<h2>Recent Jobs:</h2>\n";
$recentJobs = Job::orderBy('created_at', 'desc')->limit(10)->get();
if ($recentJobs->count() > 0) {
    echo "<table border='1'>\n";
    echo "<tr><th>ID</th><th>Title</th><th>Active</th><th>Employer ID</th><th>Created At</th></tr>\n";
    foreach ($recentJobs as $job) {
        echo "<tr>";
        echo "<td>" . $job->id . "</td>";
        echo "<td>" . $job->title . "</td>";
        echo "<td>" . ($job->is_active ? 'Yes' : 'No') . "</td>";
        echo "<td>" . $job->employer_id . "</td>";
        echo "<td>" . $job->created_at . "</td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
} else {
    echo "<p>No jobs found in database</p>\n";
}

// Test job creation
echo "<h2>Test Job Creation:</h2>\n";
try {
    // Array of sample job data with descriptive titles and details
    $sampleJobs = [
        [
            'title' => 'Senior Software Engineer',
            'description' => 'We are looking for an experienced Senior Software Engineer to join our dynamic development team. The ideal candidate will have extensive experience in building scalable web applications and leading technical projects.',
            'location' => 'Addis Ababa',
            'job_type' => 'full-time',
            'experience_level' => 'senior',
            'salary_min' => 8000.00,
            'salary_max' => 15000.00,
            'category' => 'technology',
            'is_remote' => false,
            'application_deadline' => date('Y-m-d', strtotime('+30 days'))
        ],
        [
            'title' => 'Marketing Manager',
            'description' => 'Join our marketing team as a Marketing Manager to lead campaigns and drive brand awareness. The successful candidate will have proven experience in digital marketing and team leadership.',
            'location' => 'Hawassa',
            'job_type' => 'full-time',
            'experience_level' => 'expert',
            'salary_min' => 4000.00,
            'salary_max' => 39000.00,
            'category' => 'marketing',
            'is_remote' => false,
            'application_deadline' => date('Y-m-d', strtotime('+20 days'))
        ],
        [
            'title' => 'Accountant',
            'description' => 'We are seeking a detail-oriented Accountant to manage our financial records and prepare reports. The candidate should have strong analytical skills and experience with accounting software.',
            'location' => 'Hawassa',
            'job_type' => 'full-time',
            'experience_level' => 'intermediate',
            'salary_min' => 5000.00,
            'salary_max' => 8000.00,
            'category' => 'finance',
            'is_remote' => false,
            'application_deadline' => date('Y-m-d', strtotime('+25 days'))
        ],
        [
            'title' => 'HR Specialist',
            'description' => 'Looking for an HR Specialist to support our human resources functions including recruitment, employee relations, and compliance. Experience in Ethiopian labor law is preferred.',
            'location' => 'Dire Dawa',
            'job_type' => 'full-time',
            'experience_level' => 'intermediate',
            'salary_min' => 6000.00,
            'salary_max' => 10000.00,
            'category' => 'hr',
            'is_remote' => false,
            'application_deadline' => date('Y-m-d', strtotime('+15 days'))
        ],
        [
            'title' => 'Data Analyst',
            'description' => 'Join our analytics team to transform data into actionable insights. The ideal candidate will have strong SQL skills and experience with data visualization tools.',
            'location' => 'Addis Ababa',
            'job_type' => 'full-time',
            'experience_level' => 'senior',
            'salary_min' => 7000.00,
            'salary_max' => 12000.00,
            'category' => 'technology',
            'is_remote' => true,
            'application_deadline' => date('Y-m-d', strtotime('+30 days'))
        ]
    ];
    
    // Select a random job from the sample jobs
    $selectedJob = $sampleJobs[array_rand($sampleJobs)];
    
    $testJob = Job::create(array_merge($selectedJob, [
        'employer_id' => 1, // Assuming user ID 1 exists
        'is_active' => true,
    ]));
    echo "<p style='color: green;'>✓ Test job created successfully with ID: " . $testJob->id . "</p>\n";
    
    // Try to find it
    $foundJob = Job::find($testJob->id);
    if ($foundJob) {
        echo "<p style='color: green;'>✓ Test job can be retrieved</p>\n";
    } else {
        echo "<p style='color: red;'>✗ Test job cannot be retrieved</p>\n";
    }
    
    // Try search
    $searchResults = Job::where('is_active', true)->get();
    echo "<p>Search results count: " . $searchResults->count() . "</p>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Test job creation failed: " . $e->getMessage() . "</p>\n";
}

// Test fetching jobs for a specific employer
echo "<h2>Test Employer Jobs:</h2>\n";
try {
    // Try to get jobs for employer ID 19 (who has posted jobs according to our earlier results)
    $employerJobs = Job::where('employer_id', 19)->get();
    echo "<p>Jobs for employer ID 19: " . $employerJobs->count() . "</p>\n";
    
    // Try to get jobs for employer ID 1 (who has also posted jobs)
    $employerJobs2 = Job::where('employer_id', 1)->get();
    echo "<p>Jobs for employer ID 1: " . $employerJobs2->count() . "</p>\n";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Test employer jobs failed: " . $e->getMessage() . "</p>\n";
}

// Test the myJobs endpoint functionality
echo "<h2>Test myJobs Endpoint:</h2>\n";
try {
    // Simulate what the myJobs endpoint does
    // We'll test with employer ID 19 since we know they have jobs
    $myJobs = Job::where('employer_id', 19)->paginate(10);
    echo "<p>myJobs result for employer ID 19: " . $myJobs->count() . " jobs</p>\n";
    echo "<p>Total jobs for employer ID 19: " . $myJobs->total() . "</p>\n";
    
    // Show the first job details
    if ($myJobs->count() > 0) {
        $firstJob = $myJobs->first();
        echo "<p>First job title: " . $firstJob->title . "</p>\n";
        echo "<p>First job ID: " . $firstJob->id . "</p>\n";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Test myJobs endpoint failed: " . $e->getMessage() . "</p>\n";
}

// Test authentication
echo "<h2>Test Authentication:</h2>\n";
try {
    // Try to get a user by ID to see if authentication is working
    $user = User::find(19);
    if ($user) {
        echo "<p>User with ID 19 found: " . $user->name . "</p>\n";
        echo "<p>User email: " . $user->email . "</p>\n";
        echo "<p>User type: " . ($user->hasCompany !== null ? 'Employer' : 'Job Seeker') . "</p>\n";
    } else {
        echo "<p>User with ID 19 not found</p>\n";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Test authentication failed: " . $e->getMessage() . "</p>\n";
}

// Test localStorage simulation
echo "<h2>Test localStorage Simulation:</h2>\n";
try {
    // Try to get all users to see what's in the system
    $users = User::all();
    echo "<p>Total users in system: " . $users->count() . "</p>\n";
    
    // Show all employers
    $employers = User::whereNotNull('hasCompany')->get();
    echo "<p>Total employers in system: " . $employers->count() . "</p>\n";
    
    // Show employers with jobs
    echo "<p>Employers with jobs:</p>\n";
    echo "<ul>\n";
    foreach ($employers as $employer) {
        $jobCount = Job::where('employer_id', $employer->id)->count();
        if ($jobCount > 0) {
            echo "<li>" . $employer->name . " (ID: " . $employer->id . ") - " . $jobCount . " jobs</li>\n";
        }
    }
    echo "</ul>\n";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Test localStorage simulation failed: " . $e->getMessage() . "</p>\n";
}

// Test job posting and immediate viewing
echo "<h2>Test Job Posting and Immediate Viewing:</h2>\n";
try {
    // Simulate posting a job for employer ID 19
    // Select a random job from the sample jobs
    $selectedJob = $sampleJobs[array_rand($sampleJobs)];
    
    $newJob = Job::create(array_merge($selectedJob, [
        'employer_id' => 19,
        'is_active' => true,
    ]));
    
    echo "<p style='color: green;'>✓ Test job created successfully with ID: " . $newJob->id . "</p>\n";
    
    // Try to fetch jobs for employer ID 19 immediately
    $employerJobs = Job::where('employer_id', 19)->get();
    echo "<p>Jobs for employer ID 19 after posting: " . $employerJobs->count() . "</p>\n";
    
    // Try to fetch jobs using the same logic as the myJobs endpoint
    $myJobs = Job::where('employer_id', 19)->paginate(10);
    echo "<p>myJobs result for employer ID 19 after posting: " . $myJobs->count() . " jobs</p>\n";
    echo "<p>Total jobs for employer ID 19 after posting: " . $myJobs->total() . "</p>\n";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Test job posting and immediate viewing failed: " . $e->getMessage() . "</p>\n";
}

echo "<h2>Database Info:</h2>\n";
echo "<p>Database file: " . realpath('../database/database.sqlite') . "</p>\n";
echo "<p>File exists: " . (file_exists('../database/database.sqlite') ? 'Yes' : 'No') . "</p>\n";
echo "<p>File size: " . (file_exists('../database/database.sqlite') ? filesize('../database/database.sqlite') : 'N/A') . " bytes</p>\n";
?>