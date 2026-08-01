<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Job;
use App\Models\JobView;
use App\Models\Application;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    /**
     * Get job recommendations for the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);
        $category = $request->get('category');
        $jobType = $request->get('job_type');
        $experienceLevel = $request->get('experience_level');
        
        // Get profile-based recommendations (30% weight)
        $profileJobs = $this->getProfileBasedJobs($user, $limit * 0.3);
        
        // Get history-based recommendations (30% weight)
        $historyJobs = $this->getHistoryBasedJobs($user, $limit * 0.3);
        
        // Get skill-based recommendations (20% weight)
        $skillJobs = $this->getSkillBasedJobs($user, $limit * 0.2);
        
        // Get popularity-based recommendations (10% weight)
        $popularJobs = $this->getPopularJobs($user, $limit * 0.1);
        
        // Get company preference recommendations (10% weight)
        $companyPreferenceJobs = $this->getCompanyPreferenceJobs($user, $limit * 0.1);
        
        // Combine all recommendations
        $allJobs = $profileJobs->merge($historyJobs)
            ->merge($skillJobs)
            ->merge($popularJobs)
            ->merge($companyPreferenceJobs)
            ->unique('id');
        
        // Apply filters
        $filteredJobs = $allJobs;
        
        if ($category) {
            $filteredJobs = $filteredJobs->filter(function ($job) use ($category) {
                return $job->category === $category;
            });
        }
        
        if ($jobType) {
            $filteredJobs = $filteredJobs->filter(function ($job) use ($jobType) {
                return $job->job_type === $jobType;
            });
        }
        
        if ($experienceLevel) {
            $filteredJobs = $filteredJobs->filter(function ($job) use ($experienceLevel) {
                return $job->experience_level === $experienceLevel;
            });
        }
        
        // Convert to array to add relevance scores
        $jobsWithScores = $filteredJobs->map(function ($job) use ($user) {
            $jobArray = $job->toArray();
            $score = $this->calculateRelevanceScore($job, $user);
            $jobArray['relevance_score'] = $score;
            return $jobArray;
        })->sortByDesc('relevance_score')->take($limit);
        
        // Convert to indexed array to ensure proper JSON format
        $result = array_values($jobsWithScores->toArray());
        
        return response()->json([
            'message' => 'Personalized job recommendations',
            'data' => $result
        ]);
    }

    /**
     * Get job recommendations based on user profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getProfileBasedRecommendations(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);
        $category = $request->get('category');
        $jobType = $request->get('job_type');
        
        // Get jobs that match user's profile
        $query = Job::where('is_active', true)
            ->where('application_deadline', '>', now());

        // Filter by user's field of study
        if ($user->fieldOfStudy) {
            $query->where(function ($q) use ($user) {
                $q->where('category', 'like', "%{$user->fieldOfStudy}%")
                  ->orWhere('description', 'like', "%{$user->fieldOfStudy}%");
            });
        }
        
        // Filter by user's experience level
        if ($user->experience) {
            // Extract experience level from user's experience description
            $experienceKeywords = ['entry', 'intermediate', 'senior', 'expert', 'director'];
            foreach ($experienceKeywords as $keyword) {
                if (stripos($user->experience, $keyword) !== false) {
                    $query->where('experience_level', $keyword);
                    break;
                }
            }
        }
        
        // Apply category filter if provided
        if ($category) {
            $query->where('category', $category);
        }
        
        // Apply job type filter if provided
        if ($jobType) {
            $query->where('job_type', $jobType);
        }
        
        $jobs = $query->limit($limit)->get();
        
        // Calculate match scores
        $jobsWithScores = $jobs->map(function ($job) use ($user) {
            $score = $this->calculateProfileMatchScore($job, $user);
            $job->match_score = $score;
            return $job;
        })->sortByDesc('match_score');
        
        return response()->json([
            'message' => 'Profile-based job recommendations',
            'data' => $jobsWithScores
        ]);
    }

    /**
     * Get job recommendations based on user's job viewing history
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getHistoryBasedRecommendations(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);
        $category = $request->get('category');
        $jobType = $request->get('job_type');
        
        // Get categories and job types from user's viewed jobs
        $viewedJobIds = JobView::where('user_id', $user->id)
            ->pluck('job_id')
            ->toArray();
        
        if (empty($viewedJobIds)) {
            // If user hasn't viewed any jobs, return general recommendations
            $jobs = Job::where('is_active', true)
                ->where('application_deadline', '>', now())
                ->inRandomOrder()
                ->limit($limit)
                ->get();
        } else {
            // Get categories and job types from viewed jobs
            $viewedJobs = Job::whereIn('id', $viewedJobIds)->get();
            $categories = $viewedJobs->pluck('category')->unique()->toArray();
            $jobTypes = $viewedJobs->pluck('job_type')->unique()->toArray();

            // Find similar jobs based on viewed job characteristics
            $query = Job::where('is_active', true)
                ->where('application_deadline', '>', now())
                ->whereNotIn('id', $viewedJobIds) // Exclude already viewed jobs
                ->whereIn('category', $categories)
                ->whereIn('job_type', $jobTypes);

            // Apply additional filters
            if ($category) {
                $query->where('category', $category);
            }

            if ($jobType) {
                $query->where('job_type', $jobType);
            }

            $jobs = $query->limit($limit)->get();
        }
        
        // Calculate similarity scores
        $jobsWithScores = $jobs->map(function ($job) use ($user) {
            $score = $this->calculateHistorySimilarityScore($job, $user);
            $job->similarity_score = $score;
            return $job;
        })->sortByDesc('similarity_score');
        
        return response()->json([
            'message' => 'History-based job recommendations',
            'data' => $jobsWithScores
        ]);
    }

    /**
     * Get trending/popular jobs based on views and applications
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getTrendingJobs(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $category = $request->get('category');
        $jobType = $request->get('job_type');
        
        // Calculate popularity score based on recent views and applications
        $recentViewsSubquery = JobView::select('job_id')
            ->selectRaw('COUNT(*) as view_count')
            ->where('created_at', '>', now()->subDays(30))
            ->groupBy('job_id');

        $recentAppsSubquery = Application::select('job_id')
            ->selectRaw('COUNT(*) as app_count')
            ->where('created_at', '>', now()->subDays(30))
            ->groupBy('job_id');

        $jobs = Job::select('job_listings.*')
            ->leftJoinSub($recentViewsSubquery, 'recent_views', function ($join) {
                $join->on('job_listings.id', '=', 'recent_views.job_id');
            })
            ->leftJoinSub($recentAppsSubquery, 'recent_apps', function ($join) {
                $join->on('job_listings.id', '=', 'recent_apps.job_id');
            })
            ->where('job_listings.is_active', true)
            ->where('job_listings.application_deadline', '>', now())
            ->where('job_listings.created_at', '>', now()->subDays(90)) // Only jobs posted in last 90 days
            ->selectRaw('job_listings.*,
                         COALESCE(recent_views.view_count, 0) as recent_views,
                         COALESCE(recent_apps.app_count, 0) as recent_applications,
                         (COALESCE(recent_views.view_count, 0) * 0.7 + COALESCE(recent_apps.app_count, 0) * 0.3) as popularity_score')
            ->orderByDesc('popularity_score')
            ->limit($limit);
        
        // Apply filters
        if ($category) {
            $jobs->where('category', $category);
        }
        
        if ($jobType) {
            $jobs->where('job_type', $jobType);
        }
        
        $result = $jobs->get();
        
        return response()->json([
            'message' => 'Trending jobs',
            'data' => $result
        ]);
    }

    /**
     * Get skill-based job recommendations
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSkillBasedRecommendations(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);
        $category = $request->get('category');
        $jobType = $request->get('job_type');
        
        // Get jobs that match user's skills
        $jobs = $this->getSkillBasedJobs($user, $limit, $category, $jobType);
        
        // Calculate skill match scores
        $jobsWithScores = $jobs->map(function ($job) use ($user) {
            $score = $this->calculateSkillMatchScore($job, $user);
            $job->skill_match_score = $score;
            return $job;
        })->sortByDesc('skill_match_score');
        
        return response()->json([
            'message' => 'Skill-based job recommendations',
            'data' => $jobsWithScores
        ]);
    }

    /**
     * Get company preference-based job recommendations
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getCompanyPreferenceRecommendations(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);
        $category = $request->get('category');
        $jobType = $request->get('job_type');
        
        // Get jobs from companies the user has interacted with
        $jobs = $this->getCompanyPreferenceJobs($user, $limit, $category, $jobType);
        
        // Calculate company preference scores
        $jobsWithScores = $jobs->map(function ($job) use ($user) {
            $score = $this->calculateCompanyPreferenceScore($job, $user);
            $job->company_preference_score = $score;
            return $job;
        })->sortByDesc('company_preference_score');
        
        return response()->json([
            'message' => 'Company preference-based job recommendations',
            'data' => $jobsWithScores
        ]);
    }

    /**
     * Get random jobs for exploration
     */
    private function getRandomJobs($user, $limit)
    {
        return Job::where('is_active', true)
            ->inRandomOrder()
            ->limit(max(1, intval($limit)))
            ->get();
    }

    /**
     * Calculate relevance score for a job recommendation
     */
    private function calculateRelevanceScore($job, $user)
    {
        // Profile match score (30%)
        $profileScore = $this->calculateProfileMatchScore($job, $user) * 0.3;
        
        // History similarity score (40%)
        $historyScore = $this->calculateHistorySimilarityScore($job, $user) * 0.4;
        
        // Popularity score (20%)
        $popularityScore = $this->calculatePopularityScore($job) * 0.2;
        
        // Random factor (10%)
        $randomScore = rand(0, 100) / 100 * 0.1;
        
        return $profileScore + $historyScore + $popularityScore + $randomScore;
    }

    /**
     * Calculate profile match score
     */
    private function calculateProfileMatchScore($job, $user)
    {
        $score = 0;
        
        // Check if $job is an array or object and access properties accordingly
        $jobDescription = is_array($job) ? $job['description'] : $job->description;
        $jobCategory = is_array($job) ? $job['category'] : $job->category;
        $jobExperienceLevel = is_array($job) ? $job['experience_level'] : $job->experience_level;
        $jobLocation = is_array($job) ? $job['location'] : $job->location;
        
        // Field of study matching (40%)
        if ($user->fieldOfStudy && stripos($jobDescription, $user->fieldOfStudy) !== false) {
            $score += 40;
        }
        
        // Experience level matching (30%)
        if ($user->experience && stripos($user->experience, $jobExperienceLevel) !== false) {
            $score += 30;
        }
        
        // Category matching (20%)
        if ($user->fieldOfStudy && stripos($jobCategory, $user->fieldOfStudy) !== false) {
            $score += 20;
        }
        
        // Location matching (10%)
        if ($user->companyLocation && stripos($jobLocation, $user->companyLocation) !== false) {
            $score += 10;
        }
        
        return min(100, $score);
    }

    /**
     * Calculate history similarity score
     */
    private function calculateHistorySimilarityScore($job, $user)
    {
        $score = 0;
        
        // Get user's viewed jobs
        $viewedJobIds = JobView::where('user_id', $user->id)
            ->pluck('job_id')
            ->toArray();
        
        if (!empty($viewedJobIds)) {
            $viewedJobs = Job::whereIn('id', $viewedJobIds)->get();
            
            // Category similarity (40%)
            $categories = $viewedJobs->pluck('category')->unique();
            if ($categories->contains($job->category)) {
                $score += 40;
            }
            
            // Job type similarity (30%)
            $jobTypes = $viewedJobs->pluck('job_type')->unique();
            if ($jobTypes->contains($job->job_type)) {
                $score += 30;
            }
            
            // Experience level similarity (20%)
            $experienceLevels = $viewedJobs->pluck('experience_level')->unique();
            if ($experienceLevels->contains($job->experience_level)) {
                $score += 20;
            }
            
            // Location similarity (10%)
            $locations = $viewedJobs->pluck('location')->unique();
            if ($locations->contains($job->location)) {
                $score += 10;
            }
        }
        
        return min(100, $score);
    }

    /**
     * Calculate popularity score
     */
    private function calculatePopularityScore($job)
    {
        // Get recent views and applications
        $recentViews = JobView::where('job_id', $job->id)
            ->where('created_at', '>', now()->subDays(30))
            ->count();
        
        $recentApplications = Application::where('job_id', $job->id)
            ->where('created_at', '>', now()->subDays(30))
            ->count();
        
        // Calculate weighted score (views 70%, applications 30%)
        $score = ($recentViews * 0.7) + ($recentApplications * 0.3);
        
        // Normalize to 0-100 scale
        return min(100, $score * 2); // Multiply by 2 to scale to 100
    }

    /**
     * Get profile-based jobs
     */
    private function getProfileBasedJobs($user, $limit)
    {
        // Get jobs that match user's profile
        $query = Job::where('is_active', true)
            ->where('application_deadline', '>', now());

        // Filter by user's field of study
        if ($user->fieldOfStudy) {
            $query->where(function ($q) use ($user) {
                $q->where('category', 'like', "%{$user->fieldOfStudy}%")
                  ->orWhere('description', 'like', "%{$user->fieldOfStudy}%");
            });
        }

        // Filter by user's experience level
        if ($user->experience) {
            // Extract experience level from user's experience description
            $experienceKeywords = ['entry', 'intermediate', 'senior', 'expert', 'director'];
            foreach ($experienceKeywords as $keyword) {
                if (stripos($user->experience, $keyword) !== false) {
                    $query->where('experience_level', $keyword);
                    break;
                }
            }
        }

        return $query->limit(max(1, intval($limit)))->get();
    }

    /**
     * Get history-based jobs
     */
    private function getHistoryBasedJobs($user, $limit)
    {
        // Get categories and job types from user's viewed jobs
        $viewedJobIds = JobView::where('user_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        if (empty($viewedJobIds)) {
            // If user hasn't viewed any jobs, return general recommendations
            return Job::where('is_active', true)
                ->where('application_deadline', '>', now())
                ->inRandomOrder()
                ->limit(max(1, intval($limit)))
                ->get();
        } else {
            // Get categories and job types from viewed jobs
            $viewedJobs = Job::whereIn('id', $viewedJobIds)->get();
            $categories = $viewedJobs->pluck('category')->unique()->toArray();
            $jobTypes = $viewedJobs->pluck('job_type')->unique()->toArray();

            // Find similar jobs based on viewed job characteristics
            return Job::where('is_active', true)
                ->where('application_deadline', '>', now())
                ->whereNotIn('id', $viewedJobIds) // Exclude already viewed jobs
                ->whereIn('category', $categories)
                ->whereIn('job_type', $jobTypes)
                ->limit(max(1, intval($limit)))
                ->get();
        }
    }

    /**
     * Get skill-based jobs
     */
    private function getSkillBasedJobs($user, $limit)
    {
        // For now, return random jobs as we don't have a specific skill matching system
        return Job::where('is_active', true)
            ->where('application_deadline', '>', now())
            ->inRandomOrder()
            ->limit(max(1, intval($limit)))
            ->get();
    }

    /**
     * Get popular jobs
     */
    private function getPopularJobs($user, $limit)
    {
        // Calculate popularity score based on recent views and applications
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
            ->where('job_listings.created_at', '>', now()->subDays(90)) // Only jobs posted in last 90 days
            ->selectRaw('job_listings.*,
                         COALESCE(recent_views.view_count, 0) as recent_views,
                         COALESCE(recent_apps.app_count, 0) as recent_applications,
                         (COALESCE(recent_views.view_count, 0) * 0.7 + COALESCE(recent_apps.app_count, 0) * 0.3) as popularity_score')
            ->orderByDesc('popularity_score')
            ->limit(max(1, intval($limit)))
            ->get();
    }

    /**
     * Get company preference jobs
     */
    private function getCompanyPreferenceJobs($user, $limit)
    {
        // For now, return random jobs as we don't have a specific company preference system
        return Job::where('is_active', true)
            ->where('application_deadline', '>', now())
            ->inRandomOrder()
            ->limit(max(1, intval($limit)))
            ->get();
    }
}
