<?php

// Test if JSON data is being sent correctly
$input = file_get_contents('php://input');
echo "Raw input:\n";
var_dump($input);

// Try to parse JSON
$data = json_decode($input, true);
echo "Parsed JSON:\n";
var_dump($data);

// Check if email and password are in the parsed data
if ($data && isset($data['email']) && isset($data['password'])) {
    echo "Email: " . $data['email'] . "\n";
    echo "Password: " . $data['password'] . "\n";
} else {
    echo "Email and/or password not found in parsed data\n";
}