<?php
/**
 * Track WA Click API — Ateka Tehnik
 *
 * POST /api/track_wa_click.php
 * Body: { "source_page": "product-detail", "source_label": "RMU 2 Ton" }
 *
 * Records a WhatsApp CTA click with full analytics:
 * IP, User-Agent parsing, Geo-location via ip-api.com
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('POST');

$input = getJsonInput();

$sourcePage = trim($input['source_page'] ?? '');
$sourceLabel = trim($input['source_label'] ?? '');

if (empty($sourcePage)) {
    jsonError(400, 'source_page is required.');
}

$db = getDB();

// ── Gather Analytics Data ────────────────────────────────────────────

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
// Take first IP if multiple (proxy chain)
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

// ── Geo-Location via ip-api.com (free, no key needed) ────────────────

$country = '';
$city = '';

// Only lookup for non-local IPs
if (!in_array($ip, ['127.0.0.1', '::1', 'unknown', 'localhost'])) {
    $geoUrl = "http://ip-api.com/json/{$ip}?fields=status,country,city";
    $ctx = stream_context_create(['http' => ['timeout' => 3]]); // 3 second timeout
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

// ── Insert into Database ─────────────────────────────────────────────

try {
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

    jsonSuccess([], 'Click tracked successfully.');

} catch (\Exception $e) {
    jsonError(500, 'Failed to track click: ' . $e->getMessage());
}
