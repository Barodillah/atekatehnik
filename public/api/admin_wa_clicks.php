<?php
/**
 * Admin WA Clicks API — Ateka Tehnik
 *
 * GET /api/admin_wa_clicks.php
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$db = getDB();

$sourcePage = trim($_GET['source_page'] ?? '');
$cityFilter = trim($_GET['city'] ?? '');
$ipFilter = trim($_GET['ip'] ?? '');
$q = trim($_GET['q'] ?? '');

$baseWhere = "WHERE 1=1";
$params = [];

if ($cityFilter) {
    $baseWhere .= " AND city = :city";
    $params[':city'] = $cityFilter;
}

if ($ipFilter) {
    $baseWhere .= " AND ip_address = :ip";
    $params[':ip'] = $ipFilter;
}

if ($q) {
    $baseWhere .= " AND (ip_address LIKE :q1 OR city LIKE :q2 OR country LIKE :q3 OR source_page LIKE :q4 OR browser LIKE :q5 OR source_label LIKE :q6)";
    $params[':q1'] = "%$q%";
    $params[':q2'] = "%$q%";
    $params[':q3'] = "%$q%";
    $params[':q4'] = "%$q%";
    $params[':q5'] = "%$q%";
    $params[':q6'] = "%$q%";
}

// ── Detail view for a specific source page ───────────────────────────
if ($sourcePage) {
    $detailWhere = $baseWhere . " AND source_page = :sp";
    $detailParams = $params;
    $detailParams[':sp'] = $sourcePage;

    // Individual clicks (limit 200 based on search or 50)
    $limit = $q ? 200 : 50;
    $vStmt = $db->prepare("
        SELECT source_label, ip_address, browser, os, device_type, country, city, referrer, clicked_at
        FROM wa_cta_clicks
        $detailWhere
        ORDER BY clicked_at DESC
        LIMIT $limit
    ");
    $vStmt->execute($detailParams);
    $clicks = $vStmt->fetchAll();

    // Summary for this source page
    $totalStmt = $db->prepare("SELECT COUNT(*) FROM wa_cta_clicks $detailWhere");
    $totalStmt->execute($detailParams);
    $total = (int) $totalStmt->fetchColumn();

    $uniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM wa_cta_clicks $detailWhere");
    $uniqueStmt->execute($detailParams);
    $uniqueIps = (int) $uniqueStmt->fetchColumn();

    $cityStmt = $db->prepare("SELECT city, COUNT(*) as count FROM wa_cta_clicks $detailWhere AND city != '' GROUP BY city ORDER BY count DESC");
    $cityStmt->execute($detailParams);
    $cities = $cityStmt->fetchAll();

    $ipStmt = $db->prepare("SELECT ip_address, COUNT(*) as count FROM wa_cta_clicks $detailWhere GROUP BY ip_address ORDER BY count DESC");
    $ipStmt->execute($detailParams);
    $ips = $ipStmt->fetchAll();

    $browserStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM wa_cta_clicks $detailWhere AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 10");
    $browserStmt->execute($detailParams);
    $browsers = $browserStmt->fetchAll();

    $labelStmt = $db->prepare("SELECT source_label, COUNT(*) as count FROM wa_cta_clicks $detailWhere AND source_label IS NOT NULL AND source_label != '' GROUP BY source_label ORDER BY count DESC LIMIT 20");
    $labelStmt->execute($detailParams);
    $labels = $labelStmt->fetchAll();

    jsonSuccess([
        'clicks'  => $clicks,
        'summary' => [
            'total'     => $total,
            'uniqueIps' => $uniqueIps,
            'cities'    => $cities,
            'ips'       => $ips,
            'browsers'  => $browsers,
            'labels'    => $labels,
        ],
    ]);
}

// ── Overview ─────────────────────────────────────────────────────────

// Total clicks
$totalStmt = $db->prepare("SELECT COUNT(*) FROM wa_cta_clicks $baseWhere");
$totalStmt->execute($params);
$totalClicks = (int) $totalStmt->fetchColumn();

// Today's clicks
$todayStmt = $db->prepare("SELECT COUNT(*) FROM wa_cta_clicks $baseWhere AND DATE(clicked_at) = CURDATE()");
$todayStmt->execute($params);
$todayClicks = (int) $todayStmt->fetchColumn();

// Unique visitors (distinct IPs)
$uniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM wa_cta_clicks $baseWhere");
$uniqueStmt->execute($params);
$uniqueVisitors = (int) $uniqueStmt->fetchColumn();

// Clicks per source page
$sourceStmt = $db->prepare("
    SELECT source_page, COUNT(*) as total_clicks, COUNT(DISTINCT ip_address) as unique_ips, MAX(clicked_at) as last_click
    FROM wa_cta_clicks
    $baseWhere
    GROUP BY source_page
    ORDER BY total_clicks DESC
");
$sourceStmt->execute($params);
$sources = $sourceStmt->fetchAll();

// Top source page
$topSource = $sources[0]['source_page'] ?? '—';

// Top cities
$citiesStmt = $db->prepare("SELECT city, COUNT(*) as count FROM wa_cta_clicks $baseWhere AND city != '' GROUP BY city ORDER BY count DESC");
$citiesStmt->execute($params);
$topCities = $citiesStmt->fetchAll();

// Top IPs
$ipsStmt = $db->prepare("SELECT ip_address, COUNT(*) as count FROM wa_cta_clicks $baseWhere GROUP BY ip_address ORDER BY count DESC LIMIT 50");
$ipsStmt->execute($params);
$topIps = $ipsStmt->fetchAll();

// Top devices
$deviceStmt = $db->prepare("SELECT device_type, COUNT(*) as count FROM wa_cta_clicks $baseWhere AND device_type != '' GROUP BY device_type ORDER BY count DESC LIMIT 5");
$deviceStmt->execute($params);
$topDevices = $deviceStmt->fetchAll();

// Top browsers
$browserStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM wa_cta_clicks $baseWhere AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 5");
$browserStmt->execute($params);
$topBrowsers = $browserStmt->fetchAll();

// 7-day trend
$trendStmt = $db->prepare("
    SELECT DATE(clicked_at) as click_date, COUNT(*) as count
    FROM wa_cta_clicks
    $baseWhere AND clicked_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(clicked_at)
    ORDER BY click_date ASC
");
$trendStmt->execute($params);
$trendRaw = $trendStmt->fetchAll();

// Fill in missing days with 0
$trend = [];
for ($i = 6; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-{$i} days"));
    $found = false;
    foreach ($trendRaw as $row) {
        if ($row['click_date'] === $date) {
            $trend[] = ['date' => $date, 'count' => (int)$row['count']];
            $found = true;
            break;
        }
    }
    if (!$found) {
        $trend[] = ['date' => $date, 'count' => 0];
    }
}

// Recent clicks
$limit = $q ? 200 : 50;
$recentStmt = $db->prepare("
    SELECT source_page, source_label, ip_address, browser, os, device_type, country, city, clicked_at
    FROM wa_cta_clicks
    $baseWhere
    ORDER BY clicked_at DESC
    LIMIT $limit
");
$recentStmt->execute($params);
$recentClicks = $recentStmt->fetchAll();

jsonSuccess([
    'totalClicks'    => $totalClicks,
    'todayClicks'    => $todayClicks,
    'uniqueVisitors' => $uniqueVisitors,
    'topSource'      => $topSource,
    'sources'        => $sources,
    'topCities'      => $topCities,
    'topIps'         => $topIps,
    'topDevices'     => $topDevices,
    'topBrowsers'    => $topBrowsers,
    'trend'          => $trend,
    'recentClicks'   => $recentClicks,
]);
