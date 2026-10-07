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
if (!in_array($type, ['post', 'product', 'gallery'])) {
    jsonError(400, 'type must be "post", "product", or "gallery".');
}

$slug = trim($_GET['slug'] ?? '');

// ── Detailed view for a specific page ────────────────────────────────
if ($slug) {
    $q = trim($_GET['q'] ?? '');
    
    $detailWhere = "WHERE page_type = :type AND page_slug = :slug";
    $detailParams = [':type' => $type, ':slug' => $slug];
    
    if ($q) {
        $detailWhere .= " AND (ip_address LIKE :dq1 OR city LIKE :dq2 OR country LIKE :dq3 OR browser LIKE :dq4)";
        $detailParams[':dq1'] = "%$q%";
        $detailParams[':dq2'] = "%$q%";
        $detailParams[':dq3'] = "%$q%";
        $detailParams[':dq4'] = "%$q%";
    }

    // Individual views (last 200)
    $vStmt = $db->prepare("
        SELECT ip_address, browser, os, device_type, country, city, referrer, viewed_at
        FROM page_views
        $detailWhere
        ORDER BY viewed_at DESC
        LIMIT 200
    ");
    $vStmt->execute($detailParams);
    $views = $vStmt->fetchAll();

    // Summary for this slug
    $totalStmt = $db->prepare("SELECT COUNT(*) FROM page_views $detailWhere");
    $totalStmt->execute($detailParams);
    $total = (int) $totalStmt->fetchColumn();

    $uniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM page_views $detailWhere");
    $uniqueStmt->execute($detailParams);
    $uniqueIps = (int) $uniqueStmt->fetchColumn();

    $countryStmt = $db->prepare("SELECT country, COUNT(*) as count FROM page_views $detailWhere AND country != '' GROUP BY country ORDER BY count DESC LIMIT 10");
    $countryStmt->execute($detailParams);
    $countries = $countryStmt->fetchAll();

    $browserStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM page_views $detailWhere AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 10");
    $browserStmt->execute($detailParams);
    $browsers = $browserStmt->fetchAll();

    $cityStmt = $db->prepare("SELECT city, COUNT(*) as count FROM page_views $detailWhere AND city != '' GROUP BY city ORDER BY count DESC");
    $cityStmt->execute($detailParams);
    $cities = $cityStmt->fetchAll();

    $ipStmt = $db->prepare("SELECT ip_address, COUNT(*) as count FROM page_views $detailWhere GROUP BY ip_address ORDER BY count DESC");
    $ipStmt->execute($detailParams);
    $ips = $ipStmt->fetchAll();

    jsonSuccess([
        'views'   => $views,
        'summary' => [
            'total'     => $total,
            'uniqueIps' => $uniqueIps,
            'countries' => $countries,
            'cities'    => $cities,
            'browsers'  => $browsers,
            'ips'       => $ips,
        ],
    ]);
}

// ── Overview: List all pages with view stats ─────────────────────────

$cityFilter = trim($_GET['city'] ?? '');
$ipFilter = trim($_GET['ip'] ?? '');
$q = trim($_GET['q'] ?? '');

$whereClause = "WHERE page_type = :type";
$params = [':type' => $type];

if ($cityFilter) {
    $whereClause .= " AND city = :city";
    $params[':city'] = $cityFilter;
}

if ($ipFilter) {
    $whereClause .= " AND ip_address = :ip";
    $params[':ip'] = $ipFilter;
}

if ($q) {
    $whereClause .= " AND (ip_address LIKE :q1 OR city LIKE :q2 OR country LIKE :q3 OR page_slug LIKE :q4 OR browser LIKE :q5)";
    $params[':q1'] = "%$q%";
    $params[':q2'] = "%$q%";
    $params[':q3'] = "%$q%";
    $params[':q4'] = "%$q%";
    $params[':q5'] = "%$q%";
}

// Pages grouped by slug, sorted by total views
$pagesStmt = $db->prepare("
    SELECT 
        page_slug as slug,
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address) as unique_ips,
        MAX(viewed_at) as last_view
    FROM page_views
    $whereClause
    GROUP BY page_slug
    ORDER BY total_views DESC
");
$pagesStmt->execute($params);
$pages = $pagesStmt->fetchAll();

// Overall stats
$overallTotalStmt = $db->prepare("SELECT COUNT(*) FROM page_views $whereClause");
$overallTotalStmt->execute($params);
$totalViews = (int) $overallTotalStmt->fetchColumn();

$overallUniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM page_views $whereClause");
$overallUniqueStmt->execute($params);
$uniqueIps = (int) $overallUniqueStmt->fetchColumn();

$topCountriesStmt = $db->prepare("SELECT country, COUNT(*) as count FROM page_views $whereClause AND country != '' GROUP BY country ORDER BY count DESC LIMIT 5");
$topCountriesStmt->execute($params);
$topCountries = $topCountriesStmt->fetchAll();

$topBrowsersStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM page_views $whereClause AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 5");
$topBrowsersStmt->execute($params);
$topBrowsers = $topBrowsersStmt->fetchAll();

$topDevicesStmt = $db->prepare("SELECT device_type, COUNT(*) as count FROM page_views $whereClause AND device_type != '' GROUP BY device_type ORDER BY count DESC LIMIT 5");
$topDevicesStmt->execute($params);
$topDevices = $topDevicesStmt->fetchAll();

$topCitiesStmt = $db->prepare("SELECT city, COUNT(*) as count FROM page_views $whereClause AND city != '' GROUP BY city ORDER BY count DESC");
$topCitiesStmt->execute($params);
$topCities = $topCitiesStmt->fetchAll();

$topIpsStmt = $db->prepare("SELECT ip_address, COUNT(*) as count FROM page_views $whereClause GROUP BY ip_address ORDER BY count DESC LIMIT 50");
$topIpsStmt->execute($params);
$topIps = $topIpsStmt->fetchAll();

$limit = $q ? 200 : 20;
$latestViewsStmt = $db->prepare("
    SELECT ip_address, browser, os, device_type, country, city, referrer, viewed_at, page_slug
    FROM page_views 
    $whereClause 
    ORDER BY viewed_at DESC 
    LIMIT $limit
");
$latestViewsStmt->execute($params);
$latestViews = $latestViewsStmt->fetchAll();

jsonSuccess([
    'pages'   => $pages,
    'overall' => [
        'totalViews'   => $totalViews,
        'uniqueIps'    => $uniqueIps,
        'topCountries' => $topCountries,
        'topCities'    => $topCities,
        'topBrowsers'  => $topBrowsers,
        'topDevices'   => $topDevices,
        'topIps'       => $topIps,
        'latestViews'  => $latestViews,
    ],
]);
