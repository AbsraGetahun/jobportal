<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\User;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔧 FRONTEND AUTHENTICATION DEBUGGING\n\n";

// 1. Check admin user
$admin = User::where('is_admin', true)->first();
if (!$admin) {
    echo "❌ CRITICAL: No admin user found!\n";
    exit(1);
}
echo "✅ Admin user exists: {$admin->email}\n";

// 2. Test login API directly
echo "\n🔐 TESTING LOGIN API:\n";
$loginData = json_encode([
    'email' => 'admin@jobportal.com',
    'password' => 'Admin123!',
    'userType' => 'admin'
]);

$ch = curl_init('http://127.0.0.1:8000/api/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login API Response Code: {$loginHttpCode}\n";

if ($loginHttpCode === 200) {
    $loginData = json_decode($loginResponse, true);
    if (isset($loginData['access_token'])) {
        $token = $loginData['access_token'];
        echo "✅ Login successful! Token received.\n";

        // 3. Test system settings API with token
        echo "\n📊 TESTING SYSTEM SETTINGS API:\n";
        $settingsCh = curl_init('http://127.0.0.1:8000/api/admin/settings');
        curl_setopt($settingsCh, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($settingsCh, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);

        $settingsResponse = curl_exec($settingsCh);
        $settingsHttpCode = curl_getinfo($settingsCh, CURLINFO_HTTP_CODE);
        curl_close($settingsCh);

        echo "Settings API Response Code: {$settingsHttpCode}\n";

        if ($settingsHttpCode === 200) {
            $settingsData = json_decode($settingsResponse, true);
            if (isset($settingsData['data']) && is_array($settingsData['data'])) {
                $count = count($settingsData['data']);
                echo "✅ SUCCESS: Retrieved {$count} system settings!\n";
            } else {
                echo "❌ ERROR: Unexpected response format\n";
                echo "Response: " . substr($settingsResponse, 0, 200) . "...\n";
            }
        } else {
            echo "❌ ERROR: Settings API failed\n";
            echo "Response: " . substr($settingsResponse, 0, 200) . "...\n";
        }

        // 4. Test CMS API with token
        echo "\n📄 TESTING CMS API:\n";
        $cmsCh = curl_init('http://127.0.0.1:8000/api/admin/cms/pages');
        curl_setopt($cmsCh, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($cmsCh, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);

        $cmsResponse = curl_exec($cmsCh);
        $cmsHttpCode = curl_getinfo($cmsCh, CURLINFO_HTTP_CODE);
        curl_close($cmsCh);

        echo "CMS API Response Code: {$cmsHttpCode}\n";

        if ($cmsHttpCode === 200) {
            $cmsData = json_decode($cmsResponse, true);
            if (isset($cmsData['data']) && is_array($cmsData['data'])) {
                $count = count($cmsData['data']);
                echo "✅ SUCCESS: Retrieved {$count} CMS pages!\n";
            } else {
                echo "❌ ERROR: Unexpected response format\n";
                echo "Response: " . substr($cmsResponse, 0, 200) . "...\n";
            }
        } else {
            echo "❌ ERROR: CMS API failed\n";
            echo "Response: " . substr($cmsResponse, 0, 200) . "...\n";
        }

    } else {
        echo "❌ ERROR: No access token in login response\n";
        echo "Response: " . substr($loginResponse, 0, 200) . "...\n";
    }
} else {
    echo "❌ ERROR: Login API failed\n";
    echo "Response: " . substr($loginResponse, 0, 200) . "...\n";
}

echo "\n🔧 TROUBLESHOOTING STEPS:\n";
echo "1. Clear browser cache and localStorage completely\n";
echo "2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)\n";
echo "3. Try logging in again with the exact credentials\n";
echo "4. Check browser Network tab for failed API calls\n";
echo "5. Verify the React dev server is running on the correct port\n\n";

echo "📋 CREDENTIALS TO USE:\n";
echo "Email: admin@jobportal.com\n";
echo "Password: Admin123!\n";
echo "User Type: Admin\n\n";

echo "🎯 If the API tests above work but frontend doesn't:\n";
echo "- The issue is frontend authentication handling\n";
echo "- Check that the frontend is sending the Authorization header correctly\n";
echo "- Verify the API base URL in frontend config matches backend\n";