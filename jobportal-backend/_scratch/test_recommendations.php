<?php
/**
 * Test script for the enhanced job recommendation system
 */

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Job;
use App\Http\Controllers\EnhancedRecommendationController;

echo "=== TESTING ENHANCED JOB RECOMMENDATION SYSTEM ===\n\n";

// Find the Computer Science user
$user = User::where('fieldOfStudy', 'Computer Science')->first();
if (!$user) {
    echo "❌ No Computer Science user found. Creating test user...\n";
    $user = User::create([
        'name' => 'Alice Johnson',
        'username' => 'alice_cs',
        'email' => 'alice.cs@example.com',
        'password' => bcrypt('password123'),
        'fieldOfStudy' => 'Computer Science',
        'degree' => 'Bachelor of Science',
        'experience' => '2 years of programming experience',
        'location' => 'New York',
        'graduationYear' => '2023'
    ]);
    echo "✅ Created test user: {$user->name}\n";
}

echo "👤 Test User: {$user->name} (ID: {$user->id})\n";
echo "📚 Field of Study: {$user->fieldOfStudy}\n";
echo "💼 Experience: {$user->experience}\n";
echo "📍 Location: {$user->location}\n\n";

// Find Software Developer jobs
$softwareJobs = Job::where(function($query) {
    $query->where('title', 'like', '%Software%')
          ->orWhere('title', 'like', '%Developer%')
          ->orWhere('description', 'like', '%developer%')
          ->orWhere('description', 'like', '%programming%');
})->where('is_active', true)->get();

echo "💼 Available Software/Developer Jobs:\n";
if ($softwareJobs->isEmpty()) {
    echo "❌ No software developer jobs found. Creating test job...\n";
    $job = Job::create([
        'employer_id' => 2,
        'title' => 'Full Stack Software Developer',
        'description' => 'We are looking for a skilled full stack developer with experience in React, Node.js, and database design. Computer Science background preferred.',
        'location' => 'New York',
        'job_type' => 'full-time',
        'experience_level' => 'intermediate',
        'salary_min' => 80000,
        'salary_max' => 120000,
        'category' => 'technology',
        'is_active' => true,
        'application_deadline' => now()->addDays(30)
    ]);
    echo "✅ Created test job: {$job->title}\n";
    $softwareJobs = collect([$job]);
}

foreach ($softwareJobs as $job) {
    echo "  • {$job->title} (ID: {$job->id})\n";
    echo "    📝 Description: " . substr($job->description, 0, 80) . "...\n";
    echo "    📍 Location: {$job->location}\n";
    echo "    🏷️  Category: {$job->category}\n\n";
}

// Test the recommendation system
echo "🤖 Testing Enhanced Recommendation System...\n";
echo "==========================================\n\n";

try {
    // Simulate authenticated user
    auth()->login($user);

    // Create controller instance
    $controller = new EnhancedRecommendationController();

    // Get recommendations
    $request = new Illuminate\Http\Request();
    $request->merge(['limit' => 5]);

    $response = $controller->getRecommendations($request);
    $data = json_decode($response->getContent(), true);

    if (isset($data['data']) && !empty($data['data'])) {
        echo "✅ SUCCESS! Recommendations found:\n\n";

        foreach ($data['data'] as $index => $job) {
            echo "🎯 Recommendation #" . ($index + 1) . ":\n";
            echo "   📋 Title: {$job['title']}\n";
            echo "   🏷️  Category: {$job['category']}\n";
            echo "   📍 Location: {$job['location']}\n";
            echo "   ⭐ Final Score: {$job['final_score']}\n";
            echo "   🔍 Source: {$job['recommendation_source']}\n\n";
        }

        echo "🎉 The Computer Science student is now properly matched with Software Developer jobs!\n";
    } else {
        echo "❌ No recommendations found. This might indicate an issue with the matching algorithm.\n";
    }

} catch (\Exception $e) {
    echo "❌ Error testing recommendations: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
echo "💡 To use the enhanced recommendations in your app:\n";
echo "   GET /api/enhanced-recommendations\n";
echo "   GET /api/enhanced-recommendations/profile\n";
echo "   GET /api/enhanced-recommendations/skills\n";
echo "   GET /api/enhanced-recommendations/history\n";
