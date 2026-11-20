<?php
/**
 * Track WA Click API — Ateka Tehnik
 *
 * GET  /api/track_wa_click.php?action=get_next
 * POST /api/track_wa_click.php
 * Body: { "source_page": "product-detail", "source_label": "RMU 2 Ton", "target_number": "...", "target_label": "..." }
 *
 * Records a WhatsApp CTA click with full analytics:
 * IP, User-Agent parsing, Geo-location via ip-api.com, target CS resolution.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

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

function resolveNextCs(PDO $db, array $csList): array {
    try {
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
                return ['next' => $csList['barron'], 'last_label' => 'Rani'];
            } else {
                return ['next' => $csList['rani'], 'last_label' => 'Barron'];
            }
        }
    } catch (\Throwable $e) {
        error_log("Resolve next CS error: " . $e->getMessage());
    }

    return ['next' => $csList['rani'], 'last_label' => null];
}

// ── GET Method: Query Next Rotated Contact ──────────────────────────
if ($method === 'GET') {
    $db = getDB();
    $result = resolveNextCs($db, $csList);
    jsonSuccess([
        'next'       => $result['next'],
        'last_label' => $result['last_label'],
        'contacts'   => array_values($csList),
    ], 'Current rotation status retrieved.');
}

// ── POST Method: Record WhatsApp Click ──────────────────────────────
requireMethod('POST');

$input = getJsonInput();

$sourcePage   = trim($input['source_page'] ?? '');
$sourceLabel  = trim($input['source_label'] ?? '');
$targetNumber = trim($input['target_number'] ?? '');
$targetLabel  = trim($input['target_label'] ?? '');

if (empty($sourcePage)) {
    jsonError(400, 'source_page is required.');
}

$db = getDB();

// If target is not provided or set to 'auto', determine next CS from database
if (empty($targetLabel) || $targetLabel === 'auto') {
    $rotation = resolveNextCs($db, $csList);
    $targetNumber = $rotation['next']['number'];
    $targetLabel  = $rotation['next']['name'];
}

// ── Gather Analytics Data ────────────────────────────────────────────

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$referrer = $_SERVER['HTTP_REFERER'] ?? '';

// ── Parse User-Agent ─────────────────────────────────────────────────

function parseWaClickUserAgent(string $ua): array {
    $browser = 'Unknown';
    $os = 'Unknown';
    $deviceType = 'Desktop';

    // Browser detection
    if (preg_match('/Edg\//i', $ua))          $browser = 'Edge';
    elseif (preg_match('/OPR|Opera/i', $ua))  $browser = 'Opera';
    elseif (preg_match('/Chrome/i', $ua))     $browser = 'Chrome';
    elseif (preg_match('/Firefox/i', $ua))    $browser = 'Firefox';
    elseif (preg_match('/Safari/i', $ua) && !preg_match('/Chrome/i', $ua)) $browser = 'Safari';
    elseif (preg_match('/MSIE|Trident/i', $ua)) $browser = 'Internet Explorer';

    // OS detection
    if (preg_match('/Windows/i', $ua))        $os = 'Windows';
    elseif (preg_match('/Macintosh/i', $ua))  $os = 'macOS';
    elseif (preg_match('/Linux/i', $ua))      $os = 'Linux';
    elseif (preg_match('/Android/i', $ua))    $os = 'Android';
    elseif (preg_match('/iPhone|iPad/i', $ua)) $os = 'iOS';

    // Device type detection
    if (preg_match('/Mobi|Android.*Mobile/i', $ua)) {
        $deviceType = 'Mobile';
    } elseif (preg_match('/Tablet|iPad/i', $ua)) {
        $deviceType = 'Tablet';
    }

    return compact('browser', 'os', 'deviceType');
}

$parsed = parseWaClickUserAgent($userAgent);
$browser = $parsed['browser'];
$os = $parsed['os'];
$deviceType = $parsed['deviceType'];

// ── Geo-Location via ip-api.com ──────────────────────────────────────

$country = '';
$city = '';

if (!in_array($ip, ['127.0.0.1', '::1', 'unknown', 'localhost'])) {
    $geoUrl = "http://ip-api.com/json/{$ip}?fields=status,country,city";
    $ctx = stream_context_create(['http' => ['timeout' => 2]]);
    $geoResponse = @file_get_contents($geoUrl, false, $ctx);

    if ($geoResponse) {
        $geoData = json_decode($geoResponse, true);
        if (($geoData['status'] ?? '') === 'success') {
            $country = $geoData['country'] ?? '';
            $city = $geoData['city'] ?? '';
        }
    }
} else {
    $country = 'Local';
    $city = 'Localhost';
}

// ── Auto-Migration & Insert into Database ───────────────────────────

try {
    // Ensure target_number & target_label exist
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM wa_cta_clicks LIKE 'target_number'")->fetch();
        if (!$colCheck) {
            $db->exec("ALTER TABLE wa_cta_clicks ADD COLUMN target_number VARCHAR(30) NULL AFTER source_label, ADD COLUMN target_label VARCHAR(50) NULL AFTER target_number");
        }
    } catch (\Throwable $mE) {
        // Continue even if schema check fails
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO wa_cta_clicks (source_page, source_label, target_number, target_label, ip_address, user_agent, browser, os, device_type, country, city, referrer)
            VALUES (:source_page, :source_label, :target_number, :target_label, :ip, :ua, :browser, :os, :device, :country, :city, :referrer)
        ");
        $stmt->execute([
            ':source_page'    => mb_substr($sourcePage, 0, 100),
            ':source_label'   => $sourceLabel ? mb_substr($sourceLabel, 0, 255) : null,
            ':target_number'  => $targetNumber ? mb_substr($targetNumber, 0, 30) : null,
            ':target_label'   => $targetLabel ? mb_substr($targetLabel, 0, 50) : null,
            ':ip'             => $ip,
            ':ua'             => mb_substr($userAgent, 0, 500),
            ':browser'        => $browser,
            ':os'             => $os,
            ':device'         => $deviceType,
            ':country'        => $country,
            ':city'           => $city,
            ':referrer'       => mb_substr($referrer, 0, 500),
        ]);
    } catch (\Throwable $insertErr) {
        // Fallback for backward compatibility if columns somehow don't exist
        $stmt = $db->prepare("
            INSERT INTO wa_cta_clicks (source_page, source_label, ip_address, user_agent, browser, os, device_type, country, city, referrer)
            VALUES (:source_page, :source_label, :ip, :ua, :browser, :os, :device, :country, :city, :referrer)
        ");
        $stmt->execute([
            ':source_page'  => mb_substr($sourcePage, 0, 100),
            ':source_label' => $sourceLabel ? mb_substr($sourceLabel, 0, 255) : null,
            ':ip'           => $ip,
            ':ua'           => mb_substr($userAgent, 0, 500),
            ':browser'      => $browser,
            ':os'           => $os,
            ':device'       => $deviceType,
            ':country'      => $country,
            ':city'         => $city,
            ':referrer'     => mb_substr($referrer, 0, 500),
        ]);
    }

    jsonSuccess([
        'target_number' => $targetNumber,
        'target_label'  => $targetLabel
    ], 'Click tracked successfully.');

} catch (\Exception $e) {
    jsonError(500, 'Failed to track click: ' . $e->getMessage());
}
