<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\Application;
use App\Models\Job;

class NotificationService
{
    /**
     * Send notification to all admin users
     *
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array $data
     * @param int|null $applicationId
     * @return void
     */
    public static function sendToAdmins(string $type, string $title, string $message, array $data = [], int $applicationId = null): void
    {
        $admins = User::where('is_admin', true)->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'application_id' => $applicationId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'is_read' => false,
            ]);
        }
    }

    /**
     * Send notification for new user registration
     *
     * @param User $user
     * @return void
     */
    public static function notifyAdminNewUser(User $user): void
    {
        $userType = $user->isEmployer() ? 'Employer' : 'Job Seeker';

        self::sendToAdmins(
            'new_user_registration',
            'New User Registration',
            "A new {$userType} has registered: {$user->name} ({$user->email})",
            [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_type' => $userType,
                'registration_date' => $user->created_at->toISOString(),
            ]
        );
    }

    /**
     * Send notification for new job application
     *
     * @param Application $application
     * @return void
     */
    public static function notifyAdminNewApplication(Application $application): void
    {
        $jobSeeker = $application->user;
        $job = $application->job;

        self::sendToAdmins(
            'new_job_application',
            'New Job Application',
            "{$jobSeeker->name} applied for the position: {$job->title}",
            [
                'application_id' => $application->id,
                'job_seeker_id' => $jobSeeker->id,
                'job_seeker_name' => $jobSeeker->name,
                'job_seeker_email' => $jobSeeker->email,
                'job_id' => $job->id,
                'job_title' => $job->title,
                'company_name' => $job->company->name ?? 'N/A',
                'application_date' => $application->created_at->toISOString(),
            ],
            $application->id
        );
    }

    /**
     * Send notification for new job posting
     *
     * @param Job $job
     * @return void
     */
    public static function notifyAdminNewJob(Job $job): void
    {
        $employer = $job->employer;

        self::sendToAdmins(
            'new_job_posting',
            'New Job Posted',
            "{$employer->name} posted a new job: {$job->title}",
            [
                'job_id' => $job->id,
                'job_title' => $job->title,
                'employer_id' => $employer->id,
                'employer_name' => $employer->name,
                'employer_email' => $employer->email,
                'company_name' => $job->company->name ?? 'N/A',
                'job_location' => $job->location,
                'salary_range' => $job->salary_range,
                'posting_date' => $job->created_at->toISOString(),
            ]
        );
    }
}