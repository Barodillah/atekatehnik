<?php
/**
 * WhatsApp Smart Redirect & Rotation API — Ateka Tehnik
 * 
 * GET /api/wa_redirect.php
 * Parameters:
 *   - source_page  : e.g. 'hero', 'floating-btn', 'product-detail', 'contact-page'
 *   - source_label : e.g. 'RMU 2 Ton', 'hubungi-langsung'
 *   - text         : WhatsApp message text
 *   - target       : optional 'rani' or 'barron' (for explicit CS destination)
 *
 * How Rotation Works:
 * - Queries wa_cta_clicks for the last targeted CS ('Rani' or 'Barron') across the entire database.
 * - If last was Rani -> assigns Barron (+62 882-0051-44907).
 * - If last was Barron (or none) -> assigns Rani (+62 881-0806-34612).
 * - Records click in wa_cta_clicks with IP, Geo, User-Agent, target_number, and target_label.
 * - Sends HTTP 302 (no-cache) to WhatsApp API with pre-filled message.
 * - Guaranteed 100% device & IP independent alternating rotation!
 */

require_once __DIR__ . '/db.php';

// Contacts definition
$csList = [
    'rani' => [
        'id'      => 'rani',
        'name'    => 'Rani',
        'number'  => '62881080634612',
        'display' => '+62 881-0806-34612'
    ],
    'barron' => [
        'id'      => 'barron',
        'name'    => 'Barron',
        'number'  => '62882005144907',
        'display' => '+62 882-0051-44907'
    ]
];

$sourcePage  = trim($_GET['source_page'] ?? 'website');
$sourceLabel = trim($_GET['source_label'] ?? '');
$targetParam = strtolower(trim($_GET['target'] ?? ''));
$text        = trim($_GET['text'] ?? 'Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik.');

if (empty($text)) {
    $text = 'Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik.';
}

// ── Analytics details ────────────────────────────────────────────────
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$referrer  = $_SERVER['HTTP_REFERER'] ?? '';

// Parse Browser, OS, Device Type
$browser    = 'Unknown';
$os         = 'Unknown';
$deviceType = 'Desktop';

if (preg_match('/Edg\//i', $userAgent))          $browser = 'Edge';
elseif (preg_match('/OPR|Opera/i', $userAgent))  $browser = 'Opera';
elseif (preg_match('/Chrome/i', $userAgent))     $browser = 'Chrome';
elseif (preg_match('/Firefox/i', $userAgent))    $browser = 'Firefox';
elseif (preg_match('/Safari/i', $userAgent) && !preg_match('/Chrome/i', $userAgent)) $browser = 'Safari';
elseif (preg_match('/MSIE|Trident/i', $userAgent)) $browser = 'Internet Explorer';

if (preg_match('/Windows/i', $userAgent))        $os = 'Windows';
elseif (preg_match('/Macintosh/i', $userAgent))  $os = 'macOS';
elseif (preg_match('/Linux/i', $userAgent))      $os = 'Linux';
elseif (preg_match('/Android/i', $userAgent))    $os = 'Android';
elseif (preg_match('/iPhone|iPad/i', $userAgent)) $os = 'iOS';

if (preg_match('/Mobi|Android.*Mobile/i', $userAgent)) {
    $deviceType = 'Mobile';
} elseif (preg_match('/Tablet|iPad/i', $userAgent)) {
    $deviceType = 'Tablet';
}

// Geolocation via ip-api.com
$country = '';
$city    = '';
if (!in_array($ip, ['127.0.0.1', '::1', 'unknown', 'localhost'])) {
    $geoUrl = "http://ip-api.com/json/{$ip}?fields=status,country,city";
    $ctx = stream_context_create(['http' => ['timeout' => 2]]);
    $geoResponse = @file_get_contents($geoUrl, false, $ctx);
    if ($geoResponse) {
        $geoData = json_decode($geoResponse, true);
        if (($geoData['status'] ?? '') === 'success') {
            $country = $geoData['country'] ?? '';
            $city    = $geoData['city'] ?? '';
        }
    }
} else {
    $country = 'Local';
    $city    = 'Localhost';
}

