<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Notifications API ===\n\n";

// Get admin user
$admin = User::where('is_admin', true)->first();
if (!$admin) {
    echo "❌ No admin user found!\n";
    exit(1);
}

echo "✅ Admin user: {$admin->name} (ID: {$admin->id})\n\n";

// Simulate admin authentication
auth()->login($admin);
echo "✅ Admin authenticated for this request\n\n";

// Test the notifications index method directly
echo "Testing notifications index method...\n";

try {
    // Import the NotificationController
    $notificationController = new App\Http\Controllers\NotificationController();

    // Call the index method directly
    $response = $notificationController->index();

    echo "✅ Notifications index method executed successfully\n";

    // Get the response content
    $responseData = json_decode($response->getContent(), true);

    if (isset($responseData) && is_array($responseData)) {
        echo "✅ Found " . count($responseData) . " notifications in API response\n\n";

        if (count($responseData) > 0) {
            echo "Notifications:\n";
            foreach ($responseData as $notification) {
                echo "- ID: {$notification['id']}\n";
                echo "  Type: {$notification['type']}\n";
                echo "  Title: {$notification['title']}\n";
                echo "  Message: " . substr($notification['message'], 0, 60) . "...\n";
                echo "  Read: " . ($notification['is_read'] ? 'Yes' : 'No') . "\n";
                echo "  Created: {$notification['created_at']}\n\n";
            }
        } else {
            echo "❌ No notifications found in API response\n";
        }
    } else {
        echo "❌ Invalid API response format\n";
        print_r($responseData);
    }

} catch (Exception $e) {
    echo "❌ Error calling notifications index: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";

// Also check raw database query
echo "\n=== Raw Database Check ===\n";
$rawNotifications = Notification::where('user_id', $admin->id)->get();
echo "Raw database query found: " . $rawNotifications->count() . " notifications\n";

foreach ($rawNotifications as $notif) {
    echo "- {$notif->title}: " . substr($notif->message, 0, 50) . "...\n";
}