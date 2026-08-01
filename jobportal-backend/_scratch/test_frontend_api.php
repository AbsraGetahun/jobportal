<?php

// Test script to simulate frontend API call
echo "=== Testing Frontend API Call Simulation ===\n\n";

// Simulate the exact same call that the frontend makes
$apiUrl = 'http://localhost:8000/api/notifications';

// Create a cURL request that mimics what the frontend does
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer test_token', // This would be the actual token
    'Accept: application/json',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

echo "Making API call to: {$apiUrl}\n";
echo "Headers:\n";
echo "  Authorization: Bearer test_token\n";
echo "  Accept: application/json\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

echo "Response Code: {$httpCode}\n";
echo "Content Type: {$contentType}\n\n";

if (curl_error($ch)) {
    echo "cURL Error: " . curl_error($ch) . "\n";
} else {
    echo "Response Body:\n";
    echo $response . "\n\n";

    // Try to decode JSON
    $jsonResponse = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "JSON Response:\n";
        print_r($jsonResponse);
    } else {
        echo "Response is not valid JSON\n";
    }
}

curl_close($ch);

echo "\n=== Test Complete ===\n";
echo "If you get a 401 Unauthorized, the token is invalid.\n";
echo "If you get a 200 OK, the API is working.\n";