<?php

$token = '137|ms49D0LT5w5o5K8ll7z7GCyyTTVStVL5oOSH8aQZc18b1b0a';
$baseUrl = 'http://127.0.0.1:8000/api';

function makeRequest($endpoint, $method = 'GET', $data = null) {
    $headers = [
        'Accept: application/json',
        'Authorization: Bearer ' . $GLOBALS['token']
    ];

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $GLOBALS['baseUrl'] . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST' && $data) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'response' => $response];
}

// Test admin stats
echo "Testing /admin/stats...\n";
$result = makeRequest('/admin/stats');
echo "Status: " . $result['code'] . "\n";
if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "Success! Stats: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Failed: " . $result['response'] . "\n";
}

echo "\n";

// Test admin job seekers
echo "Testing /admin/jobseekers...\n";
$result = makeRequest('/admin/jobseekers');
echo "Status: " . $result['code'] . "\n";
if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "Success! Found " . count($data['data']) . " job seekers\n";
} else {
    echo "Failed: " . $result['response'] . "\n";
}

echo "\n";

// Test admin employers
echo "Testing /admin/employers...\n";
$result = makeRequest('/admin/employers');
echo "Status: " . $result['code'] . "\n";
if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "Success! Found " . count($data['data']) . " employers\n";
} else {
    echo "Failed: " . $result['response'] . "\n";
}

echo "\n";

// Test admin jobs
echo "Testing /admin/jobs...\n";
$result = makeRequest('/admin/jobs');
echo "Status: " . $result['code'] . "\n";
if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "Success! Found " . count($data['data']) . " jobs\n";
} else {
    echo "Failed: " . $result['response'] . "\n";
}

echo "\n";

// Test admin applications
echo "Testing /admin/applications...\n";
$result = makeRequest('/admin/applications');
echo "Status: " . $result['code'] . "\n";
if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "Success! Found " . count($data['data']) . " applications\n";
} else {
    echo "Failed: " . $result['response'] . "\n";
}

echo "\nAll tests completed!\n";
?>