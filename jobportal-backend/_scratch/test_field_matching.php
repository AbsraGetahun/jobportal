<?php
/**
 * Comprehensive Field Matching Test for Job Recommendations
 * Tests how "Full Stack Developer" jobs match different fields of study
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

echo "🎯 COMPREHENSIVE FIELD MATCHING TEST\n";
echo "=====================================\n\n";

echo "📋 TESTING: Full Stack Developer Job Matching\n\n";

// Create or find the Full Stack Developer job
$fullStackJob = Job::where('title', 'like', '%Full Stack%')->first();

if (!$fullStackJob) {
    $fullStackJob = Job::create([
        'employer_id' => 2,
        'title' => 'Full Stack Developer',
        'description' => 'We are looking for a skilled full stack developer proficient in React, Node.js, Express, MongoDB, and modern web technologies. Experience with REST APIs, Git, and agile development methodologies is required.',
        'location' => 'New York',
        'job_type' => 'full-time',
        'experience_level' => 'intermediate',
        'salary_min' => 75000,
        'salary_max' => 110000,
        'category' => 'technology',
        'is_active' => true,
        'application_deadline' => now()->addDays(30)
    ]);
    echo "✅ Created Full Stack Developer test job\n";
}

echo "💼 Test Job: {$fullStackJob->title}\n";
echo "   📝 Description: " . substr($fullStackJob->description, 0, 100) . "...\n";
echo "   🏷️  Category: {$fullStackJob->category}\n";
echo "   📍 Location: {$fullStackJob->location}\n\n";

// Test different fields of study
$testFields = [
    'Computer Science' => [
        'name' => 'Alice Johnson',
        'experience' => '2 years software development experience',
        'expected_score' => '85-95%'
    ],
    'Information Technology' => [
        'name' => 'Bob Smith',
        'experience' => '3 years IT infrastructure management',
        'expected_score' => '80-90%'
    ],
    'Information Systems' => [
        'name' => 'Carol Davis',
        'experience' => '2 years systems analysis and design',
        'expected_score' => '75-85%'
    ],
    'Software Engineering' => [
        'name' => 'David Wilson',
        'experience' => '3 years software engineering',
        'expected_score' => '90-95%'
    ],
    'Computer Engineering' => [
        'name' => 'Eva Brown',
        'experience' => '2 years computer engineering',
        'expected_score' => '70-80%'
    ],
    'Web Development' => [
        'name' => 'Frank Miller',
        'experience' => '2 years web development',
        'expected_score' => '85-95%'
    ],
    'Business Administration' => [
        'name' => 'Grace Lee',
        'experience' => '3 years business administration',
        'expected_score' => '20-30%'
    ]
];

echo "🧪 TESTING FIELD MATCHING RESULTS:\n";
echo "==================================\n\n";

$results = [];

foreach ($testFields as $fieldOfStudy => $userData) {
    echo "👤 Testing: {$fieldOfStudy}\n";
    echo "   📚 Field: {$fieldOfStudy}\n";
    echo "   👨‍💼 Name: {$userData['name']}\n";
    echo "   💼 Experience: {$userData['experience']}\n";
    echo "   🎯 Expected: {$userData['expected_score']}\n\n";

    // Create or find test user
    $user = User::where('fieldOfStudy', $fieldOfStudy)->first();

    if (!$user) {
        $user = User::create([
            'name' => $userData['name'],
            'username' => strtolower(str_replace(' ', '_', $userData['name'])),
            'email' => strtolower(str_replace(' ', '.', $userData['name'])) . '@example.com',
            'password' => bcrypt('password123'),
            'fieldOfStudy' => $fieldOfStudy,
            'degree' => 'Bachelor of Science',
            'experience' => $userData['experience'],
            'location' => 'New York',
            'graduationYear' => '2023'
        ]);
        echo "   ✅ Created test user\n";
    }

    // Test the recommendation system
    try {
        // Simulate authenticated user
        auth()->login($user);

        // Create controller instance
        $controller = new EnhancedRecommendationController();

        // Get recommendations
        $request = new Illuminate\Http\Request();
        $request->merge(['limit' => 10]);

        $response = $controller->getRecommendations($request);
        $data = json_decode($response->getContent(), true);

        if (isset($data['data']) && !empty($data['data'])) {
            // Find our test job in recommendations
            $jobFound = false;
            $matchScore = 0;
            $finalScore = 0;

            foreach ($data['data'] as $recommendedJob) {
                if ($recommendedJob['id'] == $fullStackJob->id) {
                    $jobFound = true;
                    $matchScore = $recommendedJob['match_score'] ?? 0;
                    $finalScore = $recommendedJob['final_score'] ?? 0;
                    break;
                }
            }

            if ($jobFound) {
                echo "   🎉 SUCCESS! Job found in recommendations\n";
                echo "   📊 Match Score: " . number_format($matchScore, 1) . "/100\n";
                echo "   ⭐ Final Score: " . number_format($finalScore, 1) . "/100\n";

                // Determine score quality
                if ($finalScore >= 80) {
                    echo "   🟢 EXCELLENT MATCH - Highly recommended!\n";
                } elseif ($finalScore >= 60) {
                    echo "   🟡 GOOD MATCH - Worth considering\n";
                } elseif ($finalScore >= 40) {
                    echo "   🟠 FAIR MATCH - May need adjustments\n";
                } else {
                    echo "   🔴 POOR MATCH - Not recommended\n";
                }

                $results[$fieldOfStudy] = [
                    'found' => true,
                    'match_score' => $matchScore,
                    'final_score' => $finalScore,
                    'quality' => getScoreQuality($finalScore)
                ];
            } else {
                echo "   ❌ Job NOT found in recommendations\n";
                echo "   💡 This means the field matching didn't work for this field\n";

                $results[$fieldOfStudy] = [
                    'found' => false,
                    'match_score' => 0,
                    'final_score' => 0,
                    'quality' => 'Not Found'
                ];
            }
        } else {
            echo "   ❌ No recommendations returned\n";
            $results[$fieldOfStudy] = [
                'found' => false,
                'match_score' => 0,
                'final_score' => 0,
                'quality' => 'No Results'
            ];
        }

    } catch (\Exception $e) {
        echo "   ❌ Error testing recommendations: " . $e->getMessage() . "\n";
        $results[$fieldOfStudy] = [
            'found' => false,
            'match_score' => 0,
            'final_score' => 0,
            'quality' => 'Error'
        ];
    }

    echo "\n" . str_repeat("-", 50) . "\n\n";
}

// Summary Report
echo "📊 FINAL SUMMARY REPORT\n";
echo "======================\n\n";

echo "🎯 Full Stack Developer Job Matching Results:\n\n";

$excellentCount = 0;
$goodCount = 0;
$fairCount = 0;
$poorCount = 0;
$notFoundCount = 0;

foreach ($results as $field => $result) {
    $score = $result['final_score'];
    $quality = $result['quality'];

    if ($result['found']) {
        if ($score >= 80) {
            $excellentCount++;
            echo "🟢 {$field}: {$score}/100 - EXCELLENT\n";
        } elseif ($score >= 60) {
            $goodCount++;
            echo "🟡 {$field}: {$score}/100 - GOOD\n";
        } elseif ($score >= 40) {
            $fairCount++;
            echo "🟠 {$field}: {$score}/100 - FAIR\n";
        } else {
            $poorCount++;
            echo "🔴 {$field}: {$score}/100 - POOR\n";
        }
    } else {
        $notFoundCount++;
        echo "❌ {$field}: NOT FOUND - No match\n";
    }
}

echo "\n📈 STATISTICS:\n";
echo "   🟢 Excellent matches (80-100%): {$excellentCount}\n";
echo "   🟡 Good matches (60-79%): {$goodCount}\n";
echo "   🟠 Fair matches (40-59%): {$fairCount}\n";
echo "   🔴 Poor matches (0-39%): {$poorCount}\n";
echo "   ❌ Not found: {$notFoundCount}\n\n";

$totalFields = count($results);
$matchedFields = $totalFields - $notFoundCount;
$matchRate = $totalFields > 0 ? ($matchedFields / $totalFields) * 100 : 0;

echo "🎯 OVERALL SUCCESS RATE: " . number_format($matchRate, 1) . "%\n";
echo "   {$matchedFields} out of {$totalFields} fields successfully matched\n\n";

if ($matchRate >= 80) {
    echo "🎉 EXCELLENT! The field matching system is working perfectly!\n";
} elseif ($matchRate >= 60) {
    echo "👍 GOOD! The system is working well with most fields.\n";
} else {
    echo "⚠️  NEEDS IMPROVEMENT: Some fields are not matching properly.\n";
}

echo "\n💡 KEY INSIGHTS:\n";
echo "   • Computer Science, IT, IS, and Software Engineering should get 70%+ matches\n";
echo "   • Related fields like Web Development should get 80%+ matches\n";
echo "   • Unrelated fields like Business Administration should get low matches\n";
echo "   • All technology-related fields should find the Full Stack Developer job\n\n";

echo "🚀 RECOMMENDATION SYSTEM STATUS: ";
if ($excellentCount >= 3 && $matchRate >= 70) {
    echo "✅ WORKING PERFECTLY!\n";
} elseif ($goodCount >= 2 && $matchRate >= 50) {
    echo "👍 WORKING WELL\n";
} else {
    echo "🔧 NEEDS TUNING\n";
}

echo "\n💻 Test completed successfully!\n";
echo "   Run: php test_field_matching.php\n";
echo "   API: GET /api/enhanced-recommendations\n";

function getScoreQuality($score) {
    if ($score >= 80) return 'Excellent';
    if ($score >= 60) return 'Good';
    if ($score >= 40) return 'Fair';
    if ($score >= 20) return 'Poor';
    return 'Very Poor';
}