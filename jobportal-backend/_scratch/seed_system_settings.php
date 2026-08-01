<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Console\Command;
use App\Models\SystemSetting;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Clear existing settings
    SystemSetting::truncate();

    $settings = [
        // General Settings
        [
            'key' => 'site_name',
            'value' => 'CareerPlus',
            'type' => 'string',
            'group' => 'general',
            'description' => 'The name of the website',
            'is_public' => true
        ],
        [
            'key' => 'site_description',
            'value' => 'Find your dream job with CareerPlus',
            'type' => 'string',
            'group' => 'general',
            'description' => 'Site description for SEO',
            'is_public' => true
        ],
        [
            'key' => 'contact_email',
            'value' => 'support@careerplus.com',
            'type' => 'string',
            'group' => 'general',
            'description' => 'Primary contact email',
            'is_public' => true
        ],
        [
            'key' => 'maintenance_mode',
            'value' => 'false',
            'type' => 'boolean',
            'group' => 'general',
            'description' => 'Enable maintenance mode',
            'is_public' => false
        ],

        // Security Settings
        [
            'key' => 'email_verification_required',
            'value' => 'true',
            'type' => 'boolean',
            'group' => 'security',
            'description' => 'Require email verification for new accounts',
            'is_public' => false
        ],
        [
            'key' => 'max_login_attempts',
            'value' => '5',
            'type' => 'integer',
            'group' => 'security',
            'description' => 'Maximum login attempts before lockout',
            'is_public' => false
        ],
        [
            'key' => 'session_timeout',
            'value' => '7200',
            'type' => 'integer',
            'group' => 'security',
            'description' => 'Session timeout in seconds',
            'is_public' => false
        ],
        [
            'key' => 'password_min_length',
            'value' => '8',
            'type' => 'integer',
            'group' => 'security',
            'description' => 'Minimum password length',
            'is_public' => false
        ],

        // Email Settings
        [
            'key' => 'smtp_host',
            'value' => 'smtp.gmail.com',
            'type' => 'string',
            'group' => 'email',
            'description' => 'SMTP server host',
            'is_public' => false
        ],
        [
            'key' => 'smtp_port',
            'value' => '587',
            'type' => 'integer',
            'group' => 'email',
            'description' => 'SMTP server port',
            'is_public' => false
        ],
        [
            'key' => 'smtp_encryption',
            'value' => 'tls',
            'type' => 'string',
            'group' => 'email',
            'description' => 'SMTP encryption type',
            'is_public' => false
        ],
        [
            'key' => 'email_from_address',
            'value' => 'noreply@careerplus.com',
            'type' => 'string',
            'group' => 'email',
            'description' => 'Default from email address',
            'is_public' => false
        ],

        // Application Settings
        [
            'key' => 'max_applications_per_day',
            'value' => '10',
            'type' => 'integer',
            'group' => 'applications',
            'description' => 'Maximum job applications per user per day',
            'is_public' => false
        ],
        [
            'key' => 'application_deadline_days',
            'value' => '30',
            'type' => 'integer',
            'group' => 'applications',
            'description' => 'Days after posting when applications close',
            'is_public' => false
        ],
        [
            'key' => 'auto_archive_old_jobs',
            'value' => 'true',
            'type' => 'boolean',
            'group' => 'applications',
            'description' => 'Automatically archive jobs after deadline',
            'is_public' => false
        ],

        // Payment Settings
        [
            'key' => 'stripe_publishable_key',
            'value' => '',
            'type' => 'string',
            'group' => 'payment',
            'description' => 'Stripe publishable key',
            'is_public' => true
        ],
        [
            'key' => 'stripe_secret_key',
            'value' => '',
            'type' => 'string',
            'group' => 'payment',
            'description' => 'Stripe secret key',
            'is_public' => false
        ],
        [
            'key' => 'currency',
            'value' => 'USD',
            'type' => 'string',
            'group' => 'payment',
            'description' => 'Default currency',
            'is_public' => false
        ],
        [
            'key' => 'premium_job_price',
            'value' => '49.99',
            'type' => 'string',
            'group' => 'payment',
            'description' => 'Price for premium job posting',
            'is_public' => false
        ],

        // Fraud Detection Settings
        [
            'key' => 'fraud_detection_enabled',
            'value' => 'true',
            'type' => 'boolean',
            'group' => 'fraud',
            'description' => 'Enable automatic fraud detection',
            'is_public' => false
        ],
        [
            'key' => 'max_applications_per_ip',
            'value' => '50',
            'type' => 'integer',
            'group' => 'fraud',
            'description' => 'Maximum applications per IP address per day',
            'is_public' => false
        ],
        [
            'key' => 'suspicious_activity_threshold',
            'value' => '10',
            'type' => 'integer',
            'group' => 'fraud',
            'description' => 'Threshold for suspicious activity detection',
            'is_public' => false
        ],
    ];

    foreach ($settings as $setting) {
        SystemSetting::create($setting);
    }

    echo "System settings seeded successfully!\n";
    echo "Seeded " . count($settings) . " settings.\n";

} catch (Exception $e) {
    echo "Error seeding system settings: " . $e->getMessage() . "\n";
}