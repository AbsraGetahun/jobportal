<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecommendationController; // Add this line
use App\Http\Controllers\EnhancedRecommendationController; // Enhanced AI recommendations
use App\Http\Controllers\JobViewTrackingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\FieldOfStudyController;
use Illuminate\Http\Request;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SavedJobController;
use App\Http\Controllers\AIJobPostingController;

// Authentication routes with stricter rate limiting
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Password reset routes
    Route::post('/password/email', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/password/reset', [PasswordResetController::class, 'reset']);
    
    // Email verification routes
    Route::post('/email/resend', [EmailVerificationController::class, 'resend']);
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify');
    Route::get('/register/verify/{token}', [EmailVerificationController::class, 'verifyRegistration'])->name('register.verification.verify');
});

// Test route
Route::post('/test-login', function (Request $request) {
    return response()->json([
        'all' => $request->all(),
        'input' => $request->input(),
        'email' => $request->input('email'),
        'password' => $request->input('password'),
        'has_email' => $request->has('email'),
        'has_password' => $request->has('password'),
    ]);
});

// Public job listings with specific rate limiting
Route::middleware(['throttle:jobs'])->group(function () {
    Route::get('/jobs', [JobController::class, 'index']);
});

 
 // Search endpoints with search-specific rate limiting
Route::middleware(['throttle:search'])->group(function () {
    Route::get('/jobs/search', [JobController::class, 'index']);
});

// Field of study endpoints
Route::get('/field-of-study', [FieldOfStudyController::class, 'index']);

 // Advanced Search endpoints
 Route::middleware(['auth:sanctum', 'throttle:search'])->group(function () {
     Route::post('/jobs/advanced-search', [App\Http\Controllers\AdvancedSearchController::class, 'advancedSearch']);
     Route::get('/search/suggestions', [App\Http\Controllers\AdvancedSearchController::class, 'searchSuggestions']);
     Route::get('/search/saved', [App\Http\Controllers\AdvancedSearchController::class, 'getSavedSearches']);
     Route::post('/search/saved', [App\Http\Controllers\AdvancedSearchController::class, 'saveSearch']);
     Route::delete('/search/saved/{id}', [App\Http\Controllers\AdvancedSearchController::class, 'deleteSavedSearch']);
 });
 
 // Job detail endpoint
 Route::middleware('throttle:jobs')->group(function () {
     Route::get('/jobs/{id}', [JobController::class, 'show']);
 });

