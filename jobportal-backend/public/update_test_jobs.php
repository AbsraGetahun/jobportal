<?php
// Script to update existing "Test Job" titles to descriptive titles
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Job;

echo "<h1>Updating Test Jobs with Descriptive Titles</h1>\n";

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
    ],
    [
        'title' => 'Project Manager',
        'description' => 'We are seeking an experienced Project Manager to lead our infrastructure projects. The candidate should have a proven track record of delivering complex projects on time and within budget.',
        'location' => 'Mekelle',
        'job_type' => 'full-time',
        'experience_level' => 'expert',
        'salary_min' => 9000.00,
        'salary_max' => 18000.00,
        'category' => 'engineering',
        'is_remote' => false,
        'application_deadline' => date('Y-m-d', strtotime('+25 days'))
    ],
    [
        'title' => 'UX Designer',
        'description' => 'Join our design team to create intuitive and engaging user experiences. The ideal candidate will have a strong portfolio and experience with design thinking methodologies.',
        'location' => 'Addis Ababa',
        'job_type' => 'full-time',
        'experience_level' => 'intermediate',
        'salary_min' => 6000.00,
        'salary_max' => 11000.00,
        'category' => 'design',
        'is_remote' => true,
        'application_deadline' => date('Y-m-d', strtotime('+20 days'))
    ]
];

try {
    // Find all jobs with "Test Job" in the title
    $testJobs = Job::where('title', 'like', 'Test Job%')->get();
    
    echo "<p>Found " . $testJobs->count() . " jobs with 'Test Job' titles to update</p>\n";
    
    foreach ($testJobs as $job) {
        // Select a random job from the sample jobs
        $selectedJob = $sampleJobs[array_rand($sampleJobs)];
        
        // Update the job with descriptive details
        $job->update($selectedJob);
        
        echo "<p style='color: green;'>✓ Updated job ID " . $job->id . " to '" . $selectedJob['title'] . "'</p>\n";
    }
    
    echo "<p style='color: green;'>✓ All test jobs have been updated successfully!</p>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error updating jobs: " . $e->getMessage() . "</p>\n";
}

echo "<h2>Verifying Updates:</h2>\n";
try {
    // Show recent jobs to verify the updates
    $recentJobs = Job::orderBy('created_at', 'desc')->limit(10)->get();
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
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error fetching recent jobs: " . $e->getMessage() . "</p>\n";
}
?>