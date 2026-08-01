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

echo "Checking employer phone data in database...\n";
echo "==========================================\n\n";

try {
    // Get all employers
    $employers = Capsule::table('users')
        ->whereNotNull('hasCompany')
        ->select('id', 'name', 'email', 'phone', 'hasCompany')
        ->get();

    echo "Total employers found: " . $employers->count() . "\n\n";

    $withPhone = 0;
    $withoutPhone = 0;

    foreach ($employers as $employer) {
        $phoneValue = $employer->phone;
        $phoneDisplay = $phoneValue ?? 'NULL';

        if ($phoneValue) {
            $withPhone++;
            echo "✅ HAS PHONE: {$employer->name} - {$phoneDisplay}\n";
        } else {
            $withoutPhone++;
            echo "❌ NO PHONE: {$employer->name} - {$phoneDisplay}\n";
        }
    }

    echo "\nSUMMARY:\n";
    echo "Employers with phone: {$withPhone}\n";
    echo "Employers without phone: {$withoutPhone}\n";
    echo "Total: " . ($withPhone + $withoutPhone) . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>