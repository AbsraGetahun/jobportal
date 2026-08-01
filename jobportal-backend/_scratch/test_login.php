<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;

// Create a mock request
$request = Request::create('/api/login', 'POST', [
    'email' => 'test@example.com',
    'password' => 'password'
]);

// Set the content type
$request->headers->set('Content-Type', 'application/json');

// Create a LoginRequest instance
$loginRequest = LoginRequest::createFrom($request);

// Validate the request
if ($loginRequest->authorize()) {
    $validator = \Illuminate\Support\Facades\Validator::make($loginRequest->all(), $loginRequest->rules());
    if ($validator->fails()) {
        echo "Validation failed:\n";
        print_r($validator->errors()->toArray());
    } else {
        echo "Validation passed\n";
    }
} else {
    echo "Request not authorized\n";
}