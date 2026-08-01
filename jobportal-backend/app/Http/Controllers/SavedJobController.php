<?php

namespace App\Http\Controllers;

use App\Models\SavedJob;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class SavedJobController extends Controller
{
    /**
     * Save a job for the current user
     */
    public function saveJob($jobId): JsonResponse
    {
        try {
            // Check if job exists and is active
            $job = Job::where('id', $jobId)
                      ->where('is_active', true)
                      ->where('status', 'approved')
                      ->first();

            if (!$job) {
                return response()->json([
                    'error' => 'Job not found',
                    'message' => 'The job you are trying to save is no longer available.'
                ], 404);
            }

            // Check if already saved
            $existingSave = SavedJob::where('user_id', auth()->id())
                                    ->where('job_id', $jobId)
                                    ->first();

            if ($existingSave) {
                return response()->json([
                    'error' => 'Already saved',
                    'message' => 'You have already saved this job.'
                ], 409);
            }

            // Save the job
            $savedJob = SavedJob::create([
                'user_id' => auth()->id(),
                'job_id' => $jobId,
            ]);

            return response()->json([
                'message' => 'Job saved successfully',
                'data' => $savedJob
            ], 201);

        } catch (Exception $e) {
            Log::error('Error saving job', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'job_id' => $jobId
            ]);

            return response()->json([
                'error' => 'Failed to save job',
                'message' => 'An error occurred while saving the job. Please try again later.'
            ], 500);
        }
    }

    /**
     * Remove a saved job for the current user
     */
    public function unsaveJob($jobId): JsonResponse
    {
        try {
            $savedJob = SavedJob::where('user_id', auth()->id())
                                ->where('job_id', $jobId)
                                ->first();

            if (!$savedJob) {
                return response()->json([
                    'error' => 'Not saved',
                    'message' => 'This job is not in your saved jobs list.'
                ], 404);
            }

            $savedJob->delete();

            return response()->json([
                'message' => 'Job removed from saved jobs successfully'
            ]);

        } catch (Exception $e) {
            Log::error('Error unsaving job', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'job_id' => $jobId
            ]);

            return response()->json([
                'error' => 'Failed to unsave job',
                'message' => 'An error occurred while removing the job from saved jobs. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get user's saved jobs with pagination
     */
    public function getSavedJobs(Request $request): JsonResponse
    {
        try {
            $perPage = min(100, max(1, $request->input('per_page', 10)));
            $page = max(1, $request->get('page', 1));

            $savedJobs = SavedJob::with([
                'job:id,title,description,location,job_type,experience_level,salary_min,salary_max,salary_type,category,is_remote,application_deadline,employer_id,company_id,created_at',
                'job.employer:id,name,email',
                'job.company:id,name'
            ])
            ->where('user_id', auth()->id())
            ->whereHas('job', function ($query) {
                $query->where('is_active', true)
                      ->where('status', 'approved');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

            return response()->json(['data' => $savedJobs]);

        } catch (Exception $e) {
            Log::error('Error fetching saved jobs', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'error' => 'Failed to fetch saved jobs',
                'message' => 'An error occurred while fetching your saved jobs. Please try again later.'
            ], 500);
        }
    }

    /**
     * Check if a job is saved by the current user
     */
    public function isJobSaved($jobId): JsonResponse
    {
        try {
            $isSaved = SavedJob::where('user_id', auth()->id())
                               ->where('job_id', $jobId)
                               ->exists();

            return response()->json([
                'is_saved' => $isSaved
            ]);

        } catch (Exception $e) {
            Log::error('Error checking if job is saved', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'job_id' => $jobId
            ]);

            return response()->json([
                'error' => 'Failed to check saved status',
                'message' => 'An error occurred while checking if the job is saved. Please try again later.'
            ], 500);
        }
    }
}
