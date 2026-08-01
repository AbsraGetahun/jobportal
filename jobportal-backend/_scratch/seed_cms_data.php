<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\CmsPage;
use App\Models\User;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Get the admin user
    $admin = User::where('is_admin', true)->first();

    if (!$admin) {
        echo "No admin user found!\n";
        exit(1);
    }

    echo "Found admin user: {$admin->email}\n";

    // Clear existing CMS pages
    CmsPage::truncate();

    $cmsPages = [
        [
            'title' => 'About Us',
            'slug' => 'about-us',
            'content' => '<h1>About CareerPlus</h1><p>CareerPlus is a leading job portal connecting talented professionals with amazing career opportunities.</p><p>Our mission is to help job seekers find their dream jobs and help employers find the perfect candidates for their teams.</p>',
            'meta_title' => 'About CareerPlus - Leading Job Portal',
            'meta_description' => 'Learn about CareerPlus, the premier job portal connecting professionals with career opportunities worldwide.',
            'is_published' => true,
            'created_by' => $admin->id,
            'published_at' => now()
        ],
        [
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'content' => '<h1>Privacy Policy</h1><p>At CareerPlus, we are committed to protecting your privacy and ensuring the security of your personal information.</p><p>This privacy policy explains how we collect, use, and protect your data when you use our platform.</p>',
            'meta_title' => 'Privacy Policy - CareerPlus',
            'meta_description' => 'Read our privacy policy to understand how CareerPlus protects and handles your personal information.',
            'is_published' => true,
            'created_by' => $admin->id,
            'published_at' => now()
        ],
        [
            'title' => 'Terms of Service',
            'slug' => 'terms-of-service',
            'content' => '<h1>Terms of Service</h1><p>By using CareerPlus, you agree to these terms of service. Please read them carefully.</p><p>These terms govern your use of our platform and outline the rights and responsibilities of both users and the platform.</p>',
            'meta_title' => 'Terms of Service - CareerPlus',
            'meta_description' => 'Review the terms of service for using CareerPlus job portal platform.',
            'is_published' => true,
            'created_by' => $admin->id,
            'published_at' => now()
        ],
        [
            'title' => 'Contact Us',
            'slug' => 'contact-us',
            'content' => '<h1>Contact Us</h1><p>Get in touch with the CareerPlus team.</p><p>Email: support@careerplus.com<br>Phone: +1 (555) 123-4567<br>Address: 123 Career Street, Job City, JC 12345</p>',
            'meta_title' => 'Contact Us - CareerPlus',
            'meta_description' => 'Get in touch with CareerPlus support team for any questions or assistance.',
            'is_published' => true,
            'created_by' => $admin->id,
            'published_at' => now()
        ],
        [
            'title' => 'FAQ',
            'slug' => 'faq',
            'content' => '<h1>Frequently Asked Questions</h1><h2>How do I create an account?</h2><p>You can register as either a job seeker or employer by clicking the "Register" button and following the instructions.</p><h2>How do I post a job?</h2><p>Employers can post jobs by logging into their account and navigating to the job posting section.</p>',
            'meta_title' => 'FAQ - CareerPlus',
            'meta_description' => 'Find answers to frequently asked questions about using CareerPlus job portal.',
            'is_published' => true,
            'created_by' => $admin->id,
            'published_at' => now()
        ],
        [
            'title' => 'Career Advice',
            'slug' => 'career-advice',
            'content' => '<h1>Career Advice</h1><p>Expert tips for advancing your career.</p><h2>Resume Writing Tips</h2><p>Learn how to create a compelling resume that stands out to employers.</p><h2>Interview Preparation</h2><p>Get ready for your next job interview with our comprehensive guide.</p>',
            'meta_title' => 'Career Advice - CareerPlus',
            'meta_description' => 'Get expert career advice, resume tips, and interview preparation guidance from CareerPlus.',
            'is_published' => false,
            'created_by' => $admin->id,
            'published_at' => null
        ]
    ];

    foreach ($cmsPages as $pageData) {
        CmsPage::create($pageData);
    }

    echo "✅ CMS data seeded successfully!\n";
    echo "Created " . count($cmsPages) . " CMS pages\n";

    $publishedCount = collect($cmsPages)->where('is_published', true)->count();
    $draftCount = collect($cmsPages)->where('is_published', false)->count();

    echo "📄 Published pages: {$publishedCount}\n";
    echo "📝 Draft pages: {$draftCount}\n";

} catch (Exception $e) {
    echo "❌ Error seeding CMS data: " . $e->getMessage() . "\n";
}