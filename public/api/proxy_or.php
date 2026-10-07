<?php
/**
 * OpenRouter Proxy — Ateka Tehnik
 *
 * Secures OpenRouter API key on the backend. Receives chat completion payload 
 * from the React frontend, injects the secret API key, forwards to OpenRouter, 
 * and returns the response.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('POST');

// Verify frontend auth (optional but recommended for internal admin tools)
requireAuth();

// Receive the payload from frontend
$inputJson = file_get_contents('php://input');

// Setup request to OpenRouter
$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputJson);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . OPENROUTER_API_KEY,
    'HTTP-Referer: https://atekatehnik.com',
    'X-Title: Ateka Tehnik Admin'
]);

// Read and forward OpenRouter response
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Set HTTP code and send raw JSON response back to frontend
http_response_code($httpCode);
header('Content-Type: application/json');
echo $response;
