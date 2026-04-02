<?php
/**
 * Track View API — Ateka Tehnik
 *
 * POST /api/track_view.php
 * Body: { "page_type": "post"|"product", "slug": "..." }
 *
 * Records a page view with full analytics:
 * IP, User-Agent parsing, Geo-location via ip-api.com
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('POST');

$input = getJsonInput();

$pageType = trim($input['page_type'] ?? '');
$slug = trim($input['slug'] ?? '');

if (!in_array($pageType, ['post', 'product'])) {
    jsonError(400, 'page_type must be "post" or "product".');
}
if (empty($slug)) {
    jsonError(400, 'slug is required.');
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

function parseUserAgent(string $ua): array {
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

$parsed = parseUserAgent($userAgent);
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
        INSERT INTO page_views (page_type, page_slug, ip_address, user_agent, browser, os, device_type, country, city, referrer)
        VALUES (:page_type, :slug, :ip, :ua, :browser, :os, :device, :country, :city, :referrer)
    ");
    $stmt->execute([
        ':page_type' => $pageType,
        ':slug'      => $slug,
        ':ip'        => $ip,
        ':ua'        => mb_substr($userAgent, 0, 500),
        ':browser'   => $browser,
        ':os'        => $os,
        ':device'    => $deviceType,
        ':country'   => $country,
        ':city'      => $city,
        ':referrer'  => mb_substr($referrer, 0, 500),
    ]);

    // Get total view count for this page
    $countStmt = $db->prepare("SELECT COUNT(*) FROM page_views WHERE page_type = :pt AND page_slug = :slug");
    $countStmt->execute([':pt' => $pageType, ':slug' => $slug]);
    $totalViews = (int) $countStmt->fetchColumn();

    jsonSuccess(['views' => $totalViews], 'View tracked successfully.');

} catch (\Exception $e) {
    jsonError(500, 'Failed to track view: ' . $e->getMessage());
}
