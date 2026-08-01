<?php
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configure the database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => __DIR__ . '/database/database.sqlite',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Checking Current Phone Field Data in Database...\n";
echo "================================================\n\n";

try {
    // Get all employers
    $employers = Capsule::table('users')
        ->whereNotNull('hasCompany')
        ->select('id', 'name', 'email', 'phone', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

    echo "Total employers found: " . $employers->count() . "\n\n";

    $withPhone = 0;
    $withoutPhone = 0;

    echo "EMPLOYER PHONE STATUS:\n";
    echo "======================\n";

    foreach ($employers as $employer) {
        $phoneValue = $employer->phone;
        $phoneDisplay = $phoneValue ?? 'NULL';

        if ($phoneValue) {
            $withPhone++;
            echo "✅ HAS PHONE: {$employer->name} ({$employer->email})\n";
            echo "   Phone: {$phoneDisplay}\n";
            echo "   Created: {$employer->created_at}\n\n";
        } else {
            $withoutPhone++;
            echo "❌ NO PHONE: {$employer->name} ({$employer->email})\n";
            echo "   Phone: {$phoneDisplay}\n";
            echo "   Created: {$employer->created_at}\n\n";
        }
    }

    echo "SUMMARY:\n";
    echo "========\n";
    echo "Employers with phone: {$withPhone}\n";
    echo "Employers without phone: {$withoutPhone}\n";
    echo "Total: " . ($withPhone + $withoutPhone) . "\n\n";

    // Check if there are any recent registrations that might have phone numbers
    echo "RECENT EMPLOYER REGISTRATIONS:\n";
    echo "===============================\n";

    $recentEmployers = Capsule::table('users')
        ->whereNotNull('hasCompany')
        ->where('created_at', '>=', date('Y-m-d H:i:s', strtotime('-7 days')))
        ->select('id', 'name', 'email', 'phone', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

    if ($recentEmployers->count() > 0) {
        echo "Found {$recentEmployers->count()} employers registered in the last 7 days:\n\n";
        foreach ($recentEmployers as $employer) {
            $phoneValue = $employer->phone;
            $status = $phoneValue ? "✅ HAS PHONE: {$phoneValue}" : "❌ NO PHONE";
            echo "• {$employer->name} - {$status} (Created: {$employer->created_at})\n";
        }
    } else {
        echo "No employers registered in the last 7 days.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>