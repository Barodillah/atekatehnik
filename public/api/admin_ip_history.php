<?php
/**
 * Admin IP History API — Ateka Tehnik
 *
 * GET /api/admin_ip_history.php?ip=1.2.3.4
 * Returns full page view history (posts, products, galleries) & WA clicks for an IP.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$ip = trim($_GET['ip'] ?? '');
if (empty($ip)) {
    jsonError(400, 'Parameter ip wajib diisi.');
}

$db = getDB();

// 1. Fetch visitor summary / profile info
$profileStmt = $db->prepare("
    SELECT 
        city, country, browser, os, device_type, user_agent,
        MIN(viewed_at) as first_seen,
        MAX(viewed_at) as last_seen,
        COUNT(*) as total_views,
        COUNT(DISTINCT page_slug) as unique_pages
    FROM page_views
    WHERE ip_address = :ip
");
$profileStmt->execute([':ip' => $ip]);
$profile = $profileStmt->fetch();

// Also check wa_cta_clicks for fallback/extra data
$waProfileStmt = $db->prepare("
    SELECT 
        city, country, browser, os, device_type,
        MIN(clicked_at) as first_wa_click,
        MAX(clicked_at) as last_wa_click,
        COUNT(*) as total_wa_clicks
    FROM wa_cta_clicks
    WHERE ip_address = :ip
");
$waProfileStmt->execute([':ip' => $ip]);
$waProfile = $waProfileStmt->fetch();

// Merge profile details
$city = !empty($profile['city']) ? $profile['city'] : (!empty($waProfile['city']) ? $waProfile['city'] : '');
$country = !empty($profile['country']) ? $profile['country'] : (!empty($waProfile['country']) ? $waProfile['country'] : '');
$browser = !empty($profile['browser']) ? $profile['browser'] : (!empty($waProfile['browser']) ? $waProfile['browser'] : '');
$os = !empty($profile['os']) ? $profile['os'] : (!empty($waProfile['os']) ? $waProfile['os'] : '');
$deviceType = !empty($profile['device_type']) ? $profile['device_type'] : (!empty($waProfile['device_type']) ? $waProfile['device_type'] : 'Desktop');

$firstSeen = $profile['first_seen'] ?: ($waProfile['first_wa_click'] ?? null);
$lastSeen = $profile['last_seen'] ?: ($waProfile['last_wa_click'] ?? null);
$totalViews = (int)($profile['total_views'] ?? 0);
$uniquePages = (int)($profile['unique_pages'] ?? 0);
$totalWaClicks = (int)($waProfile['total_wa_clicks'] ?? 0);

// 2. Fetch all page views for this IP (limit 300)
$viewsStmt = $db->prepare("
    SELECT id, page_type, page_slug, referrer, viewed_at
    FROM page_views
    WHERE ip_address = :ip
    ORDER BY viewed_at DESC
    LIMIT 300
");
$viewsStmt->execute([':ip' => $ip]);
$rawViews = $viewsStmt->fetchAll();

// Resolve human-friendly titles for posts, products, galleries
$productSlugs = [];
$postSlugs = [];
$galleryIds = [];

foreach ($rawViews as $v) {
    if ($v['page_type'] === 'product') {
        $productSlugs[$v['page_slug']] = true;
    } elseif ($v['page_type'] === 'post') {
        $postSlugs[$v['page_slug']] = true;
    } elseif ($v['page_type'] === 'gallery') {
        if ($v['page_slug'] !== 'main') {
            $parts = explode('-', $v['page_slug']);
            $gid = (int)end($parts);
            if ($gid > 0) {
                $galleryIds[$gid] = true;
            }
        }
    }
}

// Batch lookup products
$productTitles = [];
if (!empty($productSlugs)) {
    $slugKeys = array_keys($productSlugs);
    $placeholders = implode(',', array_fill(0, count($slugKeys), '?'));
    $pStmt = $db->prepare("SELECT slug, nama FROM products WHERE slug IN ($placeholders)");
    $pStmt->execute($slugKeys);
    foreach ($pStmt->fetchAll() as $row) {
        $productTitles[$row['slug']] = $row['nama'];
    }
}

// Batch lookup posts
$postTitles = [];
if (!empty($postSlugs)) {
    $slugKeys = array_keys($postSlugs);
    $placeholders = implode(',', array_fill(0, count($slugKeys), '?'));
    $poStmt = $db->prepare("SELECT slug, title FROM posts WHERE slug IN ($placeholders)");
    $poStmt->execute($slugKeys);
    foreach ($poStmt->fetchAll() as $row) {
        $postTitles[$row['slug']] = $row['title'];
    }
}

// Batch lookup galleries
$galleryTitles = [];
if (!empty($galleryIds)) {
    $idKeys = array_keys($galleryIds);
    $placeholders = implode(',', array_fill(0, count($idKeys), '?'));
    $gStmt = $db->prepare("SELECT id, title FROM galleries WHERE id IN ($placeholders)");
    $gStmt->execute($idKeys);
    foreach ($gStmt->fetchAll() as $row) {
        $galleryTitles[$row['id']] = $row['title'];
    }
}

// Build enriched views list & counts per category
$views = [];
$categoryCounts = [
    'all'     => count($rawViews),
    'product' => 0,
    'post'    => 0,
    'gallery' => 0,
];

foreach ($rawViews as $v) {
    $type = $v['page_type'];
    $slug = $v['page_slug'];
    $title = $slug;
    $url = '';

    if ($type === 'product') {
        $categoryCounts['product']++;
        $title = $productTitles[$slug] ?? ucwords(str_replace('-', ' ', $slug));
        $url = '/products/' . $slug;
    } elseif ($type === 'post') {
        $categoryCounts['post']++;
        $title = $postTitles[$slug] ?? ucwords(str_replace('-', ' ', $slug));
        $url = '/news/' . $slug;
    } elseif ($type === 'gallery') {
        $categoryCounts['gallery']++;
        if ($slug === 'main') {
            $title = 'Halaman Utama Portofolio & Galeri';
            $url = '/portfolio';
        } else {
            $parts = explode('-', $slug);
            $gid = (int)end($parts);
            $title = $galleryTitles[$gid] ?? ('Galeri #' . $slug);
            $url = '/portfolio';
        }
    }

    $views[] = [
        'id'        => (int)$v['id'],
        'page_type' => $type,
        'page_slug' => $slug,
        'title'     => $title,
        'url'       => $url,
        'referrer'  => $v['referrer'] ?: 'Direct / Bookmark',
        'viewed_at' => $v['viewed_at'],
    ];
}

// 3. Fetch WA clicks for this IP
$waClicksStmt = $db->prepare("
    SELECT id, source_page, source_label, referrer, clicked_at
    FROM wa_cta_clicks
    WHERE ip_address = :ip
    ORDER BY clicked_at DESC
    LIMIT 100
");
$waClicksStmt->execute([':ip' => $ip]);
$waClicks = $waClicksStmt->fetchAll();

jsonSuccess([
    'ip' => $ip,
    'profile' => [
        'city'            => $city,
        'country'         => $country,
        'browser'         => $browser,
        'os'              => $os,
        'device_type'     => $deviceType,
        'first_seen'      => $firstSeen,
        'last_seen'       => $lastSeen,
        'total_views'     => $totalViews,
        'unique_pages'    => $uniquePages,
        'total_wa_clicks' => $totalWaClicks,
        'category_counts' => $categoryCounts,
    ],
    'views'     => $views,
    'wa_clicks' => $waClicks,
]);
