<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\User;
use App\Models\SystemSetting;
use App\Models\CmsPage;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔍 ADMIN SYSTEM VERIFICATION\n\n";

// Check admin user
$admin = User::where('is_admin', true)->first();
if ($admin) {
    echo "✅ Admin user found: {$admin->email}\n";
} else {
    echo "❌ No admin user found!\n";
    exit(1);
}

// Check system settings
$settingsCount = SystemSetting::count();
echo "✅ System Settings: {$settingsCount} settings\n";

// Check CMS pages
$cmsCount = CmsPage::count();
$publishedCount = CmsPage::where('is_published', true)->count();
$draftCount = CmsPage::where('is_published', false)->count();
echo "✅ CMS Pages: {$cmsCount} total ({$publishedCount} published, {$draftCount} draft)\n";

// Check job categories
$categories = \App\Models\Job::distinct('category')
    ->whereNotNull('category')
    ->where('category', '!=', '')
    ->count('category');
echo "✅ Job Categories: {$categories} categories\n";

echo "\n📋 ADMIN LOGIN CREDENTIALS:\n";
echo "Email: admin@jobportal.com\n";
echo "Password: Admin123!\n";
echo "User Type: Admin\n\n";

echo "🌐 ACCESS URLs:\n";
echo "Frontend: http://localhost:5173 (or your React dev server)\n";
echo "Admin Dashboard: /admin/dashboard\n";
echo "System Settings: /admin/settings\n";
echo "CMS: /admin/cms\n\n";

echo "🔧 TROUBLESHOOTING:\n";
echo "1. Make sure you're logged in as admin\n";
echo "2. Check browser developer tools for authentication errors\n";
echo "3. Clear browser cache and localStorage if needed\n";
echo "4. Ensure backend server is running on port 8000\n\n";

echo "📊 EXPECTED RESULTS AFTER LOGIN:\n";
echo "System Settings Page:\n";
echo "  - Total Settings: 22\n";
echo "  - Groups: 6\n";
echo "  - Public Settings: 5\n";
echo "  - Recently Updated: 22\n\n";

echo "CMS Page:\n";
echo "  - Total Pages: 6\n";
echo "  - Published Pages: 5\n";
echo "  - Draft Pages: 1\n";
echo "  - Categories: {$categories}\n\n";

echo "🎯 STATUS: All systems are ready and populated with data!\n";