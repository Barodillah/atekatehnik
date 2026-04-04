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

// Total Page Views (Engagement)
$viewsTotalStmt = $db->query("SELECT COUNT(*) FROM page_views");
$totalViews = (int) $viewsTotalStmt->fetchColumn();

// Total Comments (Engagement)
$commentsTotalStmt = $db->query("SELECT COUNT(*) FROM post_comments");
$totalComments = (int) $commentsTotalStmt->fetchColumn();

// ── 2. Chart Data: Page Views (Last 7 Days) ────────

$days = [];
$chartData = [];
for ($i = 6; $i >= 0; $i--) {
    $dayLabel = date('D', strtotime("-{$i} days")); // Mon, Tue
    $dayDate = date('Y-m-d', strtotime("-{$i} days"));
    $days[$dayDate] = $dayLabel;
    $chartData[$dayLabel] = ['views' => 0];
}

// Group page views by day
$viewsChartStmt = $db->query("
    SELECT DATE(viewed_at) as view_date, COUNT(*) as count 
    FROM page_views 
    WHERE viewed_at >= DATE_SUB(DATE(NOW()), INTERVAL 6 DAY)
    GROUP BY view_date
");
$viewsChartRaw = $viewsChartStmt->fetchAll();

foreach ($viewsChartRaw as $row) {
    if (isset($days[$row['view_date']])) {
        $label = $days[$row['view_date']];
        $chartData[$label]['views'] += (int) $row['count'];
    }
}

// Convert back to sequential array for JSON
$chartArray = [];
foreach ($chartData as $label => $data) {
    $chartArray[] = [
        'day' => $label,
        'views' => $data['views'],
        'total' => $data['views'],
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
$latestProductStmt = $db->query("SELECT p.nama, p.kategori, (SELECT COUNT(*) FROM page_views pv WHERE pv.page_slug = p.slug AND pv.page_type = 'product') as views FROM products p ORDER BY p.id DESC LIMIT 1");
$featuredProduct = $latestProductStmt->fetch();

jsonSuccess([
    'kpis' => [
        'totalLeads' => $totalLeads,
        'newLeads' => $newLeads,
        'totalProducts' => $totalProducts,
        'totalViews' => $totalViews,
        'totalComments' => $totalComments,
    ],
    'viewChart' => $chartArray,
    'recentActivity' => $recentActivity,
    'featuredProduct' => $featuredProduct
]);
