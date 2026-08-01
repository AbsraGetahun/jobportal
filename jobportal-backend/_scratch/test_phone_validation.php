<?php
require_once 'vendor/autoload.php';

use App\Http\Requests\RegisterRequest;
use Illuminate\Http\Request;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap the Laravel application
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Phone Field Validation...\n";
echo "=================================\n\n";

try {
    // Test data with phone number
    $testData = [
        'name' => 'Test User',
        'username' => 'testuser123',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '+251977586823',
        'degree' => 'Bachelor of Science',
        'hasCompany' => false
    ];

    echo "Test data includes phone: {$testData['phone']}\n\n";

    // Create request
    $request = Request::create('/api/register', 'POST', $testData);
    $request->request->add($testData);

    // Create RegisterRequest
    $registerRequest = new RegisterRequest();
    $registerRequest->setContainer(app());
    $registerRequest->setRedirector(app('redirect'));
    $registerRequest->replace($testData); // Set the request data

    echo "Testing validation rules...\n";

    // Get validation rules
    $rules = $registerRequest->rules();
    echo "Validation rules include phone: " . (isset($rules['phone']) ? 'YES' : 'NO') . "\n";
    if (isset($rules['phone'])) {
        echo "Phone validation rule: {$rules['phone']}\n";
    }

    echo "\nTesting validation...\n";

    // Validate
    $validator = app('validator')->make($testData, $rules);

    if ($validator->fails()) {
        echo "❌ Validation failed:\n";
        foreach ($validator->errors()->all() as $error) {
            echo "  - $error\n";
        }
    } else {
        echo "✅ Validation passed!\n";
        $validatedData = $validator->validated();
        echo "Validated phone: " . ($validatedData['phone'] ?? 'NOT FOUND') . "\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>