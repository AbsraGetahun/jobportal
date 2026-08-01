<?php

$token = '139|79KmMEUPVJMreIhSR06E86Hxhn1zJUXt9AuWGc1h0f4b0672';

function testUserEndpoint($token) {
    $url = 'http://127.0.0.1:8000/api/user';

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'response' => $response];
}

echo "Testing /user endpoint with admin token...\n";
$result = testUserEndpoint($token);

echo "Status Code: " . $result['code'] . "\n";

if ($result['code'] === 200) {
    $data = json_decode($result['response'], true);
    echo "✅ User endpoint successful!\n";
    echo "Full Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ User endpoint failed!\n";
    echo "Response: " . $result['response'] . "\n";
}
?>