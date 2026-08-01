<?php

namespace App\Services;

use App\Models\User;
use App\Models\Application;
use App\Models\FraudAlert;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FraudDetectionService
{
    /**
     * Check for suspicious activities and create alerts
     */
    public function checkForSuspiciousActivities()
    {
        $this->checkMultipleApplicationsFromSameIP();
        $this->checkRapidApplicationSubmissions();
        $this->checkDuplicateProfiles();
        $this->checkUnusualLoginPatterns();
    }

    /**
     * Check for multiple applications from the same IP
     */
    private function checkMultipleApplicationsFromSameIP()
    {
        $maxApplicationsPerIP = SystemSetting::getValue('max_applications_per_ip', 50);

        $suspiciousIPs = DB::table('applications')
            ->select('ip_address', DB::raw('COUNT(*) as application_count'))
            ->whereNotNull('ip_address')
            ->where('created_at', '>=', now()->subDay())
            ->groupBy('ip_address')
            ->having('application_count', '>', $maxApplicationsPerIP)
            ->get();

        foreach ($suspiciousIPs as $ipData) {
            $this->createFraudAlert([
                'type' => 'multiple_applications_same_ip',
                'severity' => 'medium',
                'description' => "Multiple applications ({$ipData->application_count}) from IP {$ipData->ip_address} in 24 hours",
                'data' => [
                    'ip_address' => $ipData->ip_address,
                    'application_count' => $ipData->application_count,
                    'timeframe' => '24 hours'
                ]
            ]);
        }
    }

    /**
     * Check for rapid application submissions
     */
    private function checkRapidApplicationSubmissions()
    {
        $threshold = SystemSetting::getValue('suspicious_activity_threshold', 10);

        $rapidSubmitters = DB::table('applications')
            ->select('user_id', DB::raw('COUNT(*) as application_count'))
            ->where('created_at', '>=', now()->subHour())
            ->groupBy('user_id')
            ->having('application_count', '>', $threshold)
            ->get();

        foreach ($rapidSubmitters as $userData) {
            $user = User::find($userData->user_id);
            if ($user) {
                $this->createFraudAlert([
                    'type' => 'rapid_application_submissions',
                    'severity' => 'high',
                    'description' => "User {$user->name} submitted {$userData->application_count} applications in 1 hour",
                    'user_id' => $user->id,
                    'data' => [
                        'application_count' => $userData->application_count,
                        'timeframe' => '1 hour'
                    ]
                ]);
            }
        }
    }

    /**
     * Check for duplicate profiles
     */
    private function checkDuplicateProfiles()
    {
        // Check for users with same email pattern
        $duplicateEmails = DB::table('users')
            ->select('email', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('email')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicateEmails as $emailData) {
            $this->createFraudAlert([
                'type' => 'duplicate_email_accounts',
                'severity' => 'medium',
                'description' => "Multiple accounts ({$emailData->count}) with email {$emailData->email}",
                'data' => [
                    'email' => $emailData->email,
                    'account_count' => $emailData->count
                ]
            ]);
        }

        // Check for users with same phone number
        $duplicatePhones = DB::table('users')
            ->select('phone', DB::raw('COUNT(*) as count'))
            ->whereNotNull('phone')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('phone')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicatePhones as $phoneData) {
            $this->createFraudAlert([
                'type' => 'duplicate_phone_accounts',
                'severity' => 'medium',
                'description' => "Multiple accounts ({$phoneData->count}) with phone {$phoneData->phone}",
                'data' => [
                    'phone' => $phoneData->phone,
                    'account_count' => $phoneData->count
                ]
            ]);
        }
    }

    /**
     * Check for unusual login patterns
     */
    private function checkUnusualLoginPatterns()
    {
        // Check for users logging in from multiple countries in short time
        $unusualLogins = DB::table('users')
            ->whereNotNull('last_login_at')
            ->where('last_login_at', '>=', now()->subHours(24))
            ->get();

        foreach ($unusualLogins as $user) {
            // This would require IP geolocation service
            // For now, just check for rapid consecutive logins
            $recentLogins = DB::table('audit_logs')
                ->where('model_type', 'User')
                ->where('model_id', $user->id)
                ->where('action', 'user_login')
                ->where('created_at', '>=', now()->subHours(1))
                ->count();

            if ($recentLogins > 5) {
                $this->createFraudAlert([
                    'type' => 'unusual_login_pattern',
                    'severity' => 'low',
                    'description' => "User {$user->name} has {$recentLogins} login attempts in 1 hour",
                    'user_id' => $user->id,
                    'data' => [
                        'login_attempts' => $recentLogins,
                        'timeframe' => '1 hour'
                    ]
                ]);
            }
        }
    }

    /**
     * Create a fraud alert
     */
    private function createFraudAlert(array $data)
    {
        // Check if similar alert already exists recently
        $existingAlert = FraudAlert::where('type', $data['type'])
            ->where('created_at', '>=', now()->subHours(24))
            ->when(isset($data['user_id']), function($query) use ($data) {
                return $query->where('user_id', $data['user_id']);
            })
            ->when(isset($data['data']['ip_address']), function($query) use ($data) {
                return $query->whereJsonContains('data->ip_address', $data['data']['ip_address']);
            })
            ->first();

        if (!$existingAlert) {
            FraudAlert::create($data);
        }
    }

    /**
     * Check if an action should trigger fraud detection
     */
    public function shouldCheckFraudDetection()
    {
        return SystemSetting::getValue('fraud_detection_enabled', true);
    }

    /**
     * Manual fraud check for specific user
     */
    public function checkUserForFraud($userId)
    {
        $user = User::find($userId);
        if (!$user) return;

        // Check application patterns
        $recentApplications = Application::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        $maxAppsPerDay = SystemSetting::getValue('max_applications_per_day', 10);

        if ($recentApplications > $maxAppsPerDay * 2) {
            $this->createFraudAlert([
                'type' => 'excessive_applications',
                'severity' => 'high',
                'description' => "User {$user->name} submitted {$recentApplications} applications in 24 hours",
                'user_id' => $user->id,
                'data' => [
                    'application_count' => $recentApplications,
                    'max_allowed' => $maxAppsPerDay
                ]
            ]);
        }
    }
}