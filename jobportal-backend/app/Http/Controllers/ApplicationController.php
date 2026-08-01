<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Application;
use App\Models\Job;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;
use App\Services\NotificationService;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the user's applications.
     */
    public function index(Request $request): JsonResponse
    {
        $applications = Application::with('job.employer')
            ->where('user_id', auth()->id())
            ->paginate(10);
        
        return response()->json(['data' => $applications]);
    }

    /**
     * Store a newly created application in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'job_id' => 'required|exists:job_listings,id',
            'cover_letter' => 'nullable|string|min:50|max:2000',
            'additional_skills' => 'nullable|string|max:1000',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);
        
        // Check if the job exists and is active
        $job = Job::where('id', $validatedData['job_id'])
            ->where('is_active', true)
            ->first();

        if (!$job) {
            return response()->json(['message' => 'Job not found or not active'], 404);
        }

        // Check if the user has already applied for this job
        $existingApplication = Application::where('user_id', auth()->id())
            ->where('job_id', $validatedData['job_id'])
            ->first();

        if ($existingApplication) {
            return response()->json(['message' => 'You have already applied for this job'], 400);
        }

        // Handle resume upload
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
            $validatedData['resume'] = $resumePath;
        }

        $application = Application::create([
            'user_id' => auth()->id(),
            'job_id' => $validatedData['job_id'],
            'cover_letter' => $validatedData['cover_letter'] ?? null,
            'additional_skills' => $validatedData['additional_skills'] ?? null,
            'resume' => $validatedData['resume'] ?? null,
            'status' => 'pending',
        ]);

        // Send notification to admins about new job application
        NotificationService::notifyAdminNewApplication($application);

        return response()->json(['data' => $application], 201);
    }

    /**
     * Display the specified application.
     */
    public function show(string $id): JsonResponse
    {
        $application = Application::with('job.employer')->findOrFail($id);

        // Check if the authenticated user owns this application
        if ($application->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $application]);
    }

    /**
     * Update the specified application in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $application = Application::findOrFail($id);

        // Check if the authenticated user owns this application
        if ($application->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow updating the cover letter if the application is still pending
        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Cannot update application that is not pending'], 400);
        }

        $validatedData = $request->validate([
            'cover_letter' => 'string|min:50|max:2000',
            'additional_skills' => 'nullable|string|max:1000',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);

        // Handle resume upload
        if ($request->hasFile('resume')) {
            // Delete old resume if it exists
            if ($application->resume) {
                Storage::disk('public')->delete($application->resume);
            }
            
            $resumePath = $request->file('resume')->store('resumes', 'public');
            $validatedData['resume'] = $resumePath;
        }

        $application->update($validatedData);

        return response()->json(['data' => $application]);
    }

    /**
     * Remove the specified application from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $application = Application::findOrFail($id);

        // Check if the authenticated user owns this application
        if ($application->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow deleting if the application is still pending
        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Cannot delete application that is not pending'], 400);
        }

        // Delete resume if it exists
        if ($application->resume) {
            Storage::disk('public')->delete($application->resume);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted successfully']);
    }

    /**
     * Get applications for a specific job (employer only).
     */
    public function jobApplications(Request $request, string $jobId): JsonResponse
    {
        $job = Job::findOrFail($jobId);

        // Check if the authenticated user is the owner of the job
        if ($job->employer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $applications = Application::with('user')
            ->where('job_id', $jobId)
            ->paginate(10);

        return response()->json(['data' => $applications]);
    }

    /**
     * Update application status (employer only).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $application = Application::findOrFail($id);
        
        // Check if the authenticated user is the owner of the job
        $job = $application->job;
        if ($job->employer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'status' => 'required|in:pending,reviewed,accepted,rejected',
        ]);

        $application->update($validatedData);
        
        // Create a notification for the applicant
        $status = $validatedData['status'];
        $jobTitle = $application->job->title;
        $companyName = $application->job->employer->name ?? 'the company';
        
        // Determine the notification message based on the status
        if ($status === 'accepted') {
            $title = 'Application Accepted';
            $message = "Congratulations! Your application for the position of {$jobTitle} at {$companyName} has been accepted.";
        } elseif ($status === 'rejected') {
            $title = 'Application Rejected';
            $message = "We regret to inform you that your application for the position of {$jobTitle} at {$companyName} has been rejected.";
        } else {
            $title = 'Application Status Updated';
            $message = "The status of your application for the position of {$jobTitle} at {$companyName} has been updated to {$status}.";
        }
        
        // Create the notification in the database
        Notification::create([
            'user_id' => $application->user_id,
            'application_id' => $application->id,
            'type' => 'application_status_changed',
            'title' => $title,
            'message' => $message,
            'data' => [
                'application_id' => $application->id,
                'job_title' => $jobTitle,
                'company_name' => $companyName,
                'status' => $status
            ],
            'is_read' => false
        ]);
        
        return response()->json(['data' => $application]);
    }
}
