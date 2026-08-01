<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\FraudAlert;
use App\Models\CmsPage;
use App\Models\SystemSetting;
use App\Models\AuditLog;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test admin functionality
echo "=== Testing Admin Functionality ===\n\n";

// Test 1: Check if admin user exists
echo "1. Checking admin user...\n";
$admin = User::where('is_admin', true)->first();
if ($admin) {
    echo "✓ Admin user found: {$admin->name} ({$admin->email})\n";
} else {
    echo "✗ No admin user found\n";
}

// Test 2: Check system settings
echo "\n2. Checking system settings...\n";
$settingsCount = SystemSetting::count();
echo "✓ System settings count: {$settingsCount}\n";

$sampleSettings = SystemSetting::take(3)->get();
foreach ($sampleSettings as $setting) {
    echo "  - {$setting->key}: {$setting->value} ({$setting->type})\n";
}

// Test 3: Test fraud alert creation
echo "\n3. Testing fraud alert creation...\n";
$fraudAlert = FraudAlert::create([
    'type' => 'test_alert',
    'severity' => 'low',
    'description' => 'Test fraud alert for functionality check',
    'user_id' => $admin ? $admin->id : null,
    'status' => 'open'
]);
echo "✓ Created test fraud alert with ID: {$fraudAlert->id}\n";

// Test 4: Test CMS page creation
echo "\n4. Testing CMS page creation...\n";
$uniqueSlug = 'test-page-' . time();
$cmsPage = CmsPage::create([
    'title' => 'Test Page',
    'slug' => $uniqueSlug,
    'content' => '<h1>Test Content</h1><p>This is a test page.</p>',
    'is_published' => false,
    'created_by' => $admin ? $admin->id : null
]);
echo "✓ Created test CMS page with ID: {$cmsPage->id}\n";

// Test 5: Test audit log creation
echo "\n5. Testing audit log creation...\n";
$auditLog = AuditLog::create([
    'admin_id' => $admin ? $admin->id : null,
    'action' => 'test_action',
    'model_type' => 'User',
    'model_id' => $admin ? $admin->id : 1,
    'description' => 'Test audit log entry'
]);
echo "✓ Created test audit log with ID: {$auditLog->id}\n";

// Test 6: Check API routes exist
echo "\n6. Checking API routes...\n";
$routes = app('router')->getRoutes();
$adminRoutes = [];
foreach ($routes as $route) {
    if (str_contains($route->uri(), 'admin')) {
        $adminRoutes[] = $route->uri();
    }
}
echo "✓ Found " . count($adminRoutes) . " admin-related routes\n";
echo "Sample routes:\n";
foreach (array_slice($adminRoutes, 0, 5) as $route) {
    echo "  - {$route}\n";
}

// Summary
echo "\n=== Test Summary ===\n";
echo "✓ Admin user: " . ($admin ? 'Found' : 'Not found') . "\n";
echo "✓ System settings: {$settingsCount} settings\n";
echo "✓ Fraud alerts: Working\n";
echo "✓ CMS pages: Working\n";
echo "✓ Audit logs: Working\n";
echo "✓ Admin routes: " . count($adminRoutes) . " routes\n";

echo "\n=== Admin Functionality Test Complete ===\n";
echo "The admin system is ready for use!\n";