// ── Determine Target CS (Rani or Barron) ─────────────────────────────
$selectedCs = null;

if ($targetParam === 'rani' || strpos($targetParam, '881080634612') !== false) {
    $selectedCs = $csList['rani'];
} elseif ($targetParam === 'barron' || strpos($targetParam, '882005144907') !== false) {
    $selectedCs = $csList['barron'];
}

$db = null;
try {
    $db = getDB();
} catch (\Throwable $dbConnErr) {
    error_log("WA Redirect DB Conn Error: " . $dbConnErr->getMessage());
}

if ($selectedCs === null && $db !== null) {
    try {
        // Query the most recent recorded click with target_label
        $stmt = $db->query("
            SELECT target_label, target_number 
            FROM wa_cta_clicks 
            WHERE target_label IS NOT NULL 
              AND (LOWER(target_label) LIKE '%rani%' OR LOWER(target_label) LIKE '%barron%')
            ORDER BY id DESC 
            LIMIT 1
        ");
        $lastRow = $stmt ? $stmt->fetch() : null;

        if ($lastRow && !empty($lastRow['target_label'])) {
            $lastLabel = strtolower(trim($lastRow['target_label']));
            if (strpos($lastLabel, 'rani') !== false) {
                // Last was Rani -> Next is Barron!
                $selectedCs = $csList['barron'];
            } else {
                // Last was Barron -> Next is Rani!
                $selectedCs = $csList['rani'];
            }
        }
    } catch (\Throwable $queryErr) {
        error_log("WA Redirect Rotation Query Error: " . $queryErr->getMessage());
    }
}

// Default fallback if no prior click or DB failure
if ($selectedCs === null) {
    $selectedCs = $csList['rani'];
}

$targetNumber = $selectedCs['number'];
$targetLabel  = $selectedCs['name'];

// ── Log Click into Database ──────────────────────────────────────────
if ($db !== null) {
    try {
        // Auto-check/add target columns if missing
        try {
            $colCheck = $db->query("SHOW COLUMNS FROM wa_cta_clicks LIKE 'target_number'")->fetch();
            if (!$colCheck) {
                $db->exec("ALTER TABLE wa_cta_clicks ADD COLUMN target_number VARCHAR(30) NULL AFTER source_label, ADD COLUMN target_label VARCHAR(50) NULL AFTER target_number");
            }
        } catch (\Throwable $migErr) {
            // Ignore migration error
        }

        $insStmt = $db->prepare("
            INSERT INTO wa_cta_clicks (
                source_page, source_label, target_number, target_label, 
                ip_address, user_agent, browser, os, device_type, country, city, referrer
            ) VALUES (
                :source_page, :source_label, :target_number, :target_label,
                :ip, :ua, :browser, :os, :device, :country, :city, :referrer
            )
        ");
        $insStmt->execute([
            ':source_page'   => mb_substr($sourcePage, 0, 100),
            ':source_label'  => $sourceLabel ? mb_substr($sourceLabel, 0, 255) : null,
            ':target_number' => mb_substr($targetNumber, 0, 30),
            ':target_label'  => mb_substr($targetLabel, 0, 50),
            ':ip'            => $ip,
            ':ua'            => mb_substr($userAgent, 0, 500),
            ':browser'       => $browser,
            ':os'            => $os,
            ':device'        => $deviceType,
            ':country'       => $country,
            ':city'          => $city,
            ':referrer'      => mb_substr($referrer, 0, 500),
        ]);
    } catch (\Throwable $logErr) {
        error_log("WA Redirect Log Error: " . $logErr->getMessage());
    }
}

// ── Redirect Immediately to WhatsApp ─────────────────────────────────
// Build official WhatsApp direct link
$waUrl = "https://api.whatsapp.com/send?phone=" . $targetNumber . "&text=" . rawurlencode($text);

// Prevent browser/proxy caching so each request hits server logic
header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
header("Location: " . $waUrl, true, 302);
exit;
