<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Http\Requests\JobFilterRequest;

use App\Models\Job;
use App\Models\JobView;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use App\Services\NotificationService;

class JobController extends Controller
{
    /**
     * Display a listing of jobs.
     */
    public function index(JobFilterRequest $request): JsonResponse
    {
        \Log::info('JobController index method called', [
            'origin' => $request->header('Origin'),
            'referer' => $request->header('Referer'),
            'user_agent' => $request->header('User-Agent'),
            'search' => $request->get('search')
        ]);

        $validatedData = $request->validated();

        $query = Job::with(['company:id,name', 'employer:id,name'])
                    ->withCount('applications')
                    ->where('is_active', true)
                    ->where('status', 'approved');

        // Apply search filter
        if (!empty($validatedData['search'])) {
            $search = $validatedData['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Apply job type filter
        if (!empty($validatedData['job_type'])) {
            $query->where('job_type', $validatedData['job_type']);
        }

        // Apply experience level filter
        if (!empty($validatedData['experience_level'])) {
            $query->where('experience_level', $validatedData['experience_level']);
        }

        // Apply category filter
        if (!empty($validatedData['category'])) {
            $query->where('category', $validatedData['category']);
        }

        // Apply sorting
        $sortBy = $validatedData['sort_by'] ?? 'created_at';
        $sortDirection = $validatedData['sort_direction'] ?? 'desc';

        $query->orderBy($sortBy, $sortDirection);

        // Apply pagination
        $perPage = min(100, max(1, $validatedData['per_page'] ?? 10));
        $page = max(1, $request->get('page', 1));

        $jobs = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json(['data' => $jobs]);
    }

    /**
     * Store a newly created job in storage.
     */
    public function store(StoreJobRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();
    
            if ($request->hasFile('job_attachment')) {
                // Validate file size and type
                $file = $request->file('job_attachment');
                if ($file->getSize() > 2048 * 1024) { // 2MB limit
                    return response()->json([
                        'error' => 'File too large',
                        'message' => 'The job attachment file size exceeds the maximum allowed size of 2MB.'
                    ], 422);
                }
    
                $attachmentPath = $file->store('job_attachments', 'public');
                $validatedData['job_attachment'] = $attachmentPath;
            }
    
            $job = Job::create(array_merge($validatedData, [
                'employer_id' => auth()->id(),
                'is_active' => true,
                'status' => 'pending',
            ]));

            // Send notification to admins about new job posting
            NotificationService::notifyAdminNewJob($job);

            return response()->json(['data' => $job], 201);
        } catch (Exception $e) {
            Log::error('Error creating job', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'request_data' => $request->except('job_attachment')
            ]);
    
            return response()->json([
                'error' => 'Failed to create job',
                'message' => 'An error occurred while creating the job. Please try again later.'
            ], 500);
        }
    }

