<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Job;
use App\Models\Company;
use App\Models\SavedSearch;
use App\Models\SearchAnalytics;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdvancedSearchController extends Controller
{
    /**
     * Advanced job search with complex filtering capabilities
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function advancedSearch(Request $request): JsonResponse
    {
        try {
            // Validate and sanitize input
            $validatedData = $request->validate([
                'keywords' => 'nullable|string|max:255',
                'location' => 'nullable|string|max:255',
                'job_types' => 'nullable|array',
                'job_types.*' => 'string|in:full-time,part-time,contract,freelance,internship,remote',
                'experience_levels' => 'nullable|array',
                'experience_levels.*' => 'string|in:entry,intermediate,senior,expert,director',
                'categories' => 'nullable|array',
                'categories.*' => 'string|max:100',
                'salary_range' => 'nullable|array',
                'salary_range.min' => 'nullable|numeric|min:0|max:1000000',
                'salary_range.max' => 'nullable|numeric|min:0|max:1000000|gte:salary_range.min',
                'is_remote' => 'nullable|boolean',
                'company_ids' => 'nullable|array',
                'company_ids.*' => 'integer|exists:companies,id',
                'posted_date_range' => 'nullable|array',
                'posted_date_range.start' => 'nullable|date|before_or_equal:posted_date_range.end',
                'posted_date_range.end' => 'nullable|date|after_or_equal:posted_date_range.start',
                'required_skills' => 'nullable|array',
                'required_skills.*' => 'string|max:100',
                'sort_by' => 'nullable|string|in:relevance,created_at,salary,application_deadline,popularity,title',
                'sort_direction' => 'nullable|string|in:asc,desc',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);
            
            // Build the query with optimized eager loading
            $query = Job::with([
                'employer:id,name',
                'company:id,name'
            ])->where('is_active', true)
              ->where('status', 'approved');
            
            // Apply keyword search
            if (!empty($validatedData['keywords'])) {
                $keywords = $validatedData['keywords'];
                $query->where(function ($q) use ($keywords) {
                    $q->where('title', 'like', "%{$keywords}%")
                      ->orWhere('description', 'like', "%{$keywords}%")
                      ->orWhere('category', 'like', "%{$keywords}%");
                });
            }
            
            // Apply location filter
            if (!empty($validatedData['location'])) {
                $location = $validatedData['location'];
                $query->where('location', 'like', "%{$location}%");
            }
            
            // Apply job types filter
            if (!empty($validatedData['job_types'])) {
                $query->whereIn('job_type', $validatedData['job_types']);
            }
            
            // Apply experience levels filter
            if (!empty($validatedData['experience_levels'])) {
                $query->whereIn('experience_level', $validatedData['experience_levels']);
            }
            
            // Apply categories filter
            if (!empty($validatedData['categories'])) {
                $query->whereIn('category', $validatedData['categories']);
            }
            
            // Apply salary range filter
            if (!empty($validatedData['salary_range'])) {
                if (!empty($validatedData['salary_range']['min'])) {
                    $query->where('salary_max', '>=', $validatedData['salary_range']['min']);
                }
                if (!empty($validatedData['salary_range']['max'])) {
                    $query->where('salary_min', '<=', $validatedData['salary_range']['max']);
                }
            }
            
            // Apply remote filter
            if (!is_null($validatedData['is_remote'] ?? null)) {
                $query->where('is_remote', $validatedData['is_remote']);
            }
            
            // Apply company IDs filter
            if (!empty($validatedData['company_ids'])) {
                $query->whereIn('company_id', $validatedData['company_ids']);
            }
            
            // Apply posted date range filter
            if (!empty($validatedData['posted_date_range'])) {
                if (!empty($validatedData['posted_date_range']['start'])) {
                    $query->where('created_at', '>=', $validatedData['posted_date_range']['start']);
                }
                if (!empty($validatedData['posted_date_range']['end'])) {
                    $query->where('created_at', '<=', $validatedData['posted_date_range']['end']);
                }
            }
            
            // Apply required skills filter (this would need a skills field in the jobs table)
            // For now, we'll search in the description
            if (!empty($validatedData['required_skills'])) {
                foreach ($validatedData['required_skills'] as $skill) {
                    $query->where('description', 'like', "%{$skill}%");
                }
            }
            
            // Apply sorting
            $sortBy = $validatedData['sort_by'] ?? 'created_at';
            $sortDirection = $validatedData['sort_direction'] ?? 'desc';
            
            switch ($sortBy) {
                case 'relevance':
                    // For relevance, we'll sort by a combination of factors
                    $query->orderBy('created_at', 'desc'); // Default to newest first
                    break;
                case 'created_at':
                    $query->orderBy('created_at', $sortDirection);
                    break;
                case 'salary':
                    $query->orderBy('salary_max', $sortDirection);
                    break;
                case 'application_deadline':
                    $query->orderBy('application_deadline', $sortDirection);
                    break;
                case 'popularity':
                    // This would require a more complex query with joins
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'title':
                    $query->orderBy('title', $sortDirection);
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
            
            // Paginate results
            $perPage = min(100, max(1, $validatedData['per_page'] ?? 10));
            $page = max(1, $validatedData['page'] ?? 1);
            
            $jobs = $query->paginate($perPage, ['*'], 'page', $page);

            // Calculate relevance scores for each job more efficiently
            $jobs->getCollection()->transform(function ($job) use ($validatedData) {
                $job->relevance_score = $this->calculateRelevanceScore($job, $validatedData);
                return $job;
            });

            // Track the search query
            $this->trackSearchQuery($validatedData, $jobs->total());

            return response()->json([
                'message' => 'Advanced job search results',
                'data' => $jobs->items(),
                'pagination' => [
                    'current_page' => $jobs->currentPage(),
                    'last_page' => $jobs->lastPage(),
                    'per_page' => $jobs->perPage(),
                    'total' => $jobs->total(),
                ],
                'meta' => [
                    'filters_applied' => array_filter($validatedData)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in advancedSearch', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to perform advanced search',
                'message' => 'An error occurred while performing the search. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get search suggestions based on partial input
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchSuggestions(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'query' => 'required|string|max:100',
                'type' => 'nullable|string|in:jobs,companies,categories,locations',
                'limit' => 'nullable|integer|min:1|max:20'
            ]);
            
            $query = $validatedData['query'];
            $type = $validatedData['type'] ?? 'jobs';
            $limit = min(20, max(1, $validatedData['limit'] ?? 10));
            
            $suggestions = [];
            
            switch ($type) {
                case 'jobs':
                    $suggestions = Job::where('is_active', true)
                        ->where(function ($q) use ($query) {
                            $q->where('title', 'like', "%{$query}%")
                              ->orWhere('description', 'like', "%{$query}%")
                              ->orWhere('category', 'like', "%{$query}%");
                        })
                        ->select('title', 'category')
                        ->limit($limit)
                        ->get()
                        ->map(function ($job) use ($query) {
                            $title = $job->title;
                            $category = $job->category;

                            // Calculate match score inline for better performance
                            $score = 0;
                            if (strtolower($title) === strtolower($query)) {
                                $score = 100;
                            } elseif (stripos($title, $query) !== false) {
                                $score = 75;
                            } elseif (stripos($title, $query) === 0) {
                                $score = 50;
                            }

                            return [
                                'type' => 'job',
                                'title' => $title,
                                'category' => $category,
                                'match_score' => $score
                            ];
                        });
                    break;
                    
                case 'companies':
                    $suggestions = Company::where('is_verified', true)
                        ->where(function ($q) use ($query) {
                            $q->where('name', 'like', "%{$query}%")
                              ->orWhere('industry', 'like', "%{$query}%");
                        })
                        ->select('name', 'industry')
                        ->limit($limit)
                        ->get()
                        ->map(function ($company) use ($query) {
                            $name = $company->name;
                            $industry = $company->industry;

                            // Calculate match score inline for better performance
                            $score = 0;
                            $searchField = $name;
                            if (strtolower($searchField) === strtolower($query)) {
                                $score = 100;
                            } elseif (stripos($searchField, $query) !== false) {
                                $score = 75;
                            } elseif (stripos($searchField, $query) === 0) {
                                $score = 50;
                            }

                            return [
                                'type' => 'company',
                                'name' => $name,
                                'industry' => $industry,
                                'match_score' => $score
                            ];
                        });
                    break;
                    
                case 'categories':
                    $suggestions = Job::where('is_active', true)
                        ->where('category', 'like', "%{$query}%")
                        ->select('category')
                        ->distinct()
                        ->limit($limit)
                        ->get()
                        ->map(function ($job) use ($query) {
                            $category = $job->category;

                            // Calculate match score inline for better performance
                            $score = 0;
                            if (strtolower($category) === strtolower($query)) {
                                $score = 100;
                            } elseif (stripos($category, $query) !== false) {
                                $score = 75;
                            } elseif (stripos($category, $query) === 0) {
                                $score = 50;
                            }

                            return [
                                'type' => 'category',
                                'name' => $category,
                                'match_score' => $score
                            ];
                        });
                    break;
                    
                case 'locations':
                    $suggestions = Job::where('is_active', true)
                        ->where('location', 'like', "%{$query}%")
                        ->select('location')
                        ->distinct()
                        ->limit($limit)
                        ->get()
                        ->map(function ($job) use ($query) {
                            $location = $job->location;

                            // Calculate match score inline for better performance
                            $score = 0;
                            if (strtolower($location) === strtolower($query)) {
                                $score = 100;
                            } elseif (stripos($location, $query) !== false) {
                                $score = 75;
                            } elseif (stripos($location, $query) === 0) {
                                $score = 50;
                            }

                            return [
                                'type' => 'location',
                                'name' => $location,
                                'match_score' => $score
                            ];
                        });
                    break;
                    
                default:
                    // Default to jobs
                    $suggestions = Job::where('is_active', true)
                        ->where(function ($q) use ($query) {
                            $q->where('title', 'like', "%{$query}%")
                              ->orWhere('description', 'like', "%{$query}%");
                        })
                        ->select('title')
                        ->limit($limit)
                        ->get()
                        ->map(function ($job) use ($query) {
                            $title = $job->title;

                            // Calculate match score inline for better performance
                            $score = 0;
                            if (strtolower($title) === strtolower($query)) {
                                $score = 100;
                            } elseif (stripos($title, $query) !== false) {
                                $score = 75;
                            } elseif (stripos($title, $query) === 0) {
                                $score = 50;
                            }

                            return [
                                'type' => 'job',
                                'title' => $title,
                                'match_score' => $score
                            ];
                        });
            }
            
            // Sort by match score
            $suggestions = $suggestions->sortByDesc('match_score')->values();

            // Track the search query
            $this->trackSearchQuery([
                'query' => $query,
                'type' => $type,
                'limit' => $limit
            ], $suggestions->count());

            return response()->json([
                'message' => 'Search suggestions',
                'data' => $suggestions,
                'meta' => [
                    'query' => $query,
                    'type' => $type,
                    'limit' => $limit,
                    'total_suggestions' => $suggestions->count()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in searchSuggestions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch search suggestions',
                'message' => 'An error occurred while fetching search suggestions. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get user's saved searches
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSavedSearches(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $savedSearches = $user->savedSearches()->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'message' => 'Saved searches retrieved successfully',
                'data' => $savedSearches
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getSavedSearches', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to retrieve saved searches',
                'message' => 'An error occurred while retrieving saved searches. Please try again later.'
            ], 500);
        }
    }

    /**
     * Save a search query
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function saveSearch(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'criteria' => 'required|array'
            ]);
            
            $user = auth()->user();
            
            $savedSearch = SavedSearch::create([
                'user_id' => $user->id,
                'name' => $validatedData['name'],
                'criteria' => $validatedData['criteria']
            ]);
            
            return response()->json([
                'message' => 'Search saved successfully',
                'data' => $savedSearch
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error in saveSearch', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to save search',
                'message' => 'An error occurred while saving the search. Please try again later.'
            ], 500);
        }
    }

    /**
     * Delete a saved search
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteSavedSearch(int $id): JsonResponse
    {
        try {
            $user = auth()->user();
            $savedSearch = $user->savedSearches()->find($id);
            
            if (!$savedSearch) {
                return response()->json([
                    'error' => 'Saved search not found',
                    'message' => 'The requested saved search could not be found.'
                ], 404);
            }
            
            $savedSearch->delete();
            
            return response()->json([
                'message' => 'Saved search deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error in deleteSavedSearch', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to delete saved search',
                'message' => 'An error occurred while deleting the saved search. Please try again later.'
            ], 500);
        }
    }

    /**
     * Calculate relevance score for a job based on search criteria
     *
     * @param Job $job
     * @param array $criteria
     * @return float
     */
    private function calculateRelevanceScore($job, $criteria): float
    {
        $score = 0;
        
        // Title match (30% weight)
        if (!empty($criteria['keywords']) && stripos($job->title, $criteria['keywords']) !== false) {
            $score += 30;
        }
        
        // Description match (20% weight)
        if (!empty($criteria['keywords']) && stripos($job->description, $criteria['keywords']) !== false) {
            $score += 20;
        }
        
        // Category match (15% weight)
        if (!empty($criteria['keywords']) && stripos($job->category, $criteria['keywords']) !== false) {
            $score += 15;
        }
        
        // Location match (15% weight)
        if (!empty($criteria['location']) && stripos($job->location, $criteria['location']) !== false) {
            $score += 15;
        }
        
        // Job type match (10% weight)
        if (!empty($criteria['job_types']) && in_array($job->job_type, $criteria['job_types'])) {
            $score += 10;
        }
        
        // Experience level match (10% weight)
        if (!empty($criteria['experience_levels']) && in_array($job->experience_level, $criteria['experience_levels'])) {
            $score += 10;
        }
        
        return min(100, $score);
    }

    /**
     * Calculate match score for suggestions
     *
     * @param mixed $item
     * @param string $query
     * @return float
     */
    private function calculateMatchScore($item, $query): float
    {
        $score = 0;
        
        // Exact match gets highest score
        if (strtolower($item->title ?? $item->name ?? $item->category ?? $item->location ?? '') === strtolower($query)) {
            $score = 100;
        }
        // Partial match gets medium score
        elseif (stripos($item->title ?? $item->name ?? $item->category ?? $item->location ?? '', $query) !== false) {
            $score = 75;
        }
        // Starts with query gets lower score
        elseif (stripos($item->title ?? $item->name ?? $item->category ?? $item->location ?? '', $query) === 0) {
            $score = 50;
        }
        
        return $score;
    }
    
    /**
     * Track search query for analytics
     *
     * @param array $criteria
     * @param int $resultsCount
     * @return void
     */
    private function trackSearchQuery($criteria, $resultsCount): void
    {
        try {
            SearchAnalytics::create([
                'user_id' => auth()->id(),
                'query' => $criteria['keywords'] ?? null,
                'search_type' => 'job',
                'filters' => $criteria,
                'results_count' => $resultsCount,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);
        } catch (\Exception $e) {
            // Log the error but don't interrupt the search process
            Log::warning('Failed to track search query', [
                'error' => $e->getMessage(),
                'criteria' => $criteria
            ]);
        }
    }
}
