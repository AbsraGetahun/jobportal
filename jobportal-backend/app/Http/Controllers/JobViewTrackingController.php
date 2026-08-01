<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\JobView;
use App\Models\Job;

class JobViewTrackingController extends Controller
{
    /**
     * Track a job view by the authenticated user
     *
     * @param Request $request
     * @param int $jobId
     * @return JsonResponse
     */
    public function trackView(Request $request, int $jobId): JsonResponse
    {
        // Check if job exists
        $job = Job::find($jobId);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }
        
        // Create or update the job view record
        $jobView = JobView::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'job_id' => $jobId
            ],
            [
                'updated_at' => now()
            ]
        );
        
        return response()->json([
            'message' => 'Job view tracked successfully',
            'job_id' => $jobId
        ]);
    }

    /**
     * Get the most viewed jobs
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getMostViewedJobs(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        
        $mostViewedJobs = Job::select('job_listings.*')
            ->join('job_views', 'job_listings.id', '=', 'job_views.job_id')
            ->groupBy('job_listings.id')
            ->orderByRaw('COUNT(job_views.id) DESC')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'message' => 'Most viewed jobs',
            'data' => $mostViewedJobs
        ]);
    }
}