// Companies
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{id}', [CompanyController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/test-auth', function () {
        return response()->json(['message' => 'You are authenticated', 'user' => auth()->user()]);
    });

    // Profile management with profile-specific rate limiting
    Route::middleware('throttle:profile')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
        Route::delete('/profile', [ProfileController::class, 'destroy']);

        // Notification preferences
        Route::get('/profile/notification-preferences', [ProfileController::class, 'getNotificationPreferences']);
        Route::put('/profile/notification-preferences', [ProfileController::class, 'updateNotificationPreferences']);

        // Test route to check if we can reach the controller
        Route::get('/test-profile', function () {
            \Log::info('Test profile route reached');
            return response()->json(['message' => 'Test route reached']);
        });
    });

    // Job management (employers) with job-specific rate limiting
    Route::middleware('throttle:jobs')->group(function () {
        Route::post('/jobs', [JobController::class, 'store']);
        Route::put('/jobs/{id}', [JobController::class, 'update']);
        Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
        Route::get('/my-jobs', [JobController::class, 'myJobs']);
    });

    // Application management (job seekers) with application-specific rate limiting
    Route::middleware('throttle:applications')->group(function () {
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::post('/applications', [ApplicationController::class, 'store']);
        Route::get('/applications/{id}', [ApplicationController::class, 'show']);
        Route::put('/applications/{id}', [ApplicationController::class, 'update']);
        Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
    });

    // Company management
    Route::post('/companies', [CompanyController::class, 'store']);
    Route::put('/companies/{id}', [CompanyController::class, 'update']);
    Route::delete('/companies/{id}', [CompanyController::class, 'destroy']);
    Route::post('/companies/{id}/verify', [CompanyController::class, 'verify']);

    // Employer-specific routes for managing job applications
    Route::middleware('throttle:applications')->group(function () {
        Route::get('/jobs/{jobId}/applications', [ApplicationController::class, 'jobApplications']);
        Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
        
        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    });
    
    // AI Recommendation routes
    Route::get('/recommendations', [RecommendationController::class, 'getRecommendations']);
    Route::get('/recommendations/profile', [RecommendationController::class, 'getProfileBasedRecommendations']);
    Route::get('/recommendations/history', [RecommendationController::class, 'getHistoryBasedRecommendations']);
    Route::get('/recommendations/trending', [RecommendationController::class, 'getTrendingJobs']);

    // Enhanced AI Recommendation routes (Improved matching)
    Route::get('/enhanced-recommendations', [EnhancedRecommendationController::class, 'getRecommendations']);
    Route::get('/enhanced-recommendations/profile', [EnhancedRecommendationController::class, 'getProfileBasedJobs']);
    Route::get('/enhanced-recommendations/history', [EnhancedRecommendationController::class, 'getHistoryBasedJobs']);
    Route::get('/enhanced-recommendations/skills', [EnhancedRecommendationController::class, 'getSkillBasedJobs']);
    
    // Job View Tracking routes
    Route::post('/jobs/{jobId}/track-view', [JobViewTrackingController::class, 'trackView']);
    Route::get('/job-views/most-viewed', [JobViewTrackingController::class, 'getMostViewedJobs']);
    
    // Admin routes
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
    Route::get('/admin/ai-insights', [AdminController::class, 'getAIInsights']);
    Route::get('/admin/profile', [AdminController::class, 'profile']);

    // User Management
    Route::get('/admin/jobseekers', [AdminController::class, 'getJobSeekers']);
    Route::get('/admin/employers', [AdminController::class, 'getEmployers']);
    Route::put('/admin/jobseekers/{id}/verify', [AdminController::class, 'verifyJobSeeker']);
    Route::put('/admin/employers/{id}/verify', [AdminController::class, 'verifyEmployer']);
    Route::put('/admin/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::put('/admin/users/{id}/activate', [AdminController::class, 'activateUser']);

    // Job Management
    Route::get('/admin/jobs', [AdminController::class, 'getJobs']);
    Route::get('/admin/jobs/pending', [AdminController::class, 'getPendingJobs']);
    Route::get('/admin/jobs/{id}', [AdminController::class, 'getJob']);
    Route::put('/admin/jobs/{id}', [AdminController::class, 'updateJob']);
    Route::put('/admin/jobs/{id}/approve', [AdminController::class, 'approveJob']);
    Route::put('/admin/jobs/{id}/reject', [AdminController::class, 'rejectJob']);
    Route::put('/admin/jobs/{id}/feature', [AdminController::class, 'featureJob']);

    // Application Management
    Route::get('/admin/applications', [AdminController::class, 'getApplications']);
    Route::get('/admin/applications/{id}', [AdminController::class, 'getApplication']);
    Route::put('/admin/applications/{id}/status', [AdminController::class, 'updateApplicationStatus']);
    Route::delete('/admin/applications/{id}', [AdminController::class, 'deleteApplication']);

    // Reports & Analytics
    Route::get('/admin/reports', [AdminController::class, 'getReports']);
    Route::get('/admin/reports/export', [AdminController::class, 'exportReport']);
    Route::get('/admin/analytics/overview', [AdminController::class, 'getAnalyticsOverview']);
    Route::get('/admin/analytics/users', [AdminController::class, 'getUserAnalytics']);
    Route::get('/admin/analytics/jobs', [AdminController::class, 'getJobAnalytics']);
    Route::get('/admin/analytics/applications', [AdminController::class, 'getApplicationAnalytics']);

    // Fraud Detection & Security
    Route::get('/admin/fraud/alerts', [AdminController::class, 'getFraudAlerts']);
    Route::get('/admin/security/logs', [AdminController::class, 'getSecurityLogs']);
    Route::post('/admin/fraud/report/{id}/investigate', [AdminController::class, 'investigateFraudReport']);
    Route::post('/admin/fraud/report/{id}/resolve', [AdminController::class, 'resolveFraudReport']);
    Route::post('/admin/fraud/run-detection', [AdminController::class, 'runFraudDetection']);
    Route::put('/admin/fraud/thresholds', [AdminController::class, 'updateFraudThresholds']);

    // Content Management System (CMS)
    Route::get('/admin/cms/pages', [AdminController::class, 'getCmsPages']);
    Route::post('/admin/cms/pages', [AdminController::class, 'createCmsPage']);
    Route::put('/admin/cms/pages/{id}', [AdminController::class, 'updateCmsPage']);
    Route::delete('/admin/cms/pages/{id}', [AdminController::class, 'deleteCmsPage']);
    Route::get('/admin/cms/categories', [AdminController::class, 'getJobCategories']);
    Route::post('/admin/cms/categories', [AdminController::class, 'createJobCategory']);
    Route::put('/admin/cms/categories/{id}', [AdminController::class, 'updateJobCategory']);
    Route::delete('/admin/cms/categories/{id}', [AdminController::class, 'deleteJobCategory']);

    // Support & Communication
    Route::get('/admin/support/tickets', [AdminController::class, 'getSupportTickets']);
    Route::get('/admin/support/tickets/{id}', [AdminController::class, 'getSupportTicket']);
    Route::put('/admin/support/tickets/{id}/status', [AdminController::class, 'updateSupportTicketStatus']);
    Route::post('/admin/support/tickets/{id}/reply', [AdminController::class, 'replyToSupportTicket']);
    Route::post('/admin/communication/bulk-email', [AdminController::class, 'sendBulkEmail']);
    Route::post('/admin/communication/announcement', [AdminController::class, 'sendAnnouncement']);

    // System Settings
    Route::get('/admin/settings', [AdminController::class, 'getSystemSettings']);
    Route::get('/admin/settings/{id}', [AdminController::class, 'getSystemSetting']);
    Route::put('/admin/settings', [AdminController::class, 'updateSystemSettings']);
    Route::put('/admin/settings/{id}', [AdminController::class, 'updateSystemSetting']);
    Route::get('/admin/settings/audit-logs', [AdminController::class, 'getAuditLogs']);
    Route::get('/admin/settings/roles', [AdminController::class, 'getAdminRoles']);
    Route::put('/admin/settings/roles/{id}', [AdminController::class, 'updateAdminRole']);

    // Feedback Management
    Route::get('/admin/feedback', [AdminController::class, 'getFeedback']);
    Route::get('/admin/feedback/{id}', [AdminController::class, 'getFeedbackById']);
    Route::put('/admin/feedback/{id}', [AdminController::class, 'updateFeedback']);

    // User Feedback Submission
    Route::post('/feedback', [AdminController::class, 'submitFeedback']);
});

