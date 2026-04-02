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
$OPENROUTER_API_KEY = 'sk';
$OPENROUTER_MODEL = 'google/gemini-2.5-flash-lite';
$MAX_TOKENS = 1024;
$TEMPERATURE = 0.7;

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

// Session key from frontend (for chat history persistence)
$sessionKey = isset($input['session_key']) ? substr(trim($input['session_key']), 0, 64) : null;

// Sanitize messages (only allow role + content)
$messages = array_map(function ($msg) {
    return [
        'role' => in_array($msg['role'], ['system', 'user', 'assistant']) ? $msg['role'] : 'user',
        'content' => substr(trim($msg['content'] ?? ''), 0, 10000), // limit content length
    ];
}, $input['messages']);

// ── Call OpenRouter API ──────────────────────────────────────────────
$payload = json_encode([
    'model' => $OPENROUTER_MODEL,
    'messages' => $messages,
    'max_tokens' => $MAX_TOKENS,
    'temperature' => $TEMPERATURE,
]);

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $OPENROUTER_API_KEY,
        'Content-Type: application/json',
        'HTTP-Referer: ' . ($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_HOST'] ?? 'https://atekateknik.com'),
        'X-Title: Ateka Tehnik AI Assistant',
    ],
    CURLOPT_TIMEOUT => 30,
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

// ── Persist Chat to Database (async-style, after output) ────────────
// Save the latest user message and assistant reply to the database
if ($sessionKey && $httpCode === 200) {
    try {
        require_once __DIR__ . '/db.php';
        $db = getDB();

        // Find or create chat_session
        $stmt = $db->prepare("SELECT id FROM chat_sessions WHERE session_key = :sk LIMIT 1");
        $stmt->execute([':sk' => $sessionKey]);
        $session = $stmt->fetch();

        if (!$session) {
            // Create new session
            $stmt = $db->prepare("
                INSERT INTO chat_sessions (session_key, visitor_ip, visitor_ua, page_url, status, message_count, started_at, last_message_at)
                VALUES (:sk, :ip, :ua, :url, 'active', 0, NOW(), NOW())
            ");
            $stmt->execute([
                ':sk'  => $sessionKey,
                ':ip'  => $_SERVER['REMOTE_ADDR'] ?? null,
                ':ua'  => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : null,
                ':url' => isset($input['page_url']) ? substr($input['page_url'], 0, 500) : null,
            ]);
            $sessionId = (int) $db->lastInsertId();
        } else {
            $sessionId = (int) $session['id'];
        }

        // Extract the last user message (skip system prompt)
        $lastUserContent = null;
        $allMessages = $input['messages'];
        for ($i = count($allMessages) - 1; $i >= 0; $i--) {
            if ($allMessages[$i]['role'] === 'user') {
                $lastUserContent = substr(trim($allMessages[$i]['content'] ?? ''), 0, 10000);
                break;
            }
        }

        // Extract assistant reply from response
        $responseData = json_decode($response, true);
        $assistantContent = $responseData['choices'][0]['message']['content'] ?? null;

        $insertedCount = 0;

        // Insert user message
        if ($lastUserContent) {
            $stmt = $db->prepare("INSERT INTO chat_messages (session_id, role, content, is_error, sent_at) VALUES (:sid, 'user', :content, 0, NOW())");
            $stmt->execute([':sid' => $sessionId, ':content' => $lastUserContent]);
            $insertedCount++;
        }

        // Insert assistant message
        if ($assistantContent) {
            $stmt = $db->prepare("INSERT INTO chat_messages (session_id, role, content, is_error, sent_at) VALUES (:sid, 'assistant', :content, 0, NOW())");
            $stmt->execute([':sid' => $sessionId, ':content' => $assistantContent]);
            $insertedCount++;
        }

        // Update session counters
        if ($insertedCount > 0) {
            $stmt = $db->prepare("UPDATE chat_sessions SET message_count = message_count + :cnt, last_message_at = NOW() WHERE id = :sid");
            $stmt->execute([':cnt' => $insertedCount, ':sid' => $sessionId]);
        }
    } catch (Exception $e) {
        // Chat history saving should never break the main response
        error_log("Chat history save error: " . $e->getMessage());
    }
}
