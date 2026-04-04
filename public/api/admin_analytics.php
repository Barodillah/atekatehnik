<?php
/**
 * Admin Analytics API — Ateka Tehnik
 *
 * GET /api/admin_analytics.php?type=post              — List all posts with view stats
 * GET /api/admin_analytics.php?type=product            — List all products with view stats
 * GET /api/admin_analytics.php?type=post&slug=X        — Detailed views for a specific page
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$db = getDB();

$type = $_GET['type'] ?? 'post';
if (!in_array($type, ['post', 'product'])) {
    jsonError(400, 'type must be "post" or "product".');
}

$slug = trim($_GET['slug'] ?? '');

// ── Detailed view for a specific page ────────────────────────────────
if ($slug) {
    // Individual views (last 200)
    $vStmt = $db->prepare("
        SELECT ip_address, browser, os, device_type, country, city, referrer, viewed_at
        FROM page_views
        WHERE page_type = :type AND page_slug = :slug
        ORDER BY viewed_at DESC
        LIMIT 200
    ");
    $vStmt->execute([':type' => $type, ':slug' => $slug]);
    $views = $vStmt->fetchAll();

    // Summary for this slug
    $totalStmt = $db->prepare("SELECT COUNT(*) FROM page_views WHERE page_type = :type AND page_slug = :slug");
    $totalStmt->execute([':type' => $type, ':slug' => $slug]);
    $total = (int) $totalStmt->fetchColumn();

    $uniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE page_type = :type AND page_slug = :slug");
    $uniqueStmt->execute([':type' => $type, ':slug' => $slug]);
    $uniqueIps = (int) $uniqueStmt->fetchColumn();

    $countryStmt = $db->prepare("SELECT country, COUNT(*) as count FROM page_views WHERE page_type = :type AND page_slug = :slug AND country != '' GROUP BY country ORDER BY count DESC LIMIT 10");
    $countryStmt->execute([':type' => $type, ':slug' => $slug]);
    $countries = $countryStmt->fetchAll();

    $browserStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM page_views WHERE page_type = :type AND page_slug = :slug AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 10");
    $browserStmt->execute([':type' => $type, ':slug' => $slug]);
    $browsers = $browserStmt->fetchAll();

    $cityStmt = $db->prepare("SELECT city, COUNT(*) as count FROM page_views WHERE page_type = :type AND page_slug = :slug AND city != '' GROUP BY city ORDER BY count DESC LIMIT 10");
    $cityStmt->execute([':type' => $type, ':slug' => $slug]);
    $cities = $cityStmt->fetchAll();

    jsonSuccess([
        'views'   => $views,
        'summary' => [
            'total'     => $total,
            'uniqueIps' => $uniqueIps,
            'countries' => $countries,
            'cities'    => $cities,
            'browsers'  => $browsers,
        ],
    ]);
}

// ── Overview: List all pages with view stats ─────────────────────────

// Pages grouped by slug, sorted by total views
$pagesStmt = $db->prepare("
    SELECT 
        page_slug as slug,
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address) as unique_ips,
        MAX(viewed_at) as last_view
    FROM page_views
    WHERE page_type = :type
    GROUP BY page_slug
    ORDER BY total_views DESC
");
$pagesStmt->execute([':type' => $type]);
$pages = $pagesStmt->fetchAll();

// Overall stats
$overallTotalStmt = $db->prepare("SELECT COUNT(*) FROM page_views WHERE page_type = :type");
$overallTotalStmt->execute([':type' => $type]);
$totalViews = (int) $overallTotalStmt->fetchColumn();

$overallUniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE page_type = :type");
$overallUniqueStmt->execute([':type' => $type]);
$uniqueIps = (int) $overallUniqueStmt->fetchColumn();

$topCountriesStmt = $db->prepare("SELECT country, COUNT(*) as count FROM page_views WHERE page_type = :type AND country != '' GROUP BY country ORDER BY count DESC LIMIT 5");
$topCountriesStmt->execute([':type' => $type]);
$topCountries = $topCountriesStmt->fetchAll();

$topBrowsersStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM page_views WHERE page_type = :type AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 5");
$topBrowsersStmt->execute([':type' => $type]);
$topBrowsers = $topBrowsersStmt->fetchAll();

$topDevicesStmt = $db->prepare("SELECT device_type, COUNT(*) as count FROM page_views WHERE page_type = :type AND device_type != '' GROUP BY device_type ORDER BY count DESC LIMIT 5");
$topDevicesStmt->execute([':type' => $type]);
$topDevices = $topDevicesStmt->fetchAll();

$topCitiesStmt = $db->prepare("SELECT city, COUNT(*) as count FROM page_views WHERE page_type = :type AND city != '' GROUP BY city ORDER BY count DESC LIMIT 5");
$topCitiesStmt->execute([':type' => $type]);
$topCities = $topCitiesStmt->fetchAll();

jsonSuccess([
    'pages'   => $pages,
    'overall' => [
        'totalViews'   => $totalViews,
        'uniqueIps'    => $uniqueIps,
        'topCountries' => $topCountries,
        'topCities'    => $topCities,
        'topBrowsers'  => $topBrowsers,
        'topDevices'   => $topDevices,
    ],
]);
