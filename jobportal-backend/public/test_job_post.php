<?php
// Test job posting script
require_once '../vendor/autoload.php';
$app = require_once '../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Job;
use Illuminate\Http\Request;

echo "<h1>Test Job Posting</h1>\n";

// Simulate job posting
try {
    echo "<h2>Creating Test Job...</h2>\n";
    
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
    
    $jobData = array_merge($selectedJob, [
        'employer_id' => 1, // Assuming user ID 1 exists
        'is_active' => true,
    ]);
    
    // Create job directly
    $job = Job::create($jobData);
    
    echo "<p style='color: green;'>✓ Job created successfully!</p>\n";
    echo "<p>Job ID: " . $job->id . "</p>\n";
    echo "<p>Job Title: " . $job->title . "</p>\n";
    echo "<p>Is Active: " . ($job->is_active ? 'Yes' : 'No') . "</p>\n";
    
    // Try to retrieve it
    $retrievedJob = Job::find($job->id);
    if ($retrievedJob) {
        echo "<p style='color: green;'>✓ Job can be retrieved</p>\n";
    } else {
        echo "<p style='color: red;'>✗ Job cannot be retrieved</p>\n";
    }
    
    // Try search
    echo "<h2>Testing Search...</h2>\n";
    $searchResults = Job::where('is_active', true)->get();
    echo "<p>Total active jobs in search: " . $searchResults->count() . "</p>\n";
    
    foreach ($searchResults as $searchJob) {
        echo "<p>Found job: " . $searchJob->title . " (ID: " . $searchJob->id . ")</p>\n";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>\n";
    echo "<pre>" . $e->getTraceAsString() . "</pre>\n";
}
?>