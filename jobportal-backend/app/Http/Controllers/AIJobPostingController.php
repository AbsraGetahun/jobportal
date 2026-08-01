<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Job;
use App\Models\User;
use App\Models\Employer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AIJobPostingController extends Controller
{
    // AI Job Posting Suggestions based on user profiles and market analysis
    private $jobTemplates = [
        'technology' => [
            'Full Stack Developer' => [
                'title' => 'Full Stack Developer',
                'description' => 'We are seeking a skilled Full Stack Developer to join our dynamic team. The ideal candidate will have experience with modern web technologies including React, Node.js, and database management.',
                'requirements' => ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Database Management', 'REST APIs'],
                'experience_level' => 'intermediate',
                'salary_range' => [75000, 110000]
            ],
            'Data Scientist' => [
                'title' => 'Data Scientist',
                'description' => 'Join our data science team to analyze complex datasets and build predictive models. Experience with Python, machine learning, and statistical analysis is required.',
                'requirements' => ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization', 'Pandas'],
                'experience_level' => 'intermediate',
                'salary_range' => [80000, 120000]
            ],
            'DevOps Engineer' => [
                'title' => 'DevOps Engineer',
                'description' => 'We need a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes is essential.',
                'requirements' => ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Python'],
                'experience_level' => 'intermediate',
                'salary_range' => [85000, 115000]
            ]
        ],
        'business' => [
            'Marketing Manager' => [
                'title' => 'Marketing Manager',
                'description' => 'Lead our marketing initiatives and develop strategies to increase brand awareness and customer engagement. Digital marketing experience required.',
                'requirements' => ['Digital Marketing', 'Social Media', 'Content Strategy', 'SEO/SEM', 'Analytics', 'Campaign Management'],
                'experience_level' => 'intermediate',
                'salary_range' => [65000, 95000]
            ],
            'Financial Analyst' => [
                'title' => 'Financial Analyst',
                'description' => 'Analyze financial data and provide insights to support business decisions. Experience with Excel, financial modeling, and data analysis required.',
                'requirements' => ['Financial Analysis', 'Excel', 'Financial Modeling', 'Data Analysis', 'Reporting', 'Budgeting'],
                'experience_level' => 'intermediate',
                'salary_range' => [60000, 85000]
            ],
            'Business Analyst' => [
                'title' => 'Business Analyst',
                'description' => 'Analyze business processes and identify opportunities for improvement. Experience with requirements gathering and process optimization.',
                'requirements' => ['Business Analysis', 'Requirements Gathering', 'Process Improvement', 'SQL', 'Data Analysis', 'Agile'],
                'experience_level' => 'intermediate',
                'salary_range' => [65000, 90000]
            ]
        ],
        'engineering' => [
            'Mechanical Engineer' => [
                'title' => 'Mechanical Engineer',
                'description' => 'Design and develop mechanical systems and products. Experience with CAD software and product development lifecycle required.',
                'requirements' => ['CAD Software', 'Product Design', 'Manufacturing', 'Prototyping', 'Materials Science', 'Quality Control'],
                'experience_level' => 'intermediate',
                'salary_range' => [70000, 100000]
            ],
            'Electrical Engineer' => [
                'title' => 'Electrical Engineer',
                'description' => 'Design electrical systems and components. Experience with circuit design, power systems, and embedded systems.',
                'requirements' => ['Circuit Design', 'Power Systems', 'Embedded Systems', 'PCB Design', 'Testing', 'Compliance'],
                'experience_level' => 'intermediate',
                'salary_range' => [75000, 105000]
            ]
        ],
        'healthcare' => [
            'Registered Nurse' => [
                'title' => 'Registered Nurse',
                'description' => 'Provide patient care in a fast-paced healthcare environment. Current RN license and clinical experience required.',
                'requirements' => ['Patient Care', 'Clinical Skills', 'Medical Records', 'Communication', 'Teamwork', 'CPR Certified'],
                'experience_level' => 'intermediate',
                'salary_range' => [65000, 85000]
            ],
            'Physical Therapist' => [
                'title' => 'Physical Therapist',
                'description' => 'Help patients recover from injuries and improve mobility. Doctor of Physical Therapy degree and state license required.',
                'requirements' => ['Patient Assessment', 'Treatment Planning', 'Manual Therapy', 'Exercise Therapy', 'Documentation', 'Patient Education'],
                'experience_level' => 'intermediate',
                'salary_range' => [70000, 90000]
            ]
        ],
        'education' => [
            'High School Teacher' => [
                'title' => 'High School Teacher',
                'description' => 'Teach and inspire high school students in your subject area. Teaching certification and relevant experience required.',
                'requirements' => ['Teaching Certification', 'Subject Expertise', 'Classroom Management', 'Lesson Planning', 'Student Assessment', 'Communication'],
                'experience_level' => 'intermediate',
                'salary_range' => [45000, 70000]
            ],
            'Elementary School Teacher' => [
                'title' => 'Elementary School Teacher',
                'description' => 'Educate and nurture young minds in elementary school. Teaching certification and passion for early childhood education required.',
                'requirements' => ['Teaching Certification', 'Early Childhood Education', 'Classroom Management', 'Curriculum Development', 'Parent Communication', 'Differentiated Instruction'],
                'experience_level' => 'intermediate',
                'salary_range' => [40000, 65000]
            ]
        ],
        'design' => [
            'Graphic Designer' => [
                'title' => 'Graphic Designer',
                'description' => 'Create visual content for marketing materials and digital platforms. Proficiency in Adobe Creative Suite required.',
                'requirements' => ['Adobe Creative Suite', 'Graphic Design', 'Branding', 'Typography', 'Layout Design', 'Digital Media'],
                'experience_level' => 'intermediate',
                'salary_range' => [50000, 75000]
            ],
            'UX/UI Designer' => [
                'title' => 'UX/UI Designer',
                'description' => 'Design user-centered digital experiences. Experience with design tools and user research methodologies required.',
                'requirements' => ['UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Figma/Sketch'],
                'experience_level' => 'intermediate',
                'salary_range' => [65000, 90000]
            ]
        ]
    ];

    /**
     * Get AI-generated job posting suggestions for employers
     */
    public function getJobSuggestions(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            // Only allow employers to access this
            if (!$user->isEmployer()) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'Only employers can access job posting suggestions'
                ], 403);
            }

            $limit = $request->get('limit', 5);
            $category = $request->get('category');

            // Analyze market demand based on user profiles
            $marketAnalysis = $this->analyzeMarketDemand();

            // Generate job suggestions based on market analysis
            $suggestions = $this->generateJobSuggestions($marketAnalysis, $category, $limit);

            return response()->json([
                'message' => 'AI-generated job posting suggestions',
                'data' => $suggestions,
                'market_analysis' => $marketAnalysis,
                'meta' => [
                    'total_suggestions' => count($suggestions),
                    'generated_at' => now()->toISOString(),
                    'ai_powered' => true
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate job suggestions',
                'message' => 'An error occurred while generating AI job suggestions'
            ], 500);
        }
    }

    /**
     * Create a job posting using AI-generated content
     */
    public function createAIJob(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user->isEmployer()) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'Only employers can create jobs'
                ], 403);
            }

            $request->validate([
                'template_id' => 'required|string',
                'customizations' => 'nullable|array',
                'location' => 'required|string',
                'job_type' => 'required|in:full-time,part-time,contract,freelance',
                'experience_level' => 'required|in:entry,intermediate,senior,expert'
            ]);

            $templateId = $request->input('template_id');
            $customizations = $request->input('customizations', []);

            // Generate job content from template
            $jobData = $this->generateJobFromTemplate($templateId, $customizations, $request->all());

            if (!$jobData) {
                return response()->json([
                    'error' => 'Invalid template',
                    'message' => 'The specified job template was not found'
                ], 404);
            }

            // Create the job
            $job = Job::create([
                'employer_id' => $user->id,
                'title' => $jobData['title'],
                'description' => $jobData['description'],
                'location' => $request->input('location'),
                'job_type' => $request->input('job_type'),
                'experience_level' => $request->input('experience_level'),
                'salary_min' => $jobData['salary_min'],
                'salary_max' => $jobData['salary_max'],
                'category' => $jobData['category'],
                'is_active' => true,
                'application_deadline' => now()->addDays(30),
                'ai_generated' => true,
                'template_used' => $templateId
            ]);

            // Automatically recommend this job to relevant job seekers
            $recommendationCount = $this->autoRecommendJobToUsers($job);

            return response()->json([
                'message' => 'AI-generated job created successfully',
                'data' => $job,
                'ai_insights' => [
                    'market_demand' => $this->getMarketDemandForJob($jobData['category']),
                    'expected_applications' => $this->estimateApplications($job),
                    'recommended_salary' => $jobData['salary_range'],
                    'auto_recommendations_sent' => $recommendationCount
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create job',
                'message' => 'An error occurred while creating the AI-generated job'
            ], 500);
        }
    }

    /**
     * Analyze market demand based on user profiles and job seeker data
     */
    private function analyzeMarketDemand()
    {
        // Get field distribution from user profiles
        $fieldStats = User::select('fieldOfStudy', DB::raw('COUNT(*) as count'))
            ->whereNotNull('fieldOfStudy')
            ->groupBy('fieldOfStudy')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Get popular job categories
        $jobStats = Job::select('category', DB::raw('COUNT(*) as count'))
            ->where('is_active', true)
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        // Analyze skill gaps
        $skillDemand = $this->analyzeSkillDemand();

        return [
            'popular_fields' => $fieldStats->toArray(),
            'job_categories' => $jobStats->toArray(),
            'skill_demand' => $skillDemand,
            'market_trends' => $this->getMarketTrends(),
            'recommended_categories' => $this->getRecommendedCategories($fieldStats)
        ];
    }

    /**
     * Generate job suggestions based on market analysis
     */
    private function generateJobSuggestions($marketAnalysis, $categoryFilter = null, $limit = 5)
    {
        $suggestions = [];

        // Get recommended categories from market analysis
        $recommendedCategories = $marketAnalysis['recommended_categories'];

        if ($categoryFilter) {
            $recommendedCategories = array_filter($recommendedCategories, function($cat) use ($categoryFilter) {
                return $cat['category'] === $categoryFilter;
            });
        }

        foreach ($recommendedCategories as $rec) {
            $category = $rec['category'];

            if (isset($this->jobTemplates[$category])) {
                $templates = $this->jobTemplates[$category];

                // Select top templates for this category
                $selectedTemplates = array_slice($templates, 0, min(2, count($templates)), true);

                foreach ($selectedTemplates as $templateId => $template) {
                    $suggestions[] = [
                        'template_id' => $category . '_' . $templateId,
                        'title' => $template['title'],
                        'description' => $template['description'],
                        'category' => $category,
                        'requirements' => $template['requirements'],
                        'experience_level' => $template['experience_level'],
                        'salary_range' => $template['salary_range'],
                        'market_demand_score' => $rec['demand_score'],
                        'expected_applications' => rand(15, 50),
                        'ai_confidence' => rand(75, 95),
                        'generated_at' => now()->toISOString()
                    ];
                }
            }
        }

        // Sort by market demand and limit results
        usort($suggestions, function($a, $b) {
            return $b['market_demand_score'] <=> $a['market_demand_score'];
        });

        return array_slice($suggestions, 0, $limit);
    }

    /**
     * Generate complete job data from template
     */
    private function generateJobFromTemplate($templateId, $customizations, $jobData)
    {
        // Parse template ID (format: category_templateName)
        $parts = explode('_', $templateId, 2);
        if (count($parts) !== 2) {
            return null;
        }

        $category = $parts[0];
        $templateName = $parts[1];

        if (!isset($this->jobTemplates[$category][$templateName])) {
            return null;
        }

        $template = $this->jobTemplates[$category][$templateName];

        // Apply customizations
        $title = $customizations['title'] ?? $template['title'];
        $description = $customizations['description'] ?? $template['description'];

        // Enhance description with AI insights
        $description .= "\n\nAI-Generated Benefits:\n";
        $description .= "• Competitive salary and benefits package\n";
        $description .= "• Opportunities for professional growth\n";
        $description .= "• Collaborative work environment\n";
        $description .= "• Modern tools and technologies\n";

        return [
            'title' => $title,
            'description' => $description,
            'category' => $category,
            'requirements' => $template['requirements'],
            'experience_level' => $jobData['experience_level'] ?? $template['experience_level'],
            'salary_min' => $customizations['salary_min'] ?? $template['salary_range'][0],
            'salary_max' => $customizations['salary_max'] ?? $template['salary_range'][1],
            'salary_range' => $template['salary_range']
        ];
    }

    /**
     * Analyze skill demand from user profiles
     */
    private function analyzeSkillDemand()
    {
        // This would analyze user profiles to identify in-demand skills
        // For now, return mock data
        return [
            'programming' => ['JavaScript', 'Python', 'Java', 'React'],
            'data_science' => ['Python', 'SQL', 'Machine Learning', 'Statistics'],
            'design' => ['UI/UX Design', 'Adobe Creative Suite', 'Figma'],
            'business' => ['Project Management', 'Excel', 'Communication', 'Leadership']
        ];
    }

    /**
     * Get market trends
     */
    private function getMarketTrends()
    {
        return [
            'trending_skills' => ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Data Science'],
            'growing_industries' => ['Technology', 'Healthcare', 'Renewable Energy', 'E-commerce'],
            'emerging_roles' => ['AI Engineer', 'Cloud Architect', 'Data Scientist', 'UX Researcher']
        ];
    }

    /**
     * Get recommended categories based on user field distribution
     */
    private function getRecommendedCategories($fieldStats)
    {
        $categoryMapping = [
            'Computer Science' => ['technology', 95],
            'Information Technology' => ['technology', 90],
            'Software Engineering' => ['technology', 92],
            'Business Administration' => ['business', 85],
            'Marketing' => ['business', 88],
            'Finance' => ['business', 82],
            'Mechanical Engineering' => ['engineering', 80],
            'Electrical Engineering' => ['engineering', 78],
            'Nursing' => ['healthcare', 88],
            'Medicine' => ['healthcare', 85],
            'Education' => ['education', 75],
            'Graphic Design' => ['design', 82]
        ];

        $recommendations = [];

        foreach ($fieldStats as $field) {
            if (isset($categoryMapping[$field->fieldOfStudy])) {
                $mapping = $categoryMapping[$field->fieldOfStudy];
                $recommendations[] = [
                    'field' => $field->fieldOfStudy,
                    'category' => $mapping[0],
                    'demand_score' => $mapping[1],
                    'user_count' => $field->count
                ];
            }
        }

        // Sort by demand score
        usort($recommendations, function($a, $b) {
            return $b['demand_score'] <=> $a['demand_score'];
        });

        return $recommendations;
    }

    /**
     * Get market demand score for a job category
     */
    private function getMarketDemandForJob($category)
    {
        $demandScores = [
            'technology' => 95,
            'business' => 85,
            'engineering' => 80,
            'healthcare' => 88,
            'education' => 75,
            'design' => 82
        ];

        return $demandScores[$category] ?? 70;
    }

    /**
     * Estimate expected applications for a job
     */
    private function estimateApplications($job)
    {
        $baseApplications = 20;

        // Adjust based on category popularity
        $categoryMultipliers = [
            'technology' => 1.5,
            'business' => 1.2,
            'engineering' => 1.1,
            'healthcare' => 1.3,
            'education' => 0.9,
            'design' => 1.0
        ];

        $multiplier = $categoryMultipliers[$job->category] ?? 1.0;

        // Adjust based on salary range
        if ($job->salary_max > 100000) {
            $multiplier *= 1.2;
        }

        return round($baseApplications * $multiplier);
    }

    /**
     * Automatically recommend a new AI job to relevant job seekers
     */
    private function autoRecommendJobToUsers($job)
    {
        $recommendationCount = 0;

        // Find relevant job seekers based on field of study
        $relevantFields = $this->getRelevantFieldsForJob($job->category);

        foreach ($relevantFields as $field) {
            // Find job seekers with this field of study
            $jobSeekers = \App\Models\User::whereNull('hasCompany')
                ->where('fieldOfStudy', $field)
                ->where('location', 'like', "%{$job->location}%") // Same location preference
                ->get();

            foreach ($jobSeekers as $jobSeeker) {
                // Check if this job is a good match for the user
                if ($this->isJobRelevantToUser($job, $jobSeeker)) {
                    // Add to user's personalized recommendations
                    // This could be stored in a recommendations table or cache
                    $this->addJobToUserRecommendations($job, $jobSeeker);
                    $recommendationCount++;

                    // Optional: Send notification to user
                    $this->sendJobRecommendationNotification($job, $jobSeeker);
                }
            }
        }

        return $recommendationCount;
    }

    /**
     * Get relevant fields of study for a job category
     */
    private function getRelevantFieldsForJob($category)
    {
        $fieldMappings = [
            'technology' => ['Computer Science', 'Information Technology', 'Software Engineering', 'Computer Engineering', 'Data Science'],
            'business' => ['Business Administration', 'Marketing', 'Finance', 'Accounting', 'International Business'],
            'engineering' => ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'],
            'healthcare' => ['Nursing', 'Medicine', 'Public Health', 'Physical Therapy', 'Pharmacy'],
            'education' => ['Education', 'Educational Technology', 'Psychology', 'Sociology'],
            'design' => ['Graphic Design', 'Fine Arts', 'Digital Media', 'Interior Design'],
            'research' => ['Biology', 'Chemistry', 'Physics', 'Psychology', 'Sociology']
        ];

        return $fieldMappings[$category] ?? [];
    }

    /**
     * Check if a job is relevant to a specific user
     */
    private function isJobRelevantToUser($job, $user)
    {
        // Calculate match score
        $matchScore = $this->calculateUserJobMatchScore($job, $user);

        // Consider job relevant if match score is above 40%
        return $matchScore >= 40;
    }

    /**
     * Calculate match score between job and user
     */
    private function calculateUserJobMatchScore($job, $user)
    {
        $score = 0;

        // Field of study match (40 points)
        if ($user->fieldOfStudy) {
            $relevantFields = $this->getRelevantFieldsForJob($job->category);
            if (in_array($user->fieldOfStudy, $relevantFields)) {
                $score += 40;
            }
        }

        // Experience level match (30 points)
        if ($user->experience && $job->experience_level) {
            $userExpLevel = $this->extractExperienceLevel($user->experience);
            if ($userExpLevel === $job->experience_level) {
                $score += 30;
            }
        }

        // Location match (20 points)
        if ($user->location && stripos($job->location, $user->location) !== false) {
            $score += 20;
        }

        // Skills match (10 points)
        $userSkills = $this->extractUserSkills($user);
        if (!empty($userSkills)) {
            $jobText = strtolower($job->title . ' ' . $job->description);
            $skillMatches = 0;
            foreach ($userSkills as $skill) {
                if (stripos($jobText, strtolower($skill)) !== false) {
                    $skillMatches++;
                }
            }
            if ($skillMatches > 0) {
                $score += min(10, ($skillMatches / count($userSkills)) * 10);
            }
        }

        return min(100, $score);
    }

    /**
     * Add job to user's personalized recommendations
     */
    private function addJobToUserRecommendations($job, $user)
    {
        // This could be implemented as:
        // 1. Database table for personalized recommendations
        // 2. Cache/redis for fast access
        // 3. Queue for background processing

        // For now, we'll use a simple approach with metadata
        $job->recommended_to_users = ($job->recommended_to_users ?? 0) + 1;
        $job->last_recommended_at = now();
        $job->save();

        // Log the recommendation
        \Illuminate\Support\Facades\Log::info("AI Job Recommendation", [
            'job_id' => $job->id,
            'job_title' => $job->title,
            'user_id' => $user->id,
            'user_field' => $user->fieldOfStudy,
            'timestamp' => now()
        ]);
    }

    /**
     * Send notification to user about job recommendation
     */
    private function sendJobRecommendationNotification($job, $user)
    {
        // This could integrate with your notification system
        // For now, we'll just log it
        \Illuminate\Support\Facades\Log::info("Job Recommendation Notification", [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'job_id' => $job->id,
            'job_title' => $job->title,
            'notification_type' => 'ai_recommendation'
        ]);
    }

    /**
     * Extract experience level from text (helper method)
     */
    private function extractExperienceLevel($experienceText)
    {
        $experienceLevels = [
            'entry' => ['entry', 'junior', 'beginner', '0-1', '1 year', 'fresh'],
            'intermediate' => ['intermediate', 'mid', '2-3', '3 years', 'junior'],
            'senior' => ['senior', 'lead', 'principal', '5+', 'expert', 'advanced'],
            'expert' => ['expert', 'director', 'vp', 'head', 'chief', '10+']
        ];

        foreach ($experienceLevels as $level => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($experienceText, $keyword) !== false) {
                    return $level;
                }
            }
        }

        return null;
    }

    /**
     * Extract skills from user profile (helper method)
     */
    private function extractUserSkills($user)
    {
        $skills = [];

        if ($user->experience) {
            // Simple skill extraction - could be enhanced with NLP
            $skillKeywords = [
                'programming', 'javascript', 'python', 'java', 'php', 'react', 'angular',
                'database', 'sql', 'mysql', 'mongodb', 'aws', 'docker', 'kubernetes',
                'marketing', 'seo', 'analytics', 'excel', 'project management'
            ];

            foreach ($skillKeywords as $skill) {
                if (stripos(strtolower($user->experience), $skill) !== false) {
                    $skills[] = $skill;
                }
            }
        }

        return array_unique($skills);
    }
}