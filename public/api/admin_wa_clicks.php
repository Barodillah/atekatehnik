<?php
/**
 * Admin WA Clicks API — Ateka Tehnik
 *
 * GET /api/admin_wa_clicks.php                — Overview: totals, per-source breakdown, trend, recent clicks
 * GET /api/admin_wa_clicks.php?source_page=X  — Detail for a specific source page
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$db = getDB();

$sourcePage = trim($_GET['source_page'] ?? '');

// ── Detail view for a specific source page ───────────────────────────
if ($sourcePage) {
    // Individual clicks (last 200)
    $vStmt = $db->prepare("
        SELECT source_label, ip_address, browser, os, device_type, country, city, referrer, clicked_at
        FROM wa_cta_clicks
        WHERE source_page = :sp
        ORDER BY clicked_at DESC
        LIMIT 200
    ");
    $vStmt->execute([':sp' => $sourcePage]);
    $clicks = $vStmt->fetchAll();

    // Summary for this source page
    $totalStmt = $db->prepare("SELECT COUNT(*) FROM wa_cta_clicks WHERE source_page = :sp");
    $totalStmt->execute([':sp' => $sourcePage]);
    $total = (int) $totalStmt->fetchColumn();

    $uniqueStmt = $db->prepare("SELECT COUNT(DISTINCT ip_address) FROM wa_cta_clicks WHERE source_page = :sp");
    $uniqueStmt->execute([':sp' => $sourcePage]);
    $uniqueIps = (int) $uniqueStmt->fetchColumn();

    $cityStmt = $db->prepare("SELECT city, COUNT(*) as count FROM wa_cta_clicks WHERE source_page = :sp AND city != '' GROUP BY city ORDER BY count DESC LIMIT 10");
    $cityStmt->execute([':sp' => $sourcePage]);
    $cities = $cityStmt->fetchAll();

    $browserStmt = $db->prepare("SELECT browser, COUNT(*) as count FROM wa_cta_clicks WHERE source_page = :sp AND browser != '' GROUP BY browser ORDER BY count DESC LIMIT 10");
    $browserStmt->execute([':sp' => $sourcePage]);
    $browsers = $browserStmt->fetchAll();

    $labelStmt = $db->prepare("SELECT source_label, COUNT(*) as count FROM wa_cta_clicks WHERE source_page = :sp AND source_label IS NOT NULL AND source_label != '' GROUP BY source_label ORDER BY count DESC LIMIT 20");
    $labelStmt->execute([':sp' => $sourcePage]);
    $labels = $labelStmt->fetchAll();

    jsonSuccess([
        'clicks'  => $clicks,
        'summary' => [
            'total'     => $total,
            'uniqueIps' => $uniqueIps,
            'cities'    => $cities,
            'browsers'  => $browsers,
            'labels'    => $labels,
        ],
    ]);
}

// ── Overview ─────────────────────────────────────────────────────────

// Total clicks
$totalStmt = $db->query("SELECT COUNT(*) FROM wa_cta_clicks");
$totalClicks = (int) $totalStmt->fetchColumn();

// Today's clicks
$todayStmt = $db->query("SELECT COUNT(*) FROM wa_cta_clicks WHERE DATE(clicked_at) = CURDATE()");
$todayClicks = (int) $todayStmt->fetchColumn();

// Unique visitors (distinct IPs)
$uniqueStmt = $db->query("SELECT COUNT(DISTINCT ip_address) FROM wa_cta_clicks");
$uniqueVisitors = (int) $uniqueStmt->fetchColumn();

// Clicks per source page
$sourceStmt = $db->query("
    SELECT source_page, COUNT(*) as total_clicks, COUNT(DISTINCT ip_address) as unique_ips, MAX(clicked_at) as last_click
    FROM wa_cta_clicks
    GROUP BY source_page
    ORDER BY total_clicks DESC
");
$sources = $sourceStmt->fetchAll();

// Top source page
$topSource = $sources[0]['source_page'] ?? '—';

// Top cities
$citiesStmt = $db->query("SELECT city, COUNT(*) as count FROM wa_cta_clicks WHERE city != '' GROUP BY city ORDER BY count DESC LIMIT 5");
$topCities = $citiesStmt->fetchAll();

// Top devices
$deviceStmt = $db->query("SELECT device_type, COUNT(*) as count FROM wa_cta_clicks WHERE device_type != '' GROUP BY device_type ORDER BY count DESC LIMIT 5");
$topDevices = $deviceStmt->fetchAll();

// Top browsers
$browserStmt = $db->query("SELECT browser, COUNT(*) as count FROM wa_cta_clicks WHERE browser != '' GROUP BY browser ORDER BY count DESC LIMIT 5");
$topBrowsers = $browserStmt->fetchAll();

// 7-day trend
$trendStmt = $db->query("
    SELECT DATE(clicked_at) as click_date, COUNT(*) as count
    FROM wa_cta_clicks
    WHERE clicked_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(clicked_at)
    ORDER BY click_date ASC
");
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

// Recent clicks (last 50)
$recentStmt = $db->query("
    SELECT source_page, source_label, ip_address, browser, os, device_type, country, city, clicked_at
    FROM wa_cta_clicks
    ORDER BY clicked_at DESC
    LIMIT 50
");
$recentClicks = $recentStmt->fetchAll();

jsonSuccess([
    'totalClicks'    => $totalClicks,
    'todayClicks'    => $todayClicks,
    'uniqueVisitors' => $uniqueVisitors,
    'topSource'      => $topSource,
    'sources'        => $sources,
    'topCities'      => $topCities,
    'topDevices'     => $topDevices,
    'topBrowsers'    => $topBrowsers,
    'trend'          => $trend,
    'recentClicks'   => $recentClicks,
]);
