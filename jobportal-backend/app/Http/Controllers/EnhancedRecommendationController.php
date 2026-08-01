<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Job;
use App\Models\JobView;
use App\Models\Application;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EnhancedRecommendationController extends Controller
{
    // Weight constants for recommendation algorithms
    const PROFILE_WEIGHT = 0.35;
    const SKILL_WEIGHT = 0.25;
    const HISTORY_WEIGHT = 0.20;
    const LOCATION_WEIGHT = 0.10;
    const POPULARITY_WEIGHT = 0.10;

    // UNIVERSAL FIELD MAPPING - Covers ALL Academic Disciplines
    private $fieldMappings = [
        // === TECHNOLOGY & COMPUTING ===
        'Computer Science' => [
            'Software Development', 'Programming', 'Technology', 'IT', 'Computer Engineering',
            'Full Stack Development', 'Web Development', 'Mobile Development', 'Data Science',
            'Information Systems', 'Information Technology', 'Software Engineering', 'AI/ML',
            'Cybersecurity', 'Database Administration', 'DevOps', 'Cloud Computing'
        ],
        'Information Technology' => [
            'Computer Science', 'Software Development', 'System Administration', 'Network Engineering',
            'Technology', 'Information Systems', 'Cybersecurity', 'Database Administration',
            'Full Stack Development', 'Web Development', 'IT Support', 'Technical Support'
        ],
        'Information Systems' => [
            'Computer Science', 'Information Technology', 'Software Development', 'Technology',
            'Business Analysis', 'System Analysis', 'Database Management', 'Full Stack Development',
            'Business Intelligence', 'Data Analysis', 'Project Management'
        ],
        'Software Engineering' => [
            'Computer Science', 'Programming', 'Technology', 'Full Stack Development',
            'Web Development', 'Mobile Development', 'DevOps', 'Quality Assurance',
            'Agile Development', 'Scrum', 'Version Control', 'Code Review'
        ],
        'Computer Engineering' => [
            'Computer Science', 'Electrical Engineering', 'Hardware Engineering', 'Embedded Systems',
            'Software Development', 'Technology', 'IoT', 'Robotics', 'Firmware Development'
        ],
        'Data Science' => [
            'Computer Science', 'Statistics', 'Machine Learning', 'Analytics', 'Information Technology',
            'Big Data', 'Artificial Intelligence', 'Data Mining', 'Predictive Analytics'
        ],
        'Cybersecurity' => [
            'Computer Science', 'Information Technology', 'Network Security', 'Information Security',
            'Ethical Hacking', 'Security Analysis', 'Risk Assessment', 'Compliance'
        ],

        // === BUSINESS & MANAGEMENT ===
        'Business Administration' => [
            'Management', 'Marketing', 'Finance', 'Human Resources', 'Information Systems',
            'Business Analysis', 'Project Management', 'Entrepreneurship', 'Operations Management',
            'Strategic Planning', 'Business Development', 'Sales Management'
        ],
        'Marketing' => [
            'Business Administration', 'Digital Marketing', 'Social Media Marketing', 'Content Marketing',
            'Brand Management', 'Market Research', 'Advertising', 'Public Relations', 'SEO/SEM'
        ],
        'Finance' => [
            'Business Administration', 'Accounting', 'Financial Analysis', 'Investment Banking',
            'Financial Planning', 'Risk Management', 'Corporate Finance', 'Financial Modeling'
        ],
        'Accounting' => [
            'Finance', 'Business Administration', 'Financial Reporting', 'Taxation', 'Audit',
            'Financial Analysis', 'Cost Accounting', 'Management Accounting'
        ],
        'Human Resources' => [
            'Business Administration', 'Talent Management', 'Recruitment', 'Employee Relations',
            'Training & Development', 'HR Analytics', 'Organizational Development', 'Compensation'
        ],
        'International Business' => [
            'Business Administration', 'International Marketing', 'Global Trade', 'Cross-cultural Management',
            'Export/Import', 'International Finance', 'Global Strategy'
        ],

        // === ENGINEERING ===
        'Electrical Engineering' => [
            'Computer Engineering', 'Electronics', 'Telecommunications', 'Power Systems',
            'Control Systems', 'Embedded Systems', 'Signal Processing', 'RF Engineering'
        ],
        'Mechanical Engineering' => [
            'Manufacturing', 'Thermodynamics', 'Fluid Mechanics', 'Materials Science',
            'CAD/CAM', 'Robotics', 'Automotive Engineering', 'HVAC', 'Product Design'
        ],
        'Civil Engineering' => [
            'Structural Engineering', 'Construction', 'Transportation', 'Environmental Engineering',
            'Geotechnical Engineering', 'Urban Planning', 'Construction Management', 'Surveying'
        ],
        'Chemical Engineering' => [
            'Chemistry', 'Process Engineering', 'Petroleum Engineering', 'Materials Science',
            'Biochemical Engineering', 'Environmental Engineering', 'Quality Control'
        ],
        'Biomedical Engineering' => [
            'Biology', 'Electrical Engineering', 'Mechanical Engineering', 'Medical Devices',
            'Biomaterials', 'Medical Imaging', 'Rehabilitation Engineering'
        ],
        'Aerospace Engineering' => [
            'Mechanical Engineering', 'Electrical Engineering', 'Materials Science', 'Aerodynamics',
            'Propulsion Systems', 'Avionics', 'Space Systems'
        ],

        // === HEALTHCARE & MEDICAL ===
        'Medicine' => [
            'Healthcare', 'Clinical Practice', 'Medical Research', 'Patient Care', 'Surgery',
            'Internal Medicine', 'Pediatrics', 'Emergency Medicine', 'Public Health'
        ],
        'Nursing' => [
            'Healthcare', 'Patient Care', 'Medical/Surgical', 'Pediatric Nursing', 'Critical Care',
            'Emergency Nursing', 'Community Health', 'Mental Health Nursing'
        ],
        'Pharmacy' => [
            'Pharmaceutical Sciences', 'Clinical Pharmacy', 'Hospital Pharmacy', 'Community Pharmacy',
            'Pharmacology', 'Drug Information', 'Medication Therapy Management'
        ],
        'Public Health' => [
            'Healthcare Administration', 'Epidemiology', 'Health Education', 'Environmental Health',
            'Global Health', 'Health Policy', 'Biostatistics', 'Community Health'
        ],
        'Physical Therapy' => [
            'Healthcare', 'Rehabilitation', 'Sports Medicine', 'Orthopedics', 'Neurology',
            'Pediatric Therapy', 'Geriatric Care', 'Manual Therapy'
        ],

        // === SCIENCES ===
        'Biology' => [
            'Biotechnology', 'Microbiology', 'Genetics', 'Biochemistry', 'Environmental Science',
            'Molecular Biology', 'Cell Biology', 'Ecology', 'Marine Biology'
        ],
        'Chemistry' => [
            'Biochemistry', 'Pharmaceutical Sciences', 'Materials Science', 'Environmental Science',
            'Analytical Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Inorganic Chemistry'
        ],
        'Physics' => [
            'Mathematics', 'Engineering', 'Computer Science', 'Materials Science',
            'Nuclear Physics', 'Quantum Physics', 'Astrophysics', 'Medical Physics'
        ],
        'Mathematics' => [
            'Statistics', 'Data Science', 'Computer Science', 'Physics', 'Engineering',
            'Actuarial Science', 'Financial Mathematics', 'Cryptography'
        ],
        'Statistics' => [
            'Mathematics', 'Data Science', 'Analytics', 'Research', 'Quality Control',
            'Biostatistics', 'Econometrics', 'Statistical Modeling'
        ],
        'Environmental Science' => [
            'Biology', 'Chemistry', 'Geology', 'Ecology', 'Sustainability',
            'Environmental Engineering', 'Conservation', 'Climate Science'
        ],

        // === ARTS & HUMANITIES ===
        'Graphic Design' => [
            'Digital Media', 'UI/UX Design', 'Web Development', 'Advertising', 'Fine Arts',
            'Multimedia', 'Visual Communication', 'Brand Design', 'Print Design'
        ],
        'Fine Arts' => [
            'Graphic Design', 'Art Education', 'Museum Studies', 'Art History', 'Studio Art',
            'Digital Art', 'Sculpture', 'Painting', 'Photography'
        ],
        'English Literature' => [
            'Writing', 'Publishing', 'Content Creation', 'Technical Writing', 'Creative Writing',
            'Journalism', 'Communications', 'Public Relations', 'Marketing'
        ],
        'Psychology' => [
            'Counseling', 'Clinical Psychology', 'Industrial Psychology', 'Educational Psychology',
            'Research', 'Human Factors', 'Organizational Development', 'Mental Health'
        ],
        'Sociology' => [
            'Social Work', 'Community Development', 'Public Policy', 'Research',
            'Human Services', 'Non-profit Management', 'Demographic Analysis'
        ],
        'History' => [
            'Research', 'Archival Science', 'Museum Studies', 'Education', 'Public History',
            'Historical Preservation', 'Academic Administration'
        ],

        // === EDUCATION ===
        'Education' => [
            'Teaching', 'Curriculum Development', 'Educational Administration', 'Special Education',
            'Early Childhood Education', 'Educational Technology', 'Instructional Design'
        ],
        'Educational Technology' => [
            'Education', 'Instructional Design', 'E-learning', 'Distance Learning', 'Technology',
            'Multimedia Development', 'Learning Management Systems'
        ],

        // === LAW & LEGAL ===
        'Law' => [
            'Legal Practice', 'Corporate Law', 'Criminal Law', 'Family Law', 'Intellectual Property',
            'Environmental Law', 'International Law', 'Legal Research', 'Compliance'
        ],
        'Criminal Justice' => [
            'Law Enforcement', 'Corrections', 'Criminology', 'Forensic Science', 'Security',
            'Public Safety', 'Juvenile Justice', 'Victim Services'
        ],

        // === HOSPITALITY & TOURISM ===
        'Hospitality Management' => [
            'Hotel Management', 'Restaurant Management', 'Event Planning', 'Tourism',
            'Customer Service', 'Operations Management', 'Food & Beverage Management'
        ],
        'Tourism' => [
            'Hospitality Management', 'Travel Agency', 'Tour Operations', 'Destination Marketing',
            'Event Management', 'Cultural Tourism', 'Ecotourism'
        ],

        // === AGRICULTURE & NATURAL RESOURCES ===
        'Agricultural Science' => [
            'Farm Management', 'Crop Science', 'Animal Science', 'Agricultural Engineering',
            'Food Science', 'Sustainable Agriculture', 'Agribusiness'
        ],
        'Forestry' => [
            'Environmental Science', 'Natural Resource Management', 'Wildlife Management',
            'Conservation', 'Forest Management', 'GIS Mapping', 'Environmental Policy'
        ],

        // === COMMUNICATIONS ===
        'Communications' => [
            'Public Relations', 'Journalism', 'Digital Media', 'Corporate Communications',
            'Media Relations', 'Content Strategy', 'Social Media Management'
        ],
        'Journalism' => [
            'Communications', 'Digital Journalism', 'Broadcast Journalism', 'Print Journalism',
            'Photojournalism', 'Investigative Journalism', 'Sports Journalism'
        ],

        // === SPECIALIZED FIELDS ===
        'Architecture' => [
            'Urban Planning', 'Interior Design', 'Landscape Architecture', 'Sustainable Design',
            'Building Information Modeling', 'Construction Management', 'Historic Preservation'
        ],
        'Interior Design' => [
            'Architecture', 'Graphic Design', 'Space Planning', 'Furniture Design',
            'Lighting Design', 'Color Theory', 'CAD Design'
        ],
        'Fashion Design' => [
            'Textile Design', 'Fashion Merchandising', 'Apparel Design', 'Fashion Marketing',
            'Pattern Making', 'Sewing', 'Fashion Illustration'
        ],
        'Culinary Arts' => [
            'Restaurant Management', 'Food Science', 'Nutrition', 'Baking', 'Pastry Arts',
            'Food Styling', 'Menu Development', 'Kitchen Management'
        ]
    ];

    // Skill keywords mapping
    private $skillKeywords = [
        'programming' => ['javascript', 'python', 'java', 'c++', 'php', 'ruby', 'go', 'rust'],
        'web development' => ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express'],
        'database' => ['mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql'],
        'cloud' => ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
        'mobile' => ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
        'data science' => ['python', 'r', 'pandas', 'numpy', 'machine learning', 'ai'],
    ];

    /**
     * Get personalized job recommendations for the authenticated user
     * ONLY shows employer-posted jobs (no built-in/test jobs)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $limit = $request->get('limit', 10);

            // Get recommendations from employer-posted jobs only
            $profileJobs = $this->getProfileBasedJobs($user, ceil($limit * self::PROFILE_WEIGHT));
            $skillJobs = $this->getSkillBasedJobs($user, ceil($limit * self::SKILL_WEIGHT));
            $historyJobs = $this->getHistoryBasedJobs($user, ceil($limit * self::HISTORY_WEIGHT));
            $locationJobs = $this->getLocationBasedJobs($user, ceil($limit * self::LOCATION_WEIGHT));
            $popularJobs = $this->getPopularJobs($user, ceil($limit * self::POPULARITY_WEIGHT));

            // Combine all recommendations with weights
            $allJobs = collect();

            // Add profile-based jobs
            foreach ($profileJobs as $job) {
                $job->recommendation_source = 'profile';
                $job->base_score = $job->match_score ?? 0;
                $allJobs->push($job);
            }

            // Add skill-based jobs
            foreach ($skillJobs as $job) {
                $job->recommendation_source = 'skills';
                $job->base_score = $job->skill_score ?? 0;
                $allJobs->push($job);
            }

            // Add history-based jobs
            foreach ($historyJobs as $job) {
                $job->recommendation_source = 'history';
                $job->base_score = $job->similarity_score ?? 0;
                $allJobs->push($job);
            }

            // Add location-based jobs
            foreach ($locationJobs as $job) {
                $job->recommendation_source = 'location';
                $job->base_score = $job->location_score ?? 0;
                $allJobs->push($job);
            }

            // Add popular jobs
            foreach ($popularJobs as $job) {
                $job->recommendation_source = 'popular';
                $job->base_score = $job->popularity_score ?? 0;
                $allJobs->push($job);
            }

            // Remove duplicates and calculate final scores
            $uniqueJobs = $allJobs->unique('id');
            $jobsWithScores = $uniqueJobs->map(function ($job) use ($user) {
                $finalScore = $this->calculateFinalScore($job, $user);
                $job->final_score = $finalScore;
                return $job;
            })->sortByDesc('final_score')->take($limit);

            return response()->json([
                'message' => 'Personalized job recommendations',
                'data' => $jobsWithScores->values(),
                'meta' => [
                    'total_recommendations' => $jobsWithScores->count(),
                    'limit' => $limit,
                    'algorithms_used' => [
                        'profile_matching' => self::PROFILE_WEIGHT,
                        'skill_matching' => self::SKILL_WEIGHT,
                        'history_based' => self::HISTORY_WEIGHT,
                        'location_based' => self::LOCATION_WEIGHT,
                        'popularity_based' => self::POPULARITY_WEIGHT,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch recommendations',
                'message' => 'An error occurred while generating recommendations. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get job recommendations based on user profile with enhanced matching
     */
    private function getProfileBasedJobs($user, $limit)
    {
        $query = Job::where('is_active', true)
            ->where('application_deadline', '>', now())
            ->whereNotNull('employer_id') // Only real employer jobs
            ->where('employer_id', '!=', 0); // Exclude test jobs

        // Enhanced field matching with semantic mapping
        if ($user->fieldOfStudy) {
            $matchedFields = $this->getSemanticMatches($user->fieldOfStudy);

            $query->where(function ($q) use ($user, $matchedFields) {
                // Direct field match
                $q->where('category', 'like', "%{$user->fieldOfStudy}%")
                  ->orWhere('description', 'like', "%{$user->fieldOfStudy}%")
                  ->orWhere('title', 'like', "%{$user->fieldOfStudy}%");

                // Semantic matches
                foreach ($matchedFields as $field) {
                    $q->orWhere('category', 'like', "%{$field}%")
                      ->orWhere('description', 'like', "%{$field}%")
                      ->orWhere('title', 'like', "%{$field}%");
                }
            });
        }

        // Enhanced experience level matching
        if ($user->experience) {
            $experienceLevel = $this->extractExperienceLevel($user->experience);
            if ($experienceLevel) {
                $query->where('experience_level', $experienceLevel);
            }
        }

        // Location matching
        if ($user->location) {
            $query->where('location', 'like', "%{$user->location}%");
        }

        $jobs = $query->limit(max(1, intval($limit)))->get();

        // Calculate enhanced match scores
        return $jobs->map(function ($job) use ($user) {
            $score = $this->calculateEnhancedProfileMatchScore($job, $user);
            $job->match_score = $score;
            return $job;
        })->filter(function ($job) {
            // Only include jobs with a minimum match score
            return $job->match_score > 15;
        })->sortByDesc('match_score')->take(max(1, intval($limit)));
    }

    /**
     * Get skill-based job recommendations
     */
    private function getSkillBasedJobs($user, $limit)
    {
        $query = Job::where('is_active', true)
            ->where('application_deadline', '>', now())
            ->whereNotNull('employer_id') // Only real employer jobs
            ->where('employer_id', '!=', 0); // Exclude test jobs

        // Extract skills from user profile
        $userSkills = $this->extractUserSkills($user);

        if (!empty($userSkills)) {
            $query->where(function ($q) use ($userSkills) {
                foreach ($userSkills as $skill) {
                    $q->orWhere('description', 'like', "%{$skill}%")
                      ->orWhere('title', 'like', "%{$skill}%");
                }
            });
        }

        $jobs = $query->limit(max(1, intval($limit)))->get();

        return $jobs->map(function ($job) use ($user, $userSkills) {
            $score = $this->calculateSkillMatchScore($job, $userSkills);
            $job->skill_score = $score;
            return $job;
        })->sortByDesc('skill_score')->take(max(1, intval($limit)));
    }

    /**
     * Get history-based job recommendations
     */
    private function getHistoryBasedJobs($user, $limit)
    {
        $viewedJobIds = JobView::where('user_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        if (empty($viewedJobIds)) {
            return $this->getProfileBasedJobs($user, $limit);
        }

        $viewedJobs = Job::whereIn('id', $viewedJobIds)->get();

        // Extract patterns from viewed jobs
        $categories = $viewedJobs->pluck('category')->unique()->toArray();
        $jobTypes = $viewedJobs->pluck('job_type')->unique()->toArray();
        $experienceLevels = $viewedJobs->pluck('experience_level')->unique()->toArray();
        $locations = $viewedJobs->pluck('location')->unique()->toArray();

        $query = Job::where('is_active', true)
            ->where('application_deadline', '>', now())
            ->whereNotIn('id', $viewedJobIds)
            ->whereNotNull('employer_id') // Only real employer jobs
            ->where('employer_id', '!=', 0); // Exclude test jobs

        // Match similar jobs
        if (!empty($categories)) {
            $query->whereIn('category', $categories);
        }

        if (!empty($jobTypes)) {
            $query->whereIn('job_type', $jobTypes);
        }

        $jobs = $query->limit(max(1, intval($limit)))->get();

        return $jobs->map(function ($job) use ($user, $categories, $jobTypes, $experienceLevels, $locations) {
            $score = $this->calculateHistorySimilarityScore($job, $categories, $jobTypes, $experienceLevels, $locations);
            $job->similarity_score = $score;
            return $job;
        })->sortByDesc('similarity_score')->take(max(1, intval($limit)));
    }

    /**
     * Get location-based job recommendations
     */
    private function getLocationBasedJobs($user, $limit)
    {
        if (!$user->location) {
            return collect();
        }

        return Job::where('is_active', true)
            ->where('application_deadline', '>', now())
            ->where('location', 'like', "%{$user->location}%")
            ->whereNotNull('employer_id') // Only real employer jobs
            ->where('employer_id', '!=', 0) // Exclude test jobs
            ->limit(max(1, intval($limit)))
            ->get()
            ->map(function ($job) {
                $job->location_score = 100; // Full score for location match
                return $job;
            });
    }

    /**
     * Get popular jobs
     */
    private function getPopularJobs($user, $limit)
    {
        $recentViewsSubquery = JobView::select('job_id')
            ->selectRaw('COUNT(*) as view_count')
            ->where('created_at', '>', now()->subDays(30))
            ->groupBy('job_id');

        $recentAppsSubquery = Application::select('job_id')
            ->selectRaw('COUNT(*) as app_count')
            ->where('created_at', '>', now()->subDays(30))
            ->groupBy('job_id');

        return Job::select('job_listings.*')
            ->leftJoinSub($recentViewsSubquery, 'recent_views', function ($join) {
                $join->on('job_listings.id', '=', 'recent_views.job_id');
            })
            ->leftJoinSub($recentAppsSubquery, 'recent_apps', function ($join) {
                $join->on('job_listings.id', '=', 'recent_apps.job_id');
            })
            ->where('job_listings.is_active', true)
            ->where('job_listings.application_deadline', '>', now())
            ->whereNotNull('job_listings.employer_id') // Only real employer jobs
            ->where('job_listings.employer_id', '!=', 0) // Exclude test jobs
            ->selectRaw('job_listings.*,
                          COALESCE(recent_views.view_count, 0) as recent_views,
                          COALESCE(recent_apps.app_count, 0) as recent_applications,
                          (COALESCE(recent_views.view_count, 0) * 0.7 + COALESCE(recent_apps.app_count, 0) * 0.3) as popularity_score')
            ->orderByDesc('popularity_score')
            ->limit(max(1, intval($limit)))
            ->get();
    }

    /**
     * Get semantic matches for a field of study
     */
    private function getSemanticMatches($fieldOfStudy)
    {
        $matches = [];

        // Direct mapping
        if (isset($this->fieldMappings[$fieldOfStudy])) {
            $matches = array_merge($matches, $this->fieldMappings[$fieldOfStudy]);
        }

        // Partial matching
        foreach ($this->fieldMappings as $field => $relatedFields) {
            if (stripos($fieldOfStudy, $field) !== false) {
                $matches = array_merge($matches, $relatedFields);
            }
            if (stripos($field, $fieldOfStudy) !== false) {
                $matches = array_merge($matches, $relatedFields);
            }
        }

        return array_unique($matches);
    }

    /**
     * Extract experience level from text
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
     * Extract skills from user profile
     */
    private function extractUserSkills($user)
    {
        $skills = [];

        // Check experience field for skill keywords
        if ($user->experience) {
            foreach ($this->skillKeywords as $category => $keywords) {
                foreach ($keywords as $keyword) {
                    if (stripos($user->experience, $keyword) !== false) {
                        $skills[] = $keyword;
                    }
                }
            }
        }

        // Check degree/field for relevant skills
        if ($user->fieldOfStudy) {
            $fieldSkills = $this->getFieldRelatedSkills($user->fieldOfStudy);
            $skills = array_merge($skills, $fieldSkills);
        }

        return array_unique($skills);
    }

    /**
     * Get skills related to a field of study
     */
    private function getFieldRelatedSkills($fieldOfStudy)
    {
        $fieldSkills = [
            'Computer Science' => ['programming', 'javascript', 'python', 'java', 'algorithms', 'data structures'],
            'Information Technology' => ['networking', 'system administration', 'database', 'security'],
            'Software Engineering' => ['programming', 'testing', 'agile', 'version control', 'architecture'],
            'Data Science' => ['python', 'statistics', 'machine learning', 'data analysis', 'sql'],
            'Web Development' => ['html', 'css', 'javascript', 'react', 'node.js', 'php'],
        ];

        return $fieldSkills[$fieldOfStudy] ?? [];
    }

    /**
     * Calculate enhanced profile match score
     */
    private function calculateEnhancedProfileMatchScore($job, $user)
    {
        $score = 0;

        // Field of study matching (40%)
        if ($user->fieldOfStudy) {
            $directMatch = stripos($job->title, $user->fieldOfStudy) !== false ||
                          stripos($job->description, $user->fieldOfStudy) !== false ||
                          stripos($job->category, $user->fieldOfStudy) !== false;

            $semanticMatches = $this->getSemanticMatches($user->fieldOfStudy);
            $semanticMatch = false;
            foreach ($semanticMatches as $match) {
                if (stripos($job->title, $match) !== false ||
                    stripos($job->description, $match) !== false ||
                    stripos($job->category, $match) !== false) {
                    $semanticMatch = true;
                    break;
                }
            }

            if ($directMatch) {
                $score += 40;
            } elseif ($semanticMatch) {
                $score += 25;
            }
        }

        // Experience level matching (30%)
        if ($user->experience) {
            $userExpLevel = $this->extractExperienceLevel($user->experience);
            if ($userExpLevel && $userExpLevel === $job->experience_level) {
                $score += 30;
            }
        }

        // Location matching (20%)
        if ($user->location && stripos($job->location, $user->location) !== false) {
            $score += 20;
        }

        // Job type preference (10%)
        // This could be enhanced with user preferences
        $score += 10;

        return min(100, $score);
    }

    /**
     * Calculate skill match score
     */
    private function calculateSkillMatchScore($job, $userSkills)
    {
        if (empty($userSkills)) {
            return 0;
        }

        $matches = 0;
        $jobText = strtolower($job->title . ' ' . $job->description);

        foreach ($userSkills as $skill) {
            if (stripos($jobText, strtolower($skill)) !== false) {
                $matches++;
            }
        }

        // Calculate percentage match
        $matchPercentage = ($matches / count($userSkills)) * 100;

        return min(100, $matchPercentage);
    }

    /**
     * Calculate history similarity score
     */
    private function calculateHistorySimilarityScore($job, $categories, $jobTypes, $experienceLevels, $locations)
    {
        $score = 0;

        // Category similarity (40%)
        if (in_array($job->category, $categories)) {
            $score += 40;
        }

        // Job type similarity (30%)
        if (in_array($job->job_type, $jobTypes)) {
            $score += 30;
        }

        // Experience level similarity (20%)
        if (in_array($job->experience_level, $experienceLevels)) {
            $score += 20;
        }

        // Location similarity (10%)
        if (in_array($job->location, $locations)) {
            $score += 10;
        }

        return min(100, $score);
    }

    /**
     * Calculate final recommendation score
     */
    private function calculateFinalScore($job, $user)
    {
        $baseScore = $job->base_score ?? 0;

        // Apply source-specific multipliers
        $multiplier = match($job->recommendation_source) {
            'profile' => 1.2,
            'skills' => 1.1,
            'history' => 1.0,
            'location' => 0.9,
            'popular' => 0.8,
            default => 1.0
        };

        // Boost score for recent jobs
        $daysSincePosted = now()->diffInDays($job->created_at);
        $recencyBonus = max(0, 10 - $daysSincePosted); // Bonus for jobs posted within 10 days

        $finalScore = ($baseScore * $multiplier) + $recencyBonus;

        return min(100, $finalScore);
    }
}