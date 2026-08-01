<?php

$email = 'admin@jobportal.com';
$password = 'Admin123!';

function testAdminLogin($email, $password) {
    $url = 'http://127.0.0.1:8000/api/login';

    $data = json_encode([
        'email' => $email,
        'password' => $password,
        'userType' => 'admin'
    ]);

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'response' => $response];
}

echo "Testing admin login...\n";
$result = testAdminLogin($email, $password);

echo "Status Code: " . $result['code'] . "\n";

if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "✅ Login successful!\n";
    echo "Access Token: " . substr($data['access_token'], 0, 20) . "...\n";
    echo "Full Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    if (isset($data['user'])) {
        echo "User: " . json_encode($data['user'], JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "User data not found in response\n";
    }
} else {
    echo "❌ Login failed!\n";
    echo "Response: " . $result['response'] . "\n";
}
?>