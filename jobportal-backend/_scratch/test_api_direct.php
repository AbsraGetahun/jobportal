<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing API Endpoint Directly ===\n\n";

// Get admin user
$admin = User::where('is_admin', true)->first();
if (!$admin) {
    echo "❌ No admin user found!\n";
    exit(1);
}

echo "✅ Admin user: {$admin->name} (ID: {$admin->id})\n\n";

// Simulate the API request
echo "Testing /api/notifications endpoint...\n";

try {
    // Create a request object
    $request = Request::create('/api/notifications', 'GET', [], [], [], [
        'HTTP_Authorization' => 'Bearer test_token',
        'HTTP_Accept' => 'application/json'
    ]);

    // Set the authenticated user
    auth()->login($admin);

    // Get the router and find the route
    $router = app('router');
    $routes = $router->getRoutes();

    $foundRoute = null;
    foreach ($routes as $route) {
        if ($route->getUri() === 'api/notifications' && in_array('GET', $route->getMethods())) {
            $foundRoute = $route;
            break;
        }
    }

    if ($foundRoute) {
        echo "✅ Found route: {$foundRoute->getUri()}\n";
        echo "✅ Route action: {$foundRoute->getActionName()}\n";

        // Try to resolve the controller
        $action = $foundRoute->getAction();
        if (isset($action['controller'])) {
            $controllerInfo = explode('@', $action['controller']);
            echo "✅ Controller: {$controllerInfo[0]}\n";
            echo "✅ Method: {$controllerInfo[1]}\n";

            // Try to instantiate the controller and call the method
            $controllerClass = $controllerInfo[0];
            $method = $controllerInfo[1];

            if (class_exists($controllerClass)) {
                echo "✅ Controller class exists\n";

                $controller = new $controllerClass();
                if (method_exists($controller, $method)) {
                    echo "✅ Controller method exists\n";

                    // Call the method
                    $response = $controller->$method($request);
                    echo "✅ Method executed successfully\n";

                    if ($response) {
                        $responseData = json_decode($response->getContent(), true);
                        if ($responseData) {
                            echo "✅ Response contains data\n";
                            echo "Response type: " . gettype($responseData) . "\n";
                            if (is_array($responseData)) {
                                echo "Response keys: " . implode(', ', array_keys($responseData)) . "\n";
                            }
                        } else {
                            echo "❌ Response is empty or not valid JSON\n";
                        }
                    } else {
                        echo "❌ No response returned\n";
                    }
                } else {
                    echo "❌ Controller method does not exist\n";
                }
            } else {
                echo "❌ Controller class does not exist\n";
            }
        } else {
            echo "❌ No controller defined for route\n";
        }
    } else {
        echo "❌ Route not found\n";
        echo "Available routes:\n";
        foreach ($routes as $route) {
            if (strpos($route->getUri(), 'notification') !== false) {
                echo "  - {$route->getUri()} ({$route->getActionName()})\n";
            }
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";