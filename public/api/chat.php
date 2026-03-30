<?php
/**
 * OpenRouter API Proxy for Ateka Tehnik Chatbot
 * 
 * This file keeps the API key server-side (not exposed to browser).
 * Place this file in: public_html/api/chat.php
 */

// ── CORS & Headers ───────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Configuration ────────────────────────────────────────────────────
// PENTING: Ganti dengan API key Anda
$OPENROUTER_API_KEY = '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';
$OPENROUTER_MODEL   = 'google/gemini-2.5-flash-lite';
$MAX_TOKENS         = 1024;
$TEMPERATURE        = 0.7;

// ── Rate Limiting (simple session-based) ─────────────────────────────
session_start();
$now = time();
$rateKey = 'chatbot_requests';
$rateLimit = 20;       // max requests
$rateWindow = 60;      // per 60 seconds

if (!isset($_SESSION[$rateKey])) {
    $_SESSION[$rateKey] = [];
}

// Clean old entries
$_SESSION[$rateKey] = array_filter($_SESSION[$rateKey], function ($ts) use ($now, $rateWindow) {
    return ($now - $ts) < $rateWindow;
});

if (count($_SESSION[$rateKey]) >= $rateLimit) {
    http_response_code(429);
    echo json_encode(['error' => 'Terlalu banyak permintaan. Silakan tunggu sebentar.']);
    exit;
}

$_SESSION[$rateKey][] = $now;

// ── Parse Request Body ───────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['messages']) || !is_array($input['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body']);
    exit;
}

// Sanitize messages (only allow role + content)
$messages = array_map(function ($msg) {
    return [
        'role'    => in_array($msg['role'], ['system', 'user', 'assistant']) ? $msg['role'] : 'user',
        'content' => substr(trim($msg['content'] ?? ''), 0, 10000), // limit content length
    ];
}, $input['messages']);

// ── Call OpenRouter API ──────────────────────────────────────────────
$payload = json_encode([
    'model'       => $OPENROUTER_MODEL,
    'messages'    => $messages,
    'max_tokens'  => $MAX_TOKENS,
    'temperature' => $TEMPERATURE,
]);

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $OPENROUTER_API_KEY,
        'Content-Type: application/json',
        'HTTP-Referer: ' . ($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_HOST'] ?? 'https://atekateknik.com'),
        'X-Title: Ateka Tehnik AI Assistant',
    ],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// ── Handle Response ──────────────────────────────────────────────────
if ($curlError) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to connect to AI service']);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode ?: 502);
    echo json_encode(['error' => 'AI service returned an error', 'status' => $httpCode]);
    exit;
}

// Forward the OpenRouter response directly
http_response_code(200);
echo $response;
