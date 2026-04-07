<?php
/**
 * GET /api/get_location.php
 * Returns the client's city and country based on their IP address.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
// Take first IP if multiple (proxy chain)
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

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

jsonSuccess(['city' => $city, 'country' => $country], 'Location fetched successfully.');
