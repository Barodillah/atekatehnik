<?php
/**
 * Admin Notifications API — Ateka Tehnik
 *
 * GET /api/admin_notifications.php
 * Returns recent activity counts for the notification bell:
 * - New leads (last 24h)
 * - WA CTA clicks (last 24h)
 * - New post likes (last 24h)
 * - Pending comments
 * - New unique IPs (last 24h)
 *
 * Also returns the latest 15 notification items.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$db = getDB();

// ── 1. New Leads (last 24h) ──────────────────────────────────────────
$leadsStmt = $db->query("
    SELECT COUNT(*) FROM leads
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
");
$newLeads = (int) $leadsStmt->fetchColumn();

// Latest 3 leads
$leadsDetailStmt = $db->query("
    SELECT name, company, created_at
    FROM leads
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY created_at DESC
    LIMIT 3
");
$latestLeads = $leadsDetailStmt->fetchAll();

// ── 2. WA CTA Clicks (last 24h) ─────────────────────────────────────
$waStmt = $db->query("
    SELECT COUNT(*) FROM wa_cta_clicks
    WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
");
$newWaClicks = (int) $waStmt->fetchColumn();

// Latest 3 WA clicks
$waDetailStmt = $db->query("
    SELECT source_page, source_label, clicked_at
    FROM wa_cta_clicks
    WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY clicked_at DESC
    LIMIT 3
");
$latestWaClicks = $waDetailStmt->fetchAll();

// ── 3. New Post Likes (last 24h) ────────────────────────────────────
$likesStmt = $db->query("
    SELECT COUNT(*) FROM post_likes
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
");
$newLikes = (int) $likesStmt->fetchColumn();

// Latest 3 likes
$likesDetailStmt = $db->query("
    SELECT post_slug, ip_address, created_at
    FROM post_likes
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY created_at DESC
    LIMIT 3
");
$latestLikes = $likesDetailStmt->fetchAll();

// ── 4. Pending Comments ──────────────────────────────────────────────
$commentsStmt = $db->query("
    SELECT COUNT(*) FROM post_comments
    WHERE status = 'pending'
");
$pendingComments = (int) $commentsStmt->fetchColumn();

// Latest 3 pending comments
$commentsDetailStmt = $db->query("
    SELECT user_name, comment_text, post_slug, created_at
    FROM post_comments
    WHERE status = 'pending'
    ORDER BY created_at DESC
    LIMIT 3
");
$latestComments = $commentsDetailStmt->fetchAll();

// ── 5. New Unique IPs (last 24h) ────────────────────────────────────
$ipsStmt = $db->query("
    SELECT COUNT(DISTINCT ip_address) FROM page_views
    WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
");
$newUniqueIps = (int) $ipsStmt->fetchColumn();

// Total count for badge
$totalBadge = $newLeads + $newWaClicks + $newLikes + $pendingComments;

// ── Build unified timeline (last 15 items) ───────────────────────────
$items = [];

foreach ($latestLeads as $l) {
    $items[] = [
        'type'  => 'lead',
        'icon'  => 'person_add',
        'color' => 'orange',
        'title' => 'New Lead: ' . $l['name'],
        'desc'  => $l['company'] ?: 'No company',
        'time'  => $l['created_at'],
        'link'  => '/admin/leads',
    ];
}

foreach ($latestWaClicks as $w) {
    $items[] = [
        'type'  => 'wa_click',
        'icon'  => 'ads_click',
        'color' => 'green',
        'title' => 'WA Click: ' . ($w['source_label'] ?: $w['source_page']),
        'desc'  => 'From ' . $w['source_page'],
        'time'  => $w['clicked_at'],
        'link'  => '/admin/wa-clicks',
    ];
}

foreach ($latestLikes as $lk) {
    $items[] = [
        'type'  => 'like',
        'icon'  => 'favorite',
        'color' => 'red',
        'title' => 'Post Liked',
        'desc'  => $lk['post_slug'] . ' by ' . $lk['ip_address'],
        'time'  => $lk['created_at'],
        'link'  => '/admin/analytics',
    ];
}

foreach ($latestComments as $c) {
    $items[] = [
        'type'  => 'comment',
        'icon'  => 'forum',
        'color' => 'amber',
        'title' => 'Comment from ' . $c['user_name'],
        'desc'  => mb_substr($c['comment_text'], 0, 60) . (mb_strlen($c['comment_text']) > 60 ? '...' : ''),
        'time'  => $c['created_at'],
        'link'  => '/admin/comments',
    ];
}

// Sort all items by time (newest first)
usort($items, function ($a, $b) {
    return strtotime($b['time']) - strtotime($a['time']);
});

// Take top 15
$items = array_slice($items, 0, 15);

jsonSuccess([
    'badge' => $totalBadge,
    'counts' => [
        'leads'    => $newLeads,
        'waClicks' => $newWaClicks,
        'likes'    => $newLikes,
        'comments' => $pendingComments,
        'uniqueIps'=> $newUniqueIps,
    ],
    'items' => $items,
]);
