<?php
/**
 * Admin Search API — Ateka Tehnik
 * 
 * Searches across all admin data: leads, posts, products, comments, chat sessions, activity logs.
 * Returns unified results with type, title, subtitle, and admin link.
 * 
 * GET /api/admin_search.php?q=keyword&limit=10
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$user = requireAuth();
$db = getDB();

$query = trim($_GET['q'] ?? '');
$limit = min(20, max(1, (int)($_GET['limit'] ?? 10)));

if (empty($query)) {
    jsonSuccess(['results' => [], 'total' => 0]);
}

$results = [];
$perType = max(2, intdiv($limit, 5)); // distribute limit across types

// ── Search Leads ─────────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT id, name, company, email, status, created_at
    FROM leads
    WHERE name LIKE :q1 OR company LIKE :q2 OR email LIKE :q3 OR service_request LIKE :q4
    ORDER BY created_at DESC
    LIMIT :lim
");
$stmt->bindValue(':q1', "%$query%");
$stmt->bindValue(':q2', "%$query%");
$stmt->bindValue(':q3', "%$query%");
$stmt->bindValue(':q4', "%$query%");
$stmt->bindValue(':lim', $perType, PDO::PARAM_INT);
$stmt->execute();
foreach ($stmt->fetchAll() as $row) {
    $results[] = [
        'id'       => 'lead-' . $row['id'],
        'type'     => 'lead',
        'icon'     => 'contact_page',
        'color'    => 'orange',
        'title'    => $row['name'],
        'subtitle' => trim(($row['company'] ? $row['company'] . ' · ' : '') . $row['email']),
        'badge'    => $row['status'],
        'link'     => '/admin/leads',
    ];
}

// ── Search Posts ──────────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT id, title, category, language, slug, cover_image
    FROM posts
    WHERE title LIKE :q1 OR subtitle LIKE :q2 OR content LIKE :q3
    ORDER BY created_at DESC
    LIMIT :lim
");
$stmt->bindValue(':q1', "%$query%");
$stmt->bindValue(':q2', "%$query%");
$stmt->bindValue(':q3', "%$query%");
$stmt->bindValue(':lim', $perType, PDO::PARAM_INT);
$stmt->execute();
foreach ($stmt->fetchAll() as $row) {
    $results[] = [
        'id'       => 'post-' . $row['id'],
        'type'     => 'post',
        'icon'     => 'edit_square',
        'color'    => 'blue',
        'title'    => $row['title'],
        'subtitle' => $row['category'] . ($row['language'] === 'en' ? ' · EN' : ''),
        'badge'    => $row['category'],
        'image'    => $row['cover_image'] ?: null,
        'link'     => '/admin/posts/edit/' . $row['id'],
    ];
}

// ── Search Products ──────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT id, nama, kategori, gambar, slug
    FROM products
    WHERE nama LIKE :q1 OR kategori LIKE :q2 OR description LIKE :q3
    ORDER BY created_at DESC
    LIMIT :lim
");
$stmt->bindValue(':q1', "%$query%");
$stmt->bindValue(':q2', "%$query%");
$stmt->bindValue(':q3', "%$query%");
$stmt->bindValue(':lim', $perType, PDO::PARAM_INT);
$stmt->execute();
foreach ($stmt->fetchAll() as $row) {
    $results[] = [
        'id'       => 'product-' . $row['id'],
        'type'     => 'product',
        'icon'     => 'precision_manufacturing',
        'color'    => 'indigo',
        'title'    => $row['nama'],
        'subtitle' => $row['kategori'],
        'badge'    => $row['kategori'],
        'image'    => $row['gambar'] ?: null,
        'link'     => '/admin/products/edit/' . $row['id'],
    ];
}

// ── Search Comments ──────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT id, user_name, comment_text, post_slug, status
    FROM post_comments
    WHERE user_name LIKE :q1 OR comment_text LIKE :q2 OR post_slug LIKE :q3
    ORDER BY created_at DESC
    LIMIT :lim
");
$stmt->bindValue(':q1', "%$query%");
$stmt->bindValue(':q2', "%$query%");
$stmt->bindValue(':q3', "%$query%");
$stmt->bindValue(':lim', $perType, PDO::PARAM_INT);
$stmt->execute();
foreach ($stmt->fetchAll() as $row) {
    $text = mb_substr($row['comment_text'], 0, 60);
    $results[] = [
        'id'       => 'comment-' . $row['id'],
        'type'     => 'comment',
        'icon'     => 'forum',
        'color'    => 'teal',
        'title'    => $row['user_name'],
        'subtitle' => $text . (mb_strlen($row['comment_text']) > 60 ? '...' : ''),
        'badge'    => $row['status'],
        'link'     => '/admin/comments',
    ];
}

// ── Search Activity Logs ─────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT a.id, a.action, a.entity_type, a.details, a.created_at, u.name as user_name
    FROM activity_logs a
    LEFT JOIN admin_users u ON a.user_id = u.id
    WHERE a.action LIKE :q1 OR a.details LIKE :q2
    ORDER BY a.created_at DESC
    LIMIT :lim
");
$stmt->bindValue(':q1', "%$query%");
$stmt->bindValue(':q2', "%$query%");
$stmt->bindValue(':lim', $perType, PDO::PARAM_INT);
$stmt->execute();
foreach ($stmt->fetchAll() as $row) {
    $results[] = [
        'id'       => 'log-' . $row['id'],
        'type'     => 'log',
        'icon'     => 'history',
        'color'    => 'slate',
        'title'    => ucwords(str_replace('_', ' ', $row['action'])),
        'subtitle' => ($row['user_name'] ?: 'System') . ' · ' . mb_substr($row['details'] ?: '', 0, 50),
        'badge'    => $row['entity_type'],
        'link'     => '/admin/logs',
    ];
}

jsonSuccess([
    'results' => array_slice($results, 0, $limit),
    'total'   => count($results),
    'query'   => $query,
]);