    /**
     * Display the specified job.
     */
    public function show($id): JsonResponse
    {
        try {
            // Find the job explicitly and check if it's active
            $job = Job::with(['employer:id,name,email', 'company:id,name'])
                      ->withCount('applications')
                      ->select('id', 'title', 'description', 'location', 'job_type', 'experience_level', 'salary_min', 'salary_max', 'salary_type', 'category', 'is_remote', 'is_active', 'application_deadline', 'company_id', 'employer_id', 'created_at', 'updated_at', 'status')
                      ->where('id', $id)
                      ->where('is_active', true)
                      ->where('status', 'approved')
                      ->first();

            if (!$job) {
                throw new ModelNotFoundException('The requested job is no longer available.');
            }

            if (auth()->check()) {
                // Use upsert to avoid N+1 queries - update if exists, insert if not
                JobView::upsert(
                    [
                        'user_id' => auth()->id(),
                        'job_id' => $job->id,
                        'updated_at' => now()
                    ],
                    ['user_id', 'job_id'], // unique columns
                    ['updated_at'] // columns to update
                );
            }

            return response()->json(['data' => $job]);
        } catch (ModelNotFoundException $e) {
            Log::warning('Job not found', [
                'job_id' => $job->id ?? 'unknown',
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            throw $e; // Let the Handler format the response
        } catch (Exception $e) {
            Log::error('Error fetching job details', [
                'job_id' => $job->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
    
            return response()->json([
                'error' => 'Failed to fetch job details',
                'message' => 'An error occurred while fetching job details. Please try again later.'
            ], 500);
        }
    }

    /**
     * Update the specified job in storage.
     */
    public function update(UpdateJobRequest $request, $id): JsonResponse
    {
        try {
           // Find the job explicitly instead of relying on route model binding
           $job = Job::findOrFail($id);
           
           // Debug logging
           \Log::info('Job update authorization check', [
               'job_employer_id' => $job->employer_id,
               'auth_user_id' => auth()->id(),
               'job_id' => $job->id,
               'auth_check' => $job->employer_id !== auth()->id(),
               'job_object' => $job->toArray()
           ]);
           
           if ($job->employer_id !== auth()->id()) {
           return response()->json(['message' => 'Unauthorized'], 403);
        }

    
            $validatedData = $request->validated();
    
            if ($request->hasFile('job_attachment')) {
                // Validate file size and type
                $file = $request->file('job_attachment');
                if ($file->getSize() > 2048 * 1024) { // 2MB limit
                    return response()->json([
                        'error' => 'File too large',
                        'message' => 'The job attachment file size exceeds the maximum allowed size of 2MB.'
                    ], 422);
                }
    
                // Delete old attachment if exists
                if ($job->job_attachment) {
                    Storage::disk('public')->delete($job->job_attachment);
                }
    
                $attachmentPath = $file->store('job_attachments', 'public');
                $validatedData['job_attachment'] = $attachmentPath;
            }
    
            $job->update($validatedData);
    
            return response()->json(['data' => $job]);
        } catch (Exception $e) {
            Log::error('Error updating job', [
                'job_id' => $job->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'request_data' => $request->except('job_attachment')
            ]);
    
            return response()->json([
                'error' => 'Failed to update job',
                'message' => 'An error occurred while updating the job. Please try again later.'
            ], 500);
        }
    }

    /**
     * Remove the specified job from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
           // Find the job explicitly instead of relying on route model binding
           $job = Job::findOrFail($id);
           
           // Debug logging
           \Log::info('Job delete authorization check', [
               'job_employer_id' => $job->employer_id,
               'auth_user_id' => auth()->id(),
               'job_id' => $job->id,
               'auth_check' => $job->employer_id !== auth()->id(),
               'job_object' => $job->toArray()
           ]);
           
           if ($job->employer_id !== auth()->id()) {
             return response()->json(['message' => 'Unauthorized'], 403);
              }

    
            // Delete job attachment if exists
            if ($job->job_attachment) {
                Storage::disk('public')->delete($job->job_attachment);
            }
    
            $job->delete();
    
            return response()->json(['message' => 'Job deleted successfully']);
        } catch (Exception $e) {
            Log::error('Error deleting job', [
                'job_id' => $job->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
    
            return response()->json([
                'error' => 'Failed to delete job',
                'message' => 'An error occurred while deleting the job. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get jobs posted by the authenticated employer.
     */
    public function myJobs(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 10);
            $jobs = Job::with(['company:id,name'])
                       ->withCount('applications')
                       ->select('id', 'title', 'description', 'location', 'job_type', 'experience_level', 'salary_min', 'salary_max', 'salary_type', 'category', 'is_remote', 'is_active', 'application_deadline', 'company_id', 'employer_id', 'created_at', 'updated_at', 'status')
                       ->where('employer_id', auth()->id())
                       ->paginate($perPage);
    
            return response()->json(['data' => $jobs]);
        } catch (Exception $e) {
            Log::error('Error fetching employer jobs', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
    
            return response()->json([
                'error' => 'Failed to fetch jobs',
                'message' => 'An error occurred while fetching your jobs. Please try again later.'
            ], 500);
        }
    }
}
