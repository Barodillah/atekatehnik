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

// Total Products
$productsTotalStmt = $db->query("SELECT COUNT(*) FROM products");
$totalProducts = (int) $productsTotalStmt->fetchColumn();

// Total Page Views (Engagement)
$viewsTotalStmt = $db->query("SELECT COUNT(*) FROM page_views");
$totalViews = (int) $viewsTotalStmt->fetchColumn();

// Total Comments (Engagement)
$commentsTotalStmt = $db->query("SELECT COUNT(*) FROM post_comments");
$totalComments = (int) $commentsTotalStmt->fetchColumn();

// ── 2. Chart Data: Monthly Lead Acquisition (Last 6 Months) ────────

$months = [];
$chartData = [];
// Generate last 6 months list (e.g. ['Jan', 'Feb', 'Mar'...])
for ($i = 5; $i >= 0; $i--) {
    $monthLabel = date('M', strtotime("-{$i} months"));
    $monthNum = date('Y-m', strtotime("-{$i} months"));
    $months[$monthNum] = $monthLabel;
    $chartData[$monthLabel] = ['qualified' => 0, 'raw' => 0]; // Default 0
}

// Group leads by month
$leadsChartStmt = $db->query("
    SELECT DATE_FORMAT(created_at, '%Y-%m') as month, status, COUNT(*) as count 
    FROM leads 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY month, status
");
$leadsChartRaw = $leadsChartStmt->fetchAll();

foreach ($leadsChartRaw as $row) {
    if (isset($months[$row['month']])) {
        $label = $months[$row['month']];
        // Suppose 'new' and 'contacted' is Raw, 'qualified' and 'converted' is Qualified
        if (in_array($row['status'], ['qualified', 'converted'])) {
            $chartData[$label]['qualified'] += (int) $row['count'];
        } else {
            $chartData[$label]['raw'] += (int) $row['count'];
        }
    }
}

// Convert back to sequential array for JSON
$chartArray = [];
foreach ($chartData as $label => $data) {
    $chartArray[] = [
        'month' => $label,
        'qualified' => $data['qualified'],
        'raw' => $data['raw'],
        'total' => $data['qualified'] + $data['raw']
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
        'totalProducts' => $totalProducts,
        'totalViews' => $totalViews,
        'totalComments' => $totalComments,
    ],
    'leadChart' => $chartArray,
    'recentActivity' => $recentActivity,
    'featuredProduct' => $featuredProduct
]);
