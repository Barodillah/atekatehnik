<?php
/**
 * AI Router - Stage 1 of Chatbot Pipeline
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/db.php';
$OPENROUTER_MODEL = 'google/gemini-2.5-flash-lite';
$MAX_TOKENS = 300;
$TEMPERATURE = 0.1; // Low temperature for deterministic classification

$input = json_decode(file_get_contents('php://input'), true);
$query = isset($input['query']) ? trim($input['query']) : '';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Query is required']);
    exit;
}

$systemPrompt = "Kamu adalah Router Analis untuk chatbot CV Ateka Tehnik (Mesin Penggilingan Padi). Analisis input user dan tentukan kategorinya.
Kategori yang tersedia:
1. 'static' : Pertanyaan umum perusahaan, lokasi, alamat, cara pemesanan, jam buka, faq, siapa kalian.
2. 'product_search' : Mencari detail mesin, kapasitas, rekomendasi produk, spesifikasi teknis, fungsi komponen, atau info harga mesin.
3. 'portfolio_search' : Menanyakan pengalaman proyek, instalasi pabrik, atau berita/artikel industri.
4. 'escalate' : Meminta komplain keras, negosiasi harga ekstrem, atau minta dihubungkan langsung ke admin/WhatsApp/Telepon.

Jika kategori adalah pencarian (2 atau 3), ekstrak 1-3 kata kunci paling penting dari input user untuk dicari ke dalam database (contoh user bilang 'berapa harga mesin pemecah kulit satake?', keywordnya: 'pemecah kulit satake').

OUTPUT HARUS JSON MURNI DENGAN SKEMA:
{
  \"intent\": \"static | product_search | portfolio_search | escalate\",
  \"keywords\": \"kata kunci pencarian tanpa tanda hubung berlebih, kosongkan jika tidak ada\",
  \"ui_message\": \"Pesan sangat singkat untuk UI (contoh: 'Mencari spesifikasi...', 'Menganalisis...', 'Memuat portofolio...', 'Menyusun jawaban...')\"
}";

$messages = [
    ['role' => 'system', 'content' => $systemPrompt],
    ['role' => 'user', 'content' => $query]
];

$payload = json_encode([
    'model' => $OPENROUTER_MODEL,
    'messages' => $messages,
    'max_tokens' => $MAX_TOKENS,
    'temperature' => $TEMPERATURE,
    'response_format' => ['type' => 'json_object']
]);

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . OPENROUTER_API_KEY,
        'Content-Type: application/json',
        'HTTP-Referer: ' . ($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_HOST'] ?? 'https://atekateknik.com'),
        'X-Title: Ateka Tehnik AI Router',
    ],
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode !== 200) {
    // Fallback to static if router fails to keep the chat working smoothly
    echo json_encode([
        'intent' => 'static',
        'keywords' => '',
        'ui_message' => 'Menyusun jawaban...'
    ]);
    exit;
}

$responseData = json_decode($response, true);
$content = $responseData['choices'][0]['message']['content'] ?? null;

if ($content) {
    // Try to extract JSON if it was wrapped in markdown code blocks just in case
    $content = preg_replace('/```json\s*/i', '', $content);
    $content = preg_replace('/```\s*/', '', $content);
    
    $decoded = json_decode($content, true);
    if ($decoded && isset($decoded['intent'])) {
        echo json_encode([
            'intent' => $decoded['intent'],
            'keywords' => $decoded['keywords'] ?? '',
            'ui_message' => $decoded['ui_message'] ?? 'Memproses...'
        ]);
        exit;
    }
}

// Fallback
echo json_encode([
    'intent' => 'static',
    'keywords' => '',
    'ui_message' => 'Menyusun jawaban...'
]);
