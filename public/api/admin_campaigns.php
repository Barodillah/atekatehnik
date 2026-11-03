<?php
/**
 * Dedicated Campaign & UTM Analytics API — Ateka Tehnik
 *
 * GET /api/admin_campaigns.php
 * Query Params:
 *   - dimension: 'campaign' (default) | 'source_medium' | 'platform' | 'creative_format' | 'tactic' | 'content' | 'term'
 *   - date_range: 'all' | 'today' | '7d' | '30d' | 'this_month'
 *   - campaign: string (drilldown to specific campaign)
 *   - q: string (search keyword)
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$db = getDB();

$dimension = trim($_GET['dimension'] ?? 'campaign');
$dateRange = trim($_GET['date_range'] ?? '30d');
$campaignFilter = trim($_GET['campaign'] ?? '');
$q = trim($_GET['q'] ?? '');

// ── Date Range Clause ────────────────────────────────────────────────
$whereConditions = ["1=1"];
$params = [];

if ($dateRange === 'today') {
    $whereConditions[] = "DATE(pv.viewed_at) = CURDATE()";
} elseif ($dateRange === '7d') {
    $whereConditions[] = "pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
} elseif ($dateRange === '30d') {
    $whereConditions[] = "pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
} elseif ($dateRange === 'this_month') {
    $whereConditions[] = "MONTH(pv.viewed_at) = MONTH(CURRENT_DATE()) AND YEAR(pv.viewed_at) = YEAR(CURRENT_DATE())";
}

// ── Specific Campaign Filter (Drilldown) ──────────────────────────────
if ($campaignFilter && $campaignFilter !== 'all') {
    $whereConditions[] = "(ct.utm_campaign = :cmpFilter OR ct.utm_source = :cmpFilter2)";
    $params[':cmpFilter'] = $campaignFilter;
    $params[':cmpFilter2'] = $campaignFilter;
}

// ── Global Search Filter ─────────────────────────────────────────────
if ($q) {
    $whereConditions[] = "(
        ct.utm_campaign LIKE :q1 OR 
        ct.utm_source LIKE :q2 OR 
        ct.utm_medium LIKE :q3 OR 
        ct.utm_content LIKE :q4 OR 
        ct.utm_term LIKE :q5 OR 
        ct.utm_source_platform LIKE :q6 OR 
        ct.utm_creative_format LIKE :q7 OR 
        pv.ip_address LIKE :q8 OR 
        pv.city LIKE :q9 OR 
        pv.country LIKE :q10
    )";
    $params[':q1'] = "%$q%";
    $params[':q2'] = "%$q%";
    $params[':q3'] = "%$q%";
    $params[':q4'] = "%$q%";
    $params[':q5'] = "%$q%";
    $params[':q6'] = "%$q%";
    $params[':q7'] = "%$q%";
    $params[':q8'] = "%$q%";
    $params[':q9'] = "%$q%";
    $params[':q10'] = "%$q%";
}

$whereSql = "WHERE " . implode(" AND ", $whereConditions);

// ── 1. KPI Summary ───────────────────────────────────────────────────
$summaryStmt = $db->prepare("
    SELECT 
        COUNT(ct.id) AS total_clicks,
        COUNT(DISTINCT pv.ip_address) AS unique_visitors,
        COUNT(DISTINCT NULLIF(ct.utm_campaign, '')) AS active_campaigns_count
    FROM campaign_tracking ct
    JOIN page_views pv ON ct.page_view_id = pv.id
    $whereSql
");
$summaryStmt->execute($params);
$kpi = $summaryStmt->fetch();
$totalClicks = (int) ($kpi['total_clicks'] ?? 0);
$uniqueVisitors = (int) ($kpi['unique_visitors'] ?? 0);
$activeCampaignsCount = (int) ($kpi['active_campaigns_count'] ?? 0);

// Top Dimension Leaders
$topSourceStmt = $db->prepare("SELECT ct.utm_source as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY ct.utm_source ORDER BY count DESC LIMIT 1");
$topSourceStmt->execute($params);
$topSource = $topSourceStmt->fetch() ?: ['label' => '—', 'count' => 0];

$topPlatformStmt = $db->prepare("SELECT COALESCE(NULLIF(ct.utm_source_platform, ''), '(direct)') as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY label ORDER BY count DESC LIMIT 1");
$topPlatformStmt->execute($params);
$topPlatform = $topPlatformStmt->fetch() ?: ['label' => '—', 'count' => 0];

$topFormatStmt = $db->prepare("SELECT COALESCE(NULLIF(ct.utm_creative_format, ''), '(not set)') as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY label ORDER BY count DESC LIMIT 1");
$topFormatStmt->execute($params);
$topFormat = $topFormatStmt->fetch() ?: ['label' => '—', 'count' => 0];

$topCampaignStmt = $db->prepare("SELECT COALESCE(NULLIF(ct.utm_campaign, ''), '(not set)') as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY label ORDER BY count DESC LIMIT 1");
$topCampaignStmt->execute($params);
$topCampaign = $topCampaignStmt->fetch() ?: ['label' => '—', 'count' => 0];

// ── 2. Daily Trend (for visual chart) ─────────────────────────────────
$trendStmt = $db->prepare("
    SELECT 
        DATE(pv.viewed_at) as date,
        COUNT(*) as clicks,
        COUNT(DISTINCT pv.ip_address) as visitors
    FROM campaign_tracking ct
    JOIN page_views pv ON ct.page_view_id = pv.id
    $whereSql
    GROUP BY DATE(pv.viewed_at)
    ORDER BY date ASC
    LIMIT 30
");
$trendStmt->execute($params);
$dailyTrend = $trendStmt->fetchAll();

// ── 3. Dimension Breakdown Table ─────────────────────────────────────
switch ($dimension) {
    case 'source_medium':
        $selectDim = "CONCAT(ct.utm_source, ' / ', COALESCE(NULLIF(ct.utm_medium, ''), '(none)')) as dim_key, ct.utm_source, ct.utm_medium, ct.utm_source_platform";
        $groupBy = "ct.utm_source, ct.utm_medium, ct.utm_source_platform";
        break;
    case 'platform':
        $selectDim = "COALESCE(NULLIF(ct.utm_source_platform, ''), '(not set)') as dim_key, ct.utm_source, ct.utm_medium, ct.utm_source_platform";
        $groupBy = "COALESCE(NULLIF(ct.utm_source_platform, ''), '(not set)'), ct.utm_source, ct.utm_medium";
        break;
    case 'creative_format':
        $selectDim = "COALESCE(NULLIF(ct.utm_creative_format, ''), '(not set)') as dim_key, ct.utm_source, ct.utm_source_platform, ct.utm_creative_format";
        $groupBy = "COALESCE(NULLIF(ct.utm_creative_format, ''), '(not set)'), ct.utm_source, ct.utm_source_platform";
        break;
    case 'tactic':
        $selectDim = "COALESCE(NULLIF(ct.utm_marketing_tactic, ''), '(not set)') as dim_key, ct.utm_source, ct.utm_marketing_tactic";
        $groupBy = "COALESCE(NULLIF(ct.utm_marketing_tactic, ''), '(not set)'), ct.utm_source";
        break;
    case 'content':
        $selectDim = "COALESCE(NULLIF(ct.utm_content, ''), '(not set)') as dim_key, ct.utm_campaign, ct.utm_source";
        $groupBy = "COALESCE(NULLIF(ct.utm_content, ''), '(not set)'), ct.utm_campaign, ct.utm_source";
        break;
    case 'term':
        $selectDim = "COALESCE(NULLIF(ct.utm_term, ''), '(not set)') as dim_key, ct.utm_campaign, ct.utm_source";
        $groupBy = "COALESCE(NULLIF(ct.utm_term, ''), '(not set)'), ct.utm_campaign, ct.utm_source";
        break;
    case 'campaign':
    default:
        $selectDim = "COALESCE(NULLIF(ct.utm_campaign, ''), '(not set)') as dim_key, ct.utm_campaign, ct.utm_source, ct.utm_medium, ct.utm_source_platform, ct.utm_creative_format, ct.utm_marketing_tactic";
        $groupBy = "COALESCE(NULLIF(ct.utm_campaign, ''), '(not set)'), ct.utm_source, ct.utm_medium, ct.utm_source_platform";
        break;
}

$breakdownStmt = $db->prepare("
    SELECT 
        $selectDim,
        COUNT(ct.id) as clicks,
        COUNT(DISTINCT pv.ip_address) as unique_visitors,
        MAX(pv.viewed_at) as last_seen
    FROM campaign_tracking ct
    JOIN page_views pv ON ct.page_view_id = pv.id
    $whereSql
    GROUP BY $groupBy
    ORDER BY clicks DESC
    LIMIT 100
");
$breakdownStmt->execute($params);
$rawBreakdown = $breakdownStmt->fetchAll();

// Add percentage share
$breakdown = array_map(function($row) use ($totalClicks) {
    $c = (int) $row['clicks'];
    $row['share_pct'] = $totalClicks > 0 ? round(($c / $totalClicks) * 100, 1) : 0;
    return $row;
}, $rawBreakdown);

// ── 4. Quick Distribution Widgets ────────────────────────────────────
// Top 5 Sources
$topSourcesStmt = $db->prepare("SELECT ct.utm_source as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY ct.utm_source ORDER BY count DESC LIMIT 5");
$topSourcesStmt->execute($params);
$topSources = $topSourcesStmt->fetchAll();

// Top 5 Platforms
$topPlatformsStmt = $db->prepare("SELECT COALESCE(NULLIF(ct.utm_source_platform, ''), '(direct)') as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY label ORDER BY count DESC LIMIT 5");
$topPlatformsStmt->execute($params);
$topPlatforms = $topPlatformsStmt->fetchAll();

// Top 5 Formats
$topFormatsStmt = $db->prepare("SELECT COALESCE(NULLIF(ct.utm_creative_format, ''), '(not set)') as label, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql GROUP BY label ORDER BY count DESC LIMIT 5");
$topFormatsStmt->execute($params);
$topFormats = $topFormatsStmt->fetchAll();

// Top 5 Locations (Cities)
$topCitiesStmt = $db->prepare("SELECT pv.city as label, pv.country, COUNT(*) as count FROM campaign_tracking ct JOIN page_views pv ON ct.page_view_id = pv.id $whereSql AND pv.city != '' GROUP BY pv.city, pv.country ORDER BY count DESC LIMIT 5");
$topCitiesStmt->execute($params);
$topCities = $topCitiesStmt->fetchAll();

// ── 5. Detailed Visitor Activity Logs ────────────────────────────────
$limit = $q ? 200 : 50;
$logsStmt = $db->prepare("
    SELECT 
        ct.id as log_id,
        ct.utm_source,
        ct.utm_medium,
        ct.utm_campaign,
        ct.utm_content,
        ct.utm_term,
        ct.utm_id,
        ct.utm_source_platform,
        ct.utm_creative_format,
        ct.utm_marketing_tactic,
        ct.landing_url,
        pv.page_slug,
        pv.ip_address,
        pv.browser,
        pv.os,
        pv.device_type,
        pv.country,
        pv.city,
        pv.referrer,
        pv.viewed_at
    FROM campaign_tracking ct
    JOIN page_views pv ON ct.page_view_id = pv.id
    $whereSql
    ORDER BY pv.viewed_at DESC
    LIMIT $limit
");
$logsStmt->execute($params);
$logs = $logsStmt->fetchAll();

jsonSuccess([
    'summary' => [
        'total_clicks'           => $totalClicks,
        'unique_visitors'        => $uniqueVisitors,
        'active_campaigns_count' => $activeCampaignsCount,
        'top_campaign'           => $topCampaign,
        'top_source'             => $topSource,
        'top_platform'           => $topPlatform,
        'top_format'             => $topFormat,
    ],
    'dimension'    => $dimension,
    'date_range'   => $dateRange,
    'daily_trend'  => $dailyTrend,
    'breakdown'    => $breakdown,
    'distributions' => [
        'sources'   => $topSources,
        'platforms' => $topPlatforms,
        'formats'   => $topFormats,
        'cities'    => $topCities,
    ],
    'logs'         => $logs,
]);

