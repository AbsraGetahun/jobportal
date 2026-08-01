<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Cache;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap the Laravel application
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Registration with Phone Number...\n";
echo "==========================================\n\n";

try {
    // Test data with phone number
    $testData = [
        'name' => 'Test User With Phone',
        'username' => 'testuserphone' . rand(1000, 9999),
        'email' => 'testphone' . rand(1000, 9999) . '@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '+251977586823',
        'degree' => 'Bachelor of Science',
        'fieldOfStudy' => 'Computer Science',
        'experience' => '3',
        'hasCompany' => false,
        'address' => '123 Test Street',
        'website' => 'https://example.com'
    ];

    echo "Test data includes phone: {$testData['phone']}\n\n";

    // Create request
    $request = Request::create('/api/register', 'POST', $testData);

    // Manually set request data for validation
    $request->request->add($testData);

    echo "Request data prepared\n";

    // Create RegisterRequest for validation
    $registerRequest = new RegisterRequest();
    $registerRequest->setContainer(app());
    $registerRequest->setRedirector(app('redirect'));

    // Validate the request
    echo "Validating request...\n";
    $validatedData = $registerRequest->validateResolved();

    echo "✅ Validation passed!\n";
    echo "Validated phone: " . ($validatedData['phone'] ?? 'NOT FOUND') . "\n\n";

    // Create AuthController
    $authController = new AuthController();

    // Call register method
    echo "Calling registration method...\n";
    $response = $authController->register($registerRequest);

    echo "Registration response status: " . $response->getStatusCode() . "\n";
    echo "Registration response: " . $response->getContent() . "\n\n";

    // Check if user was created with phone
    $user = \App\Models\User::where('email', $testData['email'])->first();
    if ($user) {
        echo "✅ User created successfully!\n";
        echo "User ID: {$user->id}\n";
        echo "User Name: {$user->name}\n";
        echo "User Phone: " . ($user->phone ?? 'NULL') . "\n";
        echo "Phone matches input: " . (($user->phone === $testData['phone']) ? 'YES' : 'NO') . "\n";
    } else {
        echo "❌ User was not created\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>