// Payment routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/checkout', [PaymentController::class, 'createCheckoutSession']);
    Route::get('/payments/history', [PaymentController::class, 'getPaymentHistory']);
    Route::get('/subscription/status', [PaymentController::class, 'getSubscriptionStatus']);
    Route::post('/subscription/cancel', [PaymentController::class, 'cancelSubscription']);
    
    // Subscription routes
    Route::get('/subscription/plans', [SubscriptionController::class, 'getPlans']);
    Route::post('/subscription/create', [SubscriptionController::class, 'createSubscription']);
    Route::get('/subscription', [SubscriptionController::class, 'getSubscription']);
    Route::post('/subscription/update', [SubscriptionController::class, 'updateSubscription']);
    
    // Webhook route (no auth middleware as it comes from Stripe)
    Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook']);

    // Saved Jobs routes with saved jobs-specific rate limiting
    Route::middleware('throttle:saved-jobs')->group(function () {
        Route::post('/saved-jobs/{jobId}', [SavedJobController::class, 'saveJob']);
        Route::delete('/saved-jobs/{jobId}', [SavedJobController::class, 'unsaveJob']);
        Route::get('/saved-jobs', [SavedJobController::class, 'getSavedJobs']);
        Route::get('/saved-jobs/{jobId}/check', [SavedJobController::class, 'isJobSaved']);
    });

    // AI Job Posting routes (Employer-only)
    Route::middleware(['throttle:jobs'])->group(function () {
        Route::get('/ai-job-suggestions', [AIJobPostingController::class, 'getJobSuggestions']);
        Route::post('/ai-create-job', [AIJobPostingController::class, 'createAIJob']);
    });
});
