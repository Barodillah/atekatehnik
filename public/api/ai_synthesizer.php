<?php
/**
 * AI Synthesizer - Stage 2 of Chatbot Pipeline
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
$MAX_TOKENS = 4096;
$TEMPERATURE = 0.7;

// --- Rate Limiting ---
session_start();
$now = time();
$rateKey = 'chatbot_requests';
$rateLimit = 20;
$rateWindow = 60;

if (!isset($_SESSION[$rateKey])) {
    $_SESSION[$rateKey] = [];
}
$_SESSION[$rateKey] = array_filter($_SESSION[$rateKey], function ($ts) use ($now, $rateWindow) {
    return ($now - $ts) < $rateWindow;
});
if (count($_SESSION[$rateKey]) >= $rateLimit) {
    http_response_code(429);
    echo json_encode(['error' => 'Terlalu banyak permintaan. Silakan tunggu sebentar.']);
    exit;
}
$_SESSION[$rateKey][] = $now;

// --- Parse Input ---
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['messages']) || !is_array($input['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body']);
    exit;
}

$intent = $input['intent'] ?? 'static';
$keywords = $input['keywords'] ?? '';
$sessionKey = isset($input['session_key']) ? substr(trim($input['session_key']), 0, 64) : null;
$pageUrl = isset($input['page_url']) ? substr($input['page_url'], 0, 500) : null;

// Sanitize messages
$messages = array_map(function ($msg) {
    return [
        'role' => in_array($msg['role'], ['system', 'user', 'assistant']) ? $msg['role'] : 'user',
        'content' => substr(trim($msg['content'] ?? ''), 0, 10000),
    ];
}, $input['messages']);

// Remove any existing system prompt provided by frontend since we build it here
$messages = array_filter($messages, function($msg) {
    return $msg['role'] !== 'system';
});
$messages = array_values($messages);

// --- Build Context ---
$db = getDB();

// 1. Static KB
$staticKB = "
CV Ateka Tehnik adalah perusahaan manufaktur dan instalasi mesin penggilingan padi (Rice Milling Unit / RMU) yang berpengalaman lebih dari 20 tahun.
- Alamat: Jl. Grompol - Jambangan, Gondang, Kedungjeruk, Kec. Mojogedang, Kabupaten Karanganyar, Jawa Tengah
- Kontak: 0881080634612
- Produk: Paket 1-2 Ton (Menengah), 3-5 Ton (Industri), Satake (Ekspor), Mobile, dan Pemula. Juga mesin satuan: Elevator, Blower, Dryer, Polisher, dsb.
- Aturan Eskalasi: Jika ditanya harga paket lengkap, nego berat, jadwal instalasi langsung, atau hal sangat teknis, sarankan user menghubungi via WhatsApp dengan ramah.
";

// 2. Database Search Results
$dbSearchResults = "Tidak ada pencarian database yang diperlukan atau hasil kosong.";

if ($keywords && in_array($intent, ['product_search', 'portfolio_search'])) {
    $dbSearchResults = "Hasil Pencarian Database untuk '$keywords':\n";
    $searchTerms = explode(' ', $keywords);
    
    if ($intent === 'product_search') {
        // Build query for products
        $conditions = [];
        $params = [];
        foreach ($searchTerms as $idx => $term) {
            $conditions[] = "(p.nama LIKE :n$idx OR p.kategori LIKE :k$idx OR p.description LIKE :d$idx OR ps.spesifikasi LIKE :s$idx)";
            $params[":n$idx"] = "%{$term}%";
            $params[":k$idx"] = "%{$term}%";
            $params[":d$idx"] = "%{$term}%";
            $params[":s$idx"] = "%{$term}%";
        }
        $whereClause = implode(' AND ', $conditions);
        
        $stmt = $db->prepare("
            SELECT p.nama, p.kategori, p.description, p.slug, p.gambar, GROUP_CONCAT(ps.spesifikasi SEPARATOR '; ') as spesifikasi 
            FROM products p 
            LEFT JOIN product_specs ps ON p.id = ps.product_id 
            WHERE $whereClause 
            GROUP BY p.id 
            LIMIT 5
        ");
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        if ($results) {
            foreach ($results as $row) {
                // Remove HTML tags from specifications and description for cleaner context
                $cleanSpec = strip_tags($row['spesifikasi']);
                $cleanDesc = strip_tags($row['description']);
                $dbSearchResults .= "- PRODUK: {$row['nama']} (Kategori: {$row['kategori']}). Deskripsi: {$cleanDesc}. Spesifikasi: {$cleanSpec}. Link: /product/{$row['slug']} . Gambar: {$row['gambar']}\n";
            }
        } else {
            $dbSearchResults .= "Tidak ada produk spesifik yang cocok. Berikan jawaban umum tentang produk yang mirip berdasarkan pengetahuan statis.\n";
        }
    } else if ($intent === 'portfolio_search') {
        // Build query for posts/portfolio
        $conditions = [];
        $params = [];
        foreach ($searchTerms as $idx => $term) {
            $conditions[] = "(title LIKE :t$idx OR content LIKE :c$idx OR category LIKE :cat$idx)";
            $params[":t$idx"] = "%{$term}%";
            $params[":c$idx"] = "%{$term}%";
            $params[":cat$idx"] = "%{$term}%";
        }
        $whereClause = implode(' AND ', $conditions);
        
        $stmt = $db->prepare("SELECT title, category, subtitle, slug, cover_image FROM posts WHERE $whereClause LIMIT 5");
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        if ($results) {
            foreach ($results as $row) {
                $typePath = $row['category'] === 'Industrial Installations' ? 'portfolio' : 'news';
                $dbSearchResults .= "- POST: {$row['title']} (Kategori: {$row['category']}). Ringkasan: {$row['subtitle']}. Link: /$typePath/{$row['slug']} . Gambar: {$row['cover_image']}\n";
            }
        } else {
            $dbSearchResults .= "Tidak ada portofolio/berita yang cocok.\n";
        }
    }
}

$pageCtx = "URL Halaman Saat Ini: " . ($pageUrl ?? 'Tidak diketahui');

// Construct Final System Prompt
$systemPrompt = "Kamu adalah **Ateka AI Assistant**, asisten virtual pintar dari **CV Ateka Tehnik**.

[=== KONTEKS STATIS PERUSAHAAN ===]
{$staticKB}

[=== HASIL PENCARIAN DATABASE ({$intent}) ===]
{$dbSearchResults}

[=== KONTEKS HALAMAN SAAT INI ===]
{$pageCtx}

ATURAN WAJIB FORMAT JSON:
Kamu HARUS SELALU merespons dalam format JSON murni. Jangan tambahkan teks apa pun di luar blok JSON. Gunakan format skema berikut (Wajib!):
{
  \"answer\": \"Respon jawaban kamu kepada user. Gunakan markdown untuk memformat teks (bold, list, dsb). Jika ditanya harga rumit/paket besar, arahkan ke WhatsApp agen. Jika menyertakan data dari HASIL PENCARIAN, berikan info sesuai data tersebut secara komunikatif.\",
  \"quick_questions\": [\"Pertanyaan lanjutan 1\", \"Pertanyaan lanjutan 2\"],
  \"related_links\": [
    {
       \"type\": \"product|news|portfolio\",
       \"title\": \"Judul persis dari HASIL PENCARIAN\",
       \"subtitle\": \"Penjelasan singkat 1 kalimat tentang data tersebut\",
       \"image\": \"URL gambar persis dari HASIL PENCARIAN (copy paste dari data, jangan karang sendiri)\",
       \"link\": \"URL link persis dari HASIL PENCARIAN (copy paste dari data, jangan karang sendiri)\"
    }
  ]
}

PENTING: 
1. 'related_links' HANYA boleh diisi jika ada data di 'HASIL PENCARIAN DATABASE'.
2. DILARANG KERAS mengarang, menebak, atau memanipulasi URL gambar maupun URL link. Semuanya HARUS diambil (copy-paste) persis dari data yang saya sediakan di atas. Kosongkan array related_links jika data tidak ada.";

// Add system prompt to the beginning
array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);

// --- Call OpenRouter API ---
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
        'X-Title: Ateka Tehnik AI Synthesizer',
    ],
    CURLOPT_TIMEOUT => 45,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode !== 200) {
    http_response_code($httpCode ?: 502);
    echo json_encode([
        'answer' => 'Maaf, sistem sedang sibuk atau ada kendala koneksi. Silakan coba sesaat lagi atau hubungi via WhatsApp.',
        'quick_questions' => [],
        'related_links' => []
    ]);
    exit;
}

// Return API response to frontend
http_response_code(200);
echo $response;

// --- Persist Chat to Database (Async-style after output) ---
if ($sessionKey) {
    try {
        $stmt = $db->prepare("SELECT id FROM chat_sessions WHERE session_key = :sk LIMIT 1");
        $stmt->execute([':sk' => $sessionKey]);
        $session = $stmt->fetch();

        if (!$session) {
            $stmt = $db->prepare("
                INSERT INTO chat_sessions (session_key, visitor_ip, visitor_ua, page_url, status, message_count, started_at, last_message_at)
                VALUES (:sk, :ip, :ua, :url, 'active', 0, NOW(), NOW())
            ");
            $stmt->execute([
                ':sk'  => $sessionKey,
                ':ip'  => $_SERVER['REMOTE_ADDR'] ?? null,
                ':ua'  => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : null,
                ':url' => $pageUrl,
            ]);
            $sessionId = (int) $db->lastInsertId();
        } else {
            $sessionId = (int) $session['id'];
        }

        // Get last user message from input array
        $lastUserContent = null;
        for ($i = count($input['messages']) - 1; $i >= 0; $i--) {
            if ($input['messages'][$i]['role'] === 'user') {
                $lastUserContent = substr(trim($input['messages'][$i]['content'] ?? ''), 0, 10000);
                break;
            }
        }

        $responseData = json_decode($response, true);
        $assistantContent = $responseData['choices'][0]['message']['content'] ?? null;
        $insertedCount = 0;

        if ($lastUserContent) {
            $stmt = $db->prepare("INSERT INTO chat_messages (session_id, role, content, is_error, sent_at) VALUES (:sid, 'user', :content, 0, NOW())");
            $stmt->execute([':sid' => $sessionId, ':content' => $lastUserContent]);
            $insertedCount++;
        }

        if ($assistantContent) {
            $stmt = $db->prepare("INSERT INTO chat_messages (session_id, role, content, is_error, sent_at) VALUES (:sid, 'assistant', :content, 0, NOW())");
            $stmt->execute([':sid' => $sessionId, ':content' => $assistantContent]);
            $insertedCount++;
        }

        if ($insertedCount > 0) {
            $stmt = $db->prepare("UPDATE chat_sessions SET message_count = message_count + :cnt, last_message_at = NOW() WHERE id = :sid");
            $stmt->execute([':cnt' => $insertedCount, ':sid' => $sessionId]);
        }
    } catch (Exception $e) {
        error_log("Chat history save error: " . $e->getMessage());
    }
}
