<?php
/**
 * Search API — Ateka Tehnik
 * 
 * Public endpoint (no auth required).
 * Searches both products and posts tables.
 * 
 * GET /api/search.php?q=keyword&limit=10
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    jsonError(405, 'Method not allowed.');
}

$query = trim($_GET['q'] ?? '');
$limit = min(20, max(1, (int)($_GET['limit'] ?? 10)));

if (empty($query)) {
    jsonSuccess(['results' => [], 'total' => 0]);
}

$db = getDB();
$results = [];

// ── Search Products ──────────────────────────────────────────────
$pStmt = $db->prepare("
    SELECT id, nama, gambar, kategori, shopee_link, slug, description
    FROM products
    WHERE nama LIKE :q1 OR kategori LIKE :q2 OR description LIKE :q3
    ORDER BY created_at DESC
    LIMIT :plimit
");
$pStmt->bindValue(':q1', "%$query%");
$pStmt->bindValue(':q2', "%$query%");
$pStmt->bindValue(':q3', "%$query%");
$pStmt->bindValue(':plimit', $limit, PDO::PARAM_INT);
$pStmt->execute();
$products = $pStmt->fetchAll();

foreach ($products as $p) {
    // Attach specs
    $specStmt = $db->prepare("SELECT spesifikasi FROM product_specs WHERE product_id = :pid ORDER BY id LIMIT 3");
    $specStmt->execute([':pid' => $p['id']]);
    $specs = $specStmt->fetchAll(PDO::FETCH_COLUMN, 0);

    $results[] = [
        'id'    => 'product-' . $p['id'],
        'type'  => 'product',
        'title' => $p['nama'],
        'image' => $p['gambar'] ?: null,
        'badge' => $p['kategori'] === 'Paket' ? 'Paket Lengkap' : $p['kategori'],
        'desc'  => implode(' · ', $specs),
        'link'  => '/product/' . ($p['slug'] ?: $p['id']),
        'kategori' => $p['kategori'],
    ];
}

// ── Search Posts ──────────────────────────────────────────────────
$postStmt = $db->prepare("
    SELECT id, title, subtitle, category, cover_image, language, slug
    FROM posts
    WHERE title LIKE :q1 OR subtitle LIKE :q2 OR category LIKE :q3
    ORDER BY created_at DESC
    LIMIT :plimit
");
$postStmt->bindValue(':q1', "%$query%");
$postStmt->bindValue(':q2', "%$query%");
$postStmt->bindValue(':q3', "%$query%");
$postStmt->bindValue(':plimit', $limit, PDO::PARAM_INT);
$postStmt->execute();
$posts = $postStmt->fetchAll();

foreach ($posts as $post) {
    $results[] = [
        'id'    => 'post-' . $post['id'],
        'type'  => 'post',
        'title' => $post['title'],
        'image' => $post['cover_image'] ?: null,
        'badge' => $post['category'],
        'desc'  => $post['subtitle'] ?: '',
        'link'  => '/post/' . $post['slug'],
        'language' => $post['language'],
    ];
}

jsonSuccess([
    'results' => $results,
    'total'   => count($results),
    'query'   => $query,
]);
