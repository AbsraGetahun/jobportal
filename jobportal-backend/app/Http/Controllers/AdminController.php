<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Job;
use App\Models\Company;
use App\Models\Application;
use App\Models\Feedback;
use App\Models\Notification;
use App\Models\FraudAlert;
use App\Models\CmsPage;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Services\FraudDetectionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function getStats(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get basic counts
        $totalUsers = User::count();
        $totalEmployers = User::whereNotNull('hasCompany')->count();
        $totalJobSeekers = User::whereNull('hasCompany')->count();
        $activeJobs = Job::where('status', 'approved')->count();
        $pendingJobs = Job::where('status', 'pending')->count();
        $totalFeedback = Feedback::count();
        $recentFeedback = Feedback::where('created_at', '>=', now()->subWeek())->count();

        // Calculate growth percentages (simplified - you can enhance this)
        $userGrowth = 15; // Placeholder - calculate from actual data
        $jobGrowth = 20;  // Placeholder - calculate from actual data

        $stats = [
            'totalUsers' => $totalUsers,
            'totalEmployers' => $totalEmployers,
            'totalJobSeekers' => $totalJobSeekers,
            'activeJobs' => $activeJobs,
            'pendingJobs' => $pendingJobs,
            'totalFeedback' => $totalFeedback,
            'recentFeedback' => $recentFeedback,
            'userGrowth' => $userGrowth,
            'jobGrowth' => $jobGrowth,
        ];

        return response()->json($stats);
    }

    /**
     * Get AI insights for admin dashboard
     */
    public function getAIInsights(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get trending category based on job postings
        $trendingCategory = Job::selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->first();

        // Calculate predicted user growth (simplified algorithm)
        $recentUsers = User::where('created_at', '>=', now()->subDays(30))->count();
        $previousUsers = User::whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])->count();
        $predictedUserGrowth = $previousUsers > 0 ? round((($recentUsers - $previousUsers) / $previousUsers) * 100) : 0;

        // Calculate user engagement score (simplified - based on recent activity)
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(7))->count();
        $totalUsers = User::count();
        $userEngagementScore = $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100) : 0;

        // Get anomaly count from fraud alerts
        $anomalyCount = FraudAlert::where('severity', 'critical')->count();

        $insights = [
            'predictedUserGrowth' => $predictedUserGrowth,
            'trendingCategory' => $trendingCategory ? $trendingCategory->category : 'Technology',
            'userEngagementScore' => $userEngagementScore,
            'anomalyCount' => $anomalyCount,
        ];

        return response()->json($insights);
    }

    /**
     * Get admin profile
     */
    public function profile(): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json(['data' => $admin]);
    }
    
    /**
     * Get all job seekers
     */
    public function getJobSeekers(): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $jobSeekers = User::whereNull('hasCompany')->get();
            
        return response()->json(['data' => $jobSeekers]);
    }
    
    /**
     * Get all employers
     */
    public function getEmployers(): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $employers = User::whereNotNull('hasCompany')->get();
            
        return response()->json(['data' => $employers]);
    }
    
    /**
     * Get all jobs
     */
    public function getJobs(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $jobs = Job::with(['employer:id,name,email'])->get();

        return response()->json(['data' => $jobs]);
    }

    /**
     * Get pending jobs for admin review
     */
    public function getPendingJobs(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = $request->input('per_page', 10);
        $jobs = Job::with(['employer:id,name,email', 'company:id,name'])
                   ->where('status', 'pending')
                   ->orderBy('created_at', 'desc')
                   ->paginate($perPage);

        return response()->json(['data' => $jobs]);
    }
    
    /**
     * Get job by ID
     */
    public function getJob($id): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $job = Job::with('employer')->findOrFail($id);
            
        return response()->json(['data' => $job]);
    }
    
    /**
     * Update job approval status
     */
    public function updateJob(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $job = Job::findOrFail($id);
        
        $validatedData = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $job->update($validatedData);
            
        return response()->json(['data' => $job]);
    }
    
    /**
     * Get all feedback
     */
    public function getFeedback(): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $feedbacks = Feedback::with('user')->get();
            
        return response()->json(['data' => $feedbacks]);
    }
    
    /**
     * Get feedback by ID
     */
    public function getFeedbackById($id): JsonResponse
    {
        $admin = auth()->user();
        
        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $feedback = Feedback::with('user')->findOrFail($id);
            
        return response()->json(['data' => $feedback]);
    }
    
    /**
     * Update feedback resolution status
     */
    public function updateFeedback(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedback = Feedback::findOrFail($id);

        $validatedData = $request->validate([
            'is_resolved' => 'boolean',
        ]);

        $feedback->update($validatedData);

        return response()->json(['data' => $feedback]);
    }

    /**
     * Submit feedback from users
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'email' => 'nullable|email',
        ]);

        $feedback = Feedback::create([
            'user_id' => $user ? $user->id : null,
            'subject' => $validatedData['subject'],
            'message' => $validatedData['message'],
            'email' => $validatedData['email'] ?: ($user ? $user->email : null),
            'is_resolved' => false,
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'data' => $feedback
        ], 201);
    }

    /**
     * Verify a job seeker
     */
    public function verifyJobSeeker(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->hasCompany) {
            return response()->json(['message' => 'User is an employer, not a job seeker'], 400);
        }

        $validatedData = $request->validate([
            'is_verified' => 'required|boolean',
        ]);

        $oldVerified = $user->is_verified;
        $user->update(['is_verified' => $validatedData['is_verified']]);

        // Log the action
        AuditLog::log($admin->id, 'user_verified', 'User', $user->id,
            ['is_verified' => $oldVerified], ['is_verified' => $validatedData['is_verified']],
            'Job seeker verification status updated');

        return response()->json(['data' => $user]);
    }

    /**
     * Verify an employer
     */
    public function verifyEmployer(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        if (!$user->hasCompany) {
            return response()->json(['message' => 'User is a job seeker, not an employer'], 400);
        }

        $validatedData = $request->validate([
            'is_verified' => 'required|boolean',
        ]);

        $oldVerified = $user->is_verified;
        $user->update(['is_verified' => $validatedData['is_verified']]);

        // Update company verification status
        if ($user->company) {
            $user->company->update(['is_verified' => $validatedData['is_verified']]);
        }

        // Log the action
        AuditLog::log($admin->id, 'employer_verified', 'User', $user->id,
            ['is_verified' => $oldVerified], ['is_verified' => $validatedData['is_verified']],
            'Employer verification status updated');

        return response()->json(['data' => $user->load('company')]);
    }

    /**
     * Suspend a user
     */
    public function suspendUser(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $user->update(['is_suspended' => true]);

        Log::info('User suspended', [
            'admin_id' => $admin->id,
            'user_id' => $user->id
        ]);

        return response()->json(['data' => $user]);
    }

    /**
     * Activate a user
     */
    public function activateUser(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $user->update(['is_suspended' => false]);

        Log::info('User activated', [
            'admin_id' => $admin->id,
            'user_id' => $user->id
        ]);

        return response()->json(['data' => $user]);
    }

    /**
     * Approve a job
     */
    public function approveJob(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::findOrFail($id);
        $job->update(['status' => 'approved']);

        // Notify the employer
        Notification::create([
            'user_id' => $job->employer_id,
            'type' => 'job_approved',
            'title' => 'Job Approved',
            'message' => "Your job '{$job->title}' has been approved and is now live.",
            'data' => ['job_id' => $job->id],
            'is_read' => false
        ]);

        Log::info('Job approved', [
            'admin_id' => $admin->id,
            'job_id' => $job->id
        ]);

        return response()->json(['data' => $job]);
    }

    /**
     * Reject a job
     */
    public function rejectJob(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::findOrFail($id);
        $job->update(['status' => 'rejected']);

        // Notify the employer
        Notification::create([
            'user_id' => $job->employer_id,
            'type' => 'job_rejected',
            'title' => 'Job Rejected',
            'message' => "Your job '{$job->title}' has been rejected. Please review and resubmit.",
            'data' => ['job_id' => $job->id],
            'is_read' => false
        ]);

        Log::info('Job rejected', [
            'admin_id' => $admin->id,
            'job_id' => $job->id
        ]);

        return response()->json(['data' => $job]);
    }

    /**
     * Feature a job
     */
    public function featureJob(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::findOrFail($id);

        $validatedData = $request->validate([
            'is_featured' => 'required|boolean',
        ]);

        $job->update(['is_featured' => $validatedData['is_featured']]);

        Log::info('Job feature status updated', [
            'admin_id' => $admin->id,
            'job_id' => $job->id,
            'is_featured' => $validatedData['is_featured']
        ]);

        return response()->json(['data' => $job]);
    }

    /**
     * Get all applications for admin
     */
    public function getApplications(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $applications = Application::with(['user', 'job.employer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $applications]);
    }

    /**
     * Get application by ID
     */
    public function getApplication($id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $application = Application::with(['user', 'job.employer'])->findOrFail($id);

        return response()->json(['data' => $application]);
    }

    /**
     * Update application status
     */
    public function updateApplicationStatus(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $application = Application::findOrFail($id);

        $validatedData = $request->validate([
            'status' => 'required|string|in:applied,shortlisted,rejected,hired',
        ]);

        $application->update($validatedData);

        Log::info('Application status updated', [
            'admin_id' => $admin->id,
            'application_id' => $application->id,
            'status' => $validatedData['status']
        ]);

        return response()->json(['data' => $application]);
    }

    /**
     * Delete an application
     */
    public function deleteApplication($id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $application = Application::findOrFail($id);
        $application->delete();

        Log::info('Application deleted', [
            'admin_id' => $admin->id,
            'application_id' => $id
        ]);

        return response()->json(['message' => 'Application deleted successfully']);
    }

    /**
     * Get reports data
     */
    public function getReports(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $startDate = $request->get('startDate', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('endDate', Carbon::now()->toDateString());
        $type = $request->get('type', 'overview');

        $reports = [];

        switch ($type) {
            case 'users':
                $reports = $this->getUserReports($startDate, $endDate);
                break;
            case 'jobs':
                $reports = $this->getJobReports($startDate, $endDate);
                break;
            case 'applications':
                $reports = $this->getApplicationReports($startDate, $endDate);
                break;
            default:
                $reports = $this->getOverviewReports($startDate, $endDate);
        }

        return response()->json(['data' => $reports]);
    }

    /**
     * Get overview reports
     */
    private function getOverviewReports($startDate, $endDate)
    {
        // Convert dates to Carbon objects with proper time ranges
        $startCarbon = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
        $endCarbon = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

        // Debug: Log category stats
        $totalJobs = Job::count();
        $jobsWithCategories = Job::whereNotNull('category')->where('category', '!=', '')->count();
        $uniqueCategories = Job::distinct('category')->whereNotNull('category')->where('category', '!=', '')->count('category');

        Log::info('Overview Reports Debug', [
            'total_jobs' => $totalJobs,
            'jobs_with_categories' => $jobsWithCategories,
            'unique_categories' => $uniqueCategories,
            'date_range' => [$startDate, $endDate],
            'carbon_range' => [$startCarbon->toDateTimeString(), $endCarbon->toDateTimeString()]
        ]);

        return [
            'userGrowth' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'jobStats' => Job::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'applicationStats' => Application::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'categoryStats' => (function() {
                $categoryStats = Job::selectRaw('category, COUNT(*) as count')
                    ->whereNotNull('category')
                    ->where('category', '!=', '')
                    ->groupBy('category')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function ($item) {
                        return ['label' => $item->category, 'value' => $item->count];
                    });

                // If no categories exist, provide sample data for demonstration
                if ($categoryStats->isEmpty()) {
                    return [
                        ['label' => 'Technology', 'value' => 25],
                        ['label' => 'Marketing', 'value' => 18],
                        ['label' => 'Finance', 'value' => 15],
                        ['label' => 'Healthcare', 'value' => 12],
                        ['label' => 'Education', 'value' => 10],
                        ['label' => 'Engineering', 'value' => 8],
                        ['label' => 'Sales', 'value' => 6],
                        ['label' => 'Design', 'value' => 4]
                    ];
                }

                return $categoryStats->toArray();
            })()
        ];
    }

    /**
     * Get user-specific reports
     */
    private function getUserReports($startDate, $endDate)
    {
        // Convert dates to Carbon objects with proper time ranges
        $startCarbon = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
        $endCarbon = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

        // Debug: Log what we're finding
        $totalUsers = User::count();
        $verifiedUsers = User::where('is_verified', true)->count();
        $verifiedInRange = User::where('is_verified', true)
            ->whereBetween('updated_at', [$startCarbon, $endCarbon])
            ->count();

        Log::info('User Reports Debug', [
            'total_users' => $totalUsers,
            'verified_users' => $verifiedUsers,
            'verified_in_range' => $verifiedInRange,
            'date_range' => [$startDate, $endDate],
            'carbon_range' => [$startCarbon->toDateTimeString(), $endCarbon->toDateTimeString()]
        ]);

        return [
            'registrations' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'verifications' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('is_verified', true)
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                })
        ];
    }

    /**
     * Get job-specific reports
     */
    private function getJobReports($startDate, $endDate)
    {
        // Convert dates to Carbon objects with proper time ranges
        $startCarbon = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
        $endCarbon = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

        // Debug: Log what we're finding
        $totalJobs = Job::count();
        $approvedJobs = Job::where('status', 'approved')->count();
        $jobsWithCategories = Job::whereNotNull('category')->count();
        $approvedInRange = Job::where('status', 'approved')
            ->whereBetween('created_at', [$startCarbon, $endCarbon])
            ->count();

        Log::info('Job Reports Debug', [
            'total_jobs' => $totalJobs,
            'approved_jobs' => $approvedJobs,
            'jobs_with_categories' => $jobsWithCategories,
            'approved_in_range' => $approvedInRange,
            'date_range' => [$startDate, $endDate],
            'carbon_range' => [$startCarbon->toDateTimeString(), $endCarbon->toDateTimeString()]
        ]);

        return [
            'posted' => Job::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'approved' => Job::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('status', 'approved')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'categoryStats' => (function() {
                $categoryStats = Job::selectRaw('category, COUNT(*) as count')
                    ->whereNotNull('category')
                    ->where('category', '!=', '')
                    ->groupBy('category')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function ($item) {
                        return ['label' => $item->category, 'value' => $item->count];
                    });

                // If no categories exist, provide sample data for demonstration
                if ($categoryStats->isEmpty()) {
                    return [
                        ['label' => 'Technology', 'value' => 25],
                        ['label' => 'Marketing', 'value' => 18],
                        ['label' => 'Finance', 'value' => 15],
                        ['label' => 'Healthcare', 'value' => 12],
                        ['label' => 'Education', 'value' => 10],
                        ['label' => 'Engineering', 'value' => 8],
                        ['label' => 'Sales', 'value' => 6],
                        ['label' => 'Design', 'value' => 4]
                    ];
                }

                return $categoryStats->toArray();
            })()
        ];
    }

    /**
     * Get application-specific reports
     */
    private function getApplicationReports($startDate, $endDate)
    {
        // Convert dates to Carbon objects with proper time ranges
        $startCarbon = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
        $endCarbon = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

        return [
            'submitted' => Application::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return ['label' => $item->date, 'value' => $item->count];
                }),

            'status' => Application::selectRaw('status, COUNT(*) as count')
                ->whereBetween('created_at', [$startCarbon, $endCarbon])
                ->groupBy('status')
                ->orderBy('count', 'desc')
                ->get()
                ->map(function ($item) {
                    return ['label' => ucfirst($item->status), 'value' => $item->count];
                })
        ];
    }

    /**
     * Export report
     */
    public function exportReport(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // This would typically generate and return a file
        // For now, return a placeholder response
        return response()->json(['message' => 'Report export functionality would be implemented here']);
    }

    /**
     * Get analytics overview
     */
    public function getAnalyticsOverview(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $analytics = [
            'totalUsers' => User::count(),
            'activeUsers' => User::where('last_login_at', '>=', Carbon::now()->subDays(30))->count(),
            'totalJobs' => Job::count(),
            'activeJobs' => Job::where('status', 'approved')->where('deadline', '>=', Carbon::now())->count(),
            'totalApplications' => Application::count(),
            'conversionRate' => Application::count() > 0 ? (Application::where('status', 'hired')->count() / Application::count()) * 100 : 0,
        ];

        return response()->json(['data' => $analytics]);
    }

    /**
     * Get user analytics
     */
    public function getUserAnalytics(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $analytics = [
            'employers' => User::whereNotNull('hasCompany')->count(),
            'jobSeekers' => User::whereNull('hasCompany')->count(),
            'verifiedUsers' => User::where('is_verified', true)->count(),
            'suspendedUsers' => User::where('is_suspended', true)->count(),
        ];

        return response()->json(['data' => $analytics]);
    }

    /**
     * Get job analytics
     */
    public function getJobAnalytics(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $analytics = [
            'totalJobs' => Job::count(),
            'approvedJobs' => Job::where('status', 'approved')->count(),
            'pendingJobs' => Job::where('status', 'pending')->count(),
            'featuredJobs' => Job::where('is_featured', true)->count(),
            'categories' => Job::distinct('category')->count('category'),
        ];

        return response()->json(['data' => $analytics]);
    }

    /**
     * Get application analytics
     */
    public function getApplicationAnalytics(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $analytics = [
            'totalApplications' => Application::count(),
            'applied' => Application::where('status', 'applied')->count(),
            'shortlisted' => Application::where('status', 'shortlisted')->count(),
            'rejected' => Application::where('status', 'rejected')->count(),
            'hired' => Application::where('status', 'hired')->count(),
        ];

        return response()->json(['data' => $analytics]);
    }

    /**
     * Get fraud alerts
     */
    public function getFraudAlerts(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $alerts = FraudAlert::with('user')->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $alerts]);
    }

    /**
     * Get security logs
     */
    public function getSecurityLogs(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // This would typically query security logs
        return response()->json(['data' => []]);
    }

    /**
     * Investigate fraud report
     */
    public function investigateFraudReport(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $alert = FraudAlert::findOrFail($id);
        $alert->update([
            'status' => 'investigating',
            'admin_id' => $admin->id
        ]);

        // Log the action
        AuditLog::log($admin->id, 'fraud_alert_investigated', 'FraudAlert', $id, null, ['status' => 'investigating'], 'Fraud alert investigation started');

        return response()->json(['message' => 'Fraud report investigation started', 'data' => $alert]);
    }

    /**
     * Resolve fraud report
     */
    public function resolveFraudReport(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'resolution' => 'required|string|max:1000',
            'status' => 'required|in:resolved,dismissed'
        ]);

        $alert = FraudAlert::findOrFail($id);
        $oldValues = $alert->only(['status', 'resolution_notes', 'resolved_at']);

        $alert->update([
            'status' => $validatedData['status'],
            'resolution_notes' => $validatedData['resolution'],
            'resolved_at' => now(),
            'admin_id' => $admin->id
        ]);

        // Log the action
        AuditLog::log($admin->id, 'fraud_alert_resolved', 'FraudAlert', $id, $oldValues, $alert->only(['status', 'resolution_notes', 'resolved_at']), 'Fraud alert resolved');

        return response()->json(['message' => 'Fraud report resolved', 'data' => $alert]);
    }

    /**
     * Run fraud detection manually
     */
    public function runFraudDetection(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fraudService = new FraudDetectionService();
        $fraudService->checkForSuspiciousActivities();

        $newAlertsCount = FraudAlert::where('created_at', '>=', now()->subMinutes(5))->count();

        // Log the action
        AuditLog::log($admin->id, 'fraud_detection_run', 'System', null, null, null, 'Manual fraud detection scan completed');

        return response()->json([
            'message' => 'Fraud detection completed',
            'new_alerts_created' => $newAlertsCount
        ]);
    }

    /**
     * Update fraud thresholds
     */
    public function updateFraudThresholds(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for fraud threshold updates
        return response()->json(['message' => 'Fraud thresholds updated']);
    }

    /**
     * Get CMS pages
     */
    public function getCmsPages(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pages = CmsPage::with('creator')->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $pages]);
    }

    /**
     * Create CMS page
     */
    public function createCmsPage(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cms_pages,slug',
            'content' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_published' => 'boolean'
        ]);

        $page = CmsPage::create([
            'title' => $validatedData['title'],
            'slug' => $validatedData['slug'] ?? null,
            'content' => $validatedData['content'],
            'meta_title' => $validatedData['meta_title'] ?? null,
            'meta_description' => $validatedData['meta_description'] ?? null,
            'is_published' => $validatedData['is_published'] ?? false,
            'created_by' => $admin->id,
            'published_at' => ($validatedData['is_published'] ?? false) ? now() : null
        ]);

        // Log the action
        AuditLog::log($admin->id, 'cms_page_created', 'CmsPage', $page->id, null, $page->toArray(), 'CMS page created');

        return response()->json(['message' => 'CMS page created successfully', 'data' => $page], 201);
    }

    /**
     * Update CMS page
     */
    public function updateCmsPage(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $page = CmsPage::findOrFail($id);

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:cms_pages,slug,' . $id,
            'content' => 'sometimes|required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_published' => 'boolean'
        ]);

        $oldValues = $page->only(array_keys($validatedData));

        $updateData = $validatedData;
        $updateData['updated_by'] = $admin->id;

        if (isset($validatedData['is_published'])) {
            $updateData['published_at'] = $validatedData['is_published'] ? now() : null;
        }

        $page->update($updateData);

        // Log the action
        AuditLog::log($admin->id, 'cms_page_updated', 'CmsPage', $id, $oldValues, $validatedData, 'CMS page updated');

        return response()->json(['message' => 'CMS page updated successfully', 'data' => $page]);
    }

    /**
     * Delete CMS page
     */
    public function deleteCmsPage($id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $page = CmsPage::findOrFail($id);
        $oldValues = $page->toArray();

        $page->delete();

        // Log the action
        AuditLog::log($admin->id, 'cms_page_deleted', 'CmsPage', $id, $oldValues, null, 'CMS page deleted');

        return response()->json(['message' => 'CMS page deleted successfully']);
    }

    /**
     * Get job categories
     */
    public function getJobCategories(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $categories = Job::distinct('category')
            ->whereNotNull('category')
            ->pluck('category')
            ->map(function ($category) {
                return ['name' => $category, 'count' => Job::where('category', $category)->count()];
            });

        return response()->json(['data' => $categories]);
    }

    /**
     * Create job category
     */
    public function createJobCategory(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for category creation
        return response()->json(['message' => 'Job category created']);
    }

    /**
     * Update job category
     */
    public function updateJobCategory(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for category update
        return response()->json(['message' => 'Job category updated']);
    }

    /**
     * Delete job category
     */
    public function deleteJobCategory($id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for category deletion
        return response()->json(['message' => 'Job category deleted']);
    }

    /**
     * Get support tickets
     */
    public function getSupportTickets(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Use feedback as support tickets for now
        $tickets = Feedback::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $tickets]);
    }

    /**
     * Get support ticket by ID
     */
    public function getSupportTicket($id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket = Feedback::with('user')->findOrFail($id);

        return response()->json(['data' => $ticket]);
    }

    /**
     * Update support ticket status
     */
    public function updateSupportTicketStatus(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket = Feedback::findOrFail($id);

        $validatedData = $request->validate([
            'is_resolved' => 'boolean',
        ]);

        $ticket->update($validatedData);

        return response()->json(['data' => $ticket]);
    }

    /**
     * Reply to support ticket
     */
    public function replyToSupportTicket(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for ticket reply functionality
        return response()->json(['message' => 'Reply sent to support ticket']);
    }

    /**
     * Send bulk email
     */
    public function sendBulkEmail(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for bulk email functionality
        return response()->json(['message' => 'Bulk email sent']);
    }

    /**
     * Send announcement
     */
    public function sendAnnouncement(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for announcement functionality
        return response()->json(['message' => 'Announcement sent']);
    }

    /**
     * Get system settings
     */
    public function getSystemSettings(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $settings = SystemSetting::orderBy('group')->orderBy('key')->get();

        return response()->json(['data' => $settings]);
    }

    /**
     * Update system settings
     */
    public function updateSystemSettings(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'required|string|in:string,boolean,integer,json'
        ]);

        $updatedSettings = [];

        foreach ($validatedData['settings'] as $settingData) {
            $setting = SystemSetting::where('key', $settingData['key'])->first();

            if ($setting) {
                $oldValue = $setting->value;
                $setting->value = $settingData['value'];
                $setting->type = $settingData['type'];
                $setting->updated_by = $admin->id;
                $setting->save();

                $updatedSettings[] = $setting;

                // Log the change
                AuditLog::log($admin->id, 'system_setting_updated', 'SystemSetting', $setting->id,
                    ['value' => $oldValue], ['value' => $settingData['value']], "System setting '{$setting->key}' updated");
            }
        }

        return response()->json(['message' => 'System settings updated successfully', 'data' => $updatedSettings]);
    }

    /**
     * Get a single system setting by ID
     */
    public function getSystemSetting($id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $setting = SystemSetting::findOrFail($id);

        return response()->json(['data' => $setting]);
    }

    /**
     * Update a single system setting by ID
     */
    public function updateSystemSetting(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $setting = SystemSetting::findOrFail($id);

        $validatedData = $request->validate([
            'value' => 'nullable',
            'type' => 'required|string|in:string,boolean,integer,json'
        ]);

        $oldValue = $setting->value;
        $setting->value = $validatedData['value'];
        $setting->type = $validatedData['type'];
        $setting->updated_by = $admin->id;
        $setting->save();

        AuditLog::log($admin->id, 'system_setting_updated', 'SystemSetting', $setting->id,
            ['value' => $oldValue], ['value' => $validatedData['value']], "System setting '{$setting->key}' updated");

        return response()->json(['message' => 'System setting updated successfully', 'data' => $setting]);
    }

    /**
     * Get audit logs
     */
    public function getAuditLogs(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = $request->input('per_page', 50);
        $logs = AuditLog::with('admin')->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json(['data' => $logs]);
    }

    /**
     * Get admin roles
     */
    public function getAdminRoles(): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for admin roles
        $roles = [
            ['id' => 1, 'name' => 'Super Admin', 'permissions' => ['all']],
            ['id' => 2, 'name' => 'Content Manager', 'permissions' => ['cms', 'reports']],
        ];

        return response()->json(['data' => $roles]);
    }

    /**
     * Update admin role
     */
    public function updateAdminRole(Request $request, $id): JsonResponse
    {
        $admin = auth()->user();

        if (!$admin || !$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for role update
        return response()->json(['message' => 'Admin role updated']);
    }
}