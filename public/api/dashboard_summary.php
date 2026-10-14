<?php
/**
 * Dashboard Summary API — Ateka Tehnik
 *
 * GET /api/dashboard_summary.php
 * Returns high-level KPIs, recent activity, and chart data for the Admin Dashboard Home.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$user = requireAuth();
$db = getDB();

// ── 1. Key Performance Indicators (KPIs) ─────────────────────────────

// Total Leads
$leadsTotalStmt = $db->query("SELECT COUNT(*) FROM leads");
$totalLeads = (int) $leadsTotalStmt->fetchColumn();

// New Leads
$leadsNewStmt = $db->query("SELECT COUNT(*) FROM leads WHERE status = 'New'");
$newLeads = (int) $leadsNewStmt->fetchColumn();

// Total Products
$productsTotalStmt = $db->query("SELECT COUNT(*) FROM products");
$totalProducts = (int) $productsTotalStmt->fetchColumn();

// Product Video/Page Views
$productViewsStmt = $db->query("SELECT COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ips FROM page_views WHERE page_type = 'product'");
$productViewsData = $productViewsStmt->fetch();
$productViews = (int) ($productViewsData['total'] ?? 0);
$productUniqueIps = (int) ($productViewsData['unique_ips'] ?? 0);

// Total Posts
$postsTotalStmt = $db->query("SELECT COUNT(*) FROM posts");
$totalPosts = (int) $postsTotalStmt->fetchColumn();

// Post Views
$postViewsStmt = $db->query("SELECT COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ips FROM page_views WHERE page_type = 'post'");
$postViewsData = $postViewsStmt->fetch();
$postViews = (int) ($postViewsData['total'] ?? 0);
$postUniqueIps = (int) ($postViewsData['unique_ips'] ?? 0);

// Total WA Clicks
$waClicksStmt = $db->query("SELECT COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ips FROM wa_cta_clicks");
$waClicksData = $waClicksStmt->fetch();
$totalWaClicks = (int) ($waClicksData['total'] ?? 0);
$waUniqueIps = (int) ($waClicksData['unique_ips'] ?? 0);

// Total Views (Overall)
$viewsTotalStmt = $db->query("SELECT COUNT(*) FROM page_views");
$totalViews = (int) $viewsTotalStmt->fetchColumn();

// Total Comments (Overall)
$commentsTotalStmt = $db->query("SELECT COUNT(*) FROM post_comments");
$totalComments = (int) $commentsTotalStmt->fetchColumn();

// ── 2. Chart Data: Dual Metric (Page Views & WA Clicks) Cumulative ────────

$range = trim($_GET['range'] ?? '7');
if ($range === '14') {
    $numDays = 14;
} elseif ($range === '30') {
    $numDays = 30;
} elseif ($range === 'month') {
    $numDays = max(1, (int)date('j')); // Dari tgl 1 bulan ini s/d hari ini
} else {
    $range = '7';
    $numDays = 7;
}

$dateMap = [];
for ($i = $numDays - 1; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-{$i} days"));
    $dateMap[$d] = [
        'views' => 0,
        'wa_clicks' => 0,
    ];
}
$startDate = array_key_first($dateMap);

// Query page views dari ketiga page_type: post, product, gallery
$vStmt = $db->prepare("
    SELECT DATE(viewed_at) as d, COUNT(*) as c
    FROM page_views
    WHERE page_type IN ('post', 'product', 'gallery')
      AND viewed_at >= :start
    GROUP BY d
");
$vStmt->execute([':start' => $startDate . ' 00:00:00']);
foreach ($vStmt->fetchAll() as $row) {
    if (isset($dateMap[$row['d']])) {
        $dateMap[$row['d']]['views'] = (int)$row['c'];
    }
}

// Query WhatsApp CTA clicks
$wStmt = $db->prepare("
    SELECT DATE(clicked_at) as d, COUNT(*) as c
    FROM wa_cta_clicks
    WHERE clicked_at >= :start
    GROUP BY d
");
$wStmt->execute([':start' => $startDate . ' 00:00:00']);
foreach ($wStmt->fetchAll() as $row) {
    if (isset($dateMap[$row['d']])) {
        $dateMap[$row['d']]['wa_clicks'] = (int)$row['c'];
    }
}

// Akumulasi total keseluruhan (Running Cumulative Total)
$cumViews = 0;
$cumWa = 0;
$chartArray = [];
foreach ($dateMap as $dateStr => $data) {
    $cumViews += $data['views'];
    $cumWa += $data['wa_clicks'];
    $chartArray[] = [
        'date' => $dateStr,
        'day' => date('D', strtotime($dateStr)),
        'day_num' => date('j', strtotime($dateStr)),
        'label' => date('d M', strtotime($dateStr)),
        'views' => $data['views'],
        'views_cumulative' => $cumViews,
        'wa_clicks' => $data['wa_clicks'],
        'wa_cumulative' => $cumWa,
        'total' => $cumViews,
    ];
}

// ── 3. Recent Activity ────────────────────────────────────────────────
$activityStmt = $db->query("
    SELECT action, entity_type, details, created_at
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 10
");
$recentActivity = $activityStmt->fetchAll();

// ── 4. Featured Product Overview ──────────────────────────────────────
$latestProductStmt = $db->query("SELECT p.nama, p.kategori, p.gambar, (SELECT COUNT(*) FROM page_views pv WHERE pv.page_slug = p.slug AND pv.page_type = 'product') as views FROM products p ORDER BY p.id DESC LIMIT 1");
$featuredProduct = $latestProductStmt->fetch();

// ── 5. Featured Post Overview ──────────────────────────────────────
$latestPostStmt = $db->query("SELECT p.title, p.category, p.cover_image, p.slug, 
    (SELECT COUNT(*) FROM page_views pv WHERE pv.page_slug = p.slug AND pv.page_type = 'post') as views,
    (SELECT COUNT(*) FROM post_likes l WHERE l.post_slug = p.slug) as likes,
    (SELECT COUNT(*) FROM post_comments c WHERE c.post_slug = p.slug) as comments
    FROM posts p ORDER BY p.id DESC LIMIT 1");
$featuredPost = $latestPostStmt->fetch();

// ── 6. Geographic Stats (Country & City) ────────────────────────────────
$geoDataStmt = $db->query("
    SELECT country, city, COUNT(*) as count
    FROM page_views
    WHERE country IS NOT NULL AND country != ''
    GROUP BY country, city
    ORDER BY count DESC
");
$geoDataRaw = $geoDataStmt->fetchAll();

$countryMap = [];
foreach ($geoDataRaw as $row) {
    $country = trim($row['country']);
    $city = trim($row['city']) ?: 'Unknown';
    $count = (int)$row['count'];
    
    if (!isset($countryMap[$country])) {
        $countryMap[$country] = [
            'country' => $country,
            'total' => 0,
            'cities' => []
        ];
    }
    
    $countryMap[$country]['total'] += $count;
    $countryMap[$country]['cities'][] = [
        'city' => $city,
        'count' => $count
    ];
}

// Convert to array and sort by total descending
$geographicStats = array_values($countryMap);
usort($geographicStats, function($a, $b) {
    return $b['total'] - $a['total'];
});

jsonSuccess([
    'kpis' => [
        'totalLeads' => $totalLeads,
        'newLeads' => $newLeads,
        'totalProducts' => $totalProducts,
        'productViews' => $productViews,
        'productUniqueIps' => $productUniqueIps,
        'totalPosts' => $totalPosts,
        'postViews' => $postViews,
        'postUniqueIps' => $postUniqueIps,
        'totalWaClicks' => $totalWaClicks,
        'waUniqueIps' => $waUniqueIps,
        'totalViews' => $totalViews,
        'totalComments' => $totalComments,
    ],
    'viewChart' => $chartArray,
    'chartSummary' => [
        'range' => $range,
        'days' => $numDays,
        'periodTotalViews' => $cumViews,
        'periodTotalWaClicks' => $cumWa,
    ],
    'recentActivity' => $recentActivity,
    'featuredProduct' => $featuredProduct,
    'featuredPost' => $featuredPost,
    'geographicStats' => $geographicStats
]);
