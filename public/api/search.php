<?php
/**
 * Search API — Ateka Tehnik
 * 
 * Public endpoint (no auth required).
 * Searches products and posts tables, including content and deliverables.
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

/**
 * Extract a snippet around the first occurrence of $keyword in $text.
 * Returns ~120 chars of context with the keyword in the middle.
 */
function extractSnippet(string $text, string $keyword, int $contextLen = 60): string {
    // Strip HTML tags for clean text search
    $clean = strip_tags($text);
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);

    $pos = mb_stripos($clean, $keyword);
    if ($pos === false) {
        // No match — return first 120 chars as fallback
        return mb_substr($clean, 0, 120) . (mb_strlen($clean) > 120 ? '...' : '');
    }

    $start = max(0, $pos - $contextLen);
    $end = min(mb_strlen($clean), $pos + mb_strlen($keyword) + $contextLen);
    $snippet = mb_substr($clean, $start, $end - $start);

    if ($start > 0) $snippet = '...' . $snippet;
    if ($end < mb_strlen($clean)) $snippet .= '...';

    return $snippet;
}

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

    // Build snippet from description (primary match source)
    $snippet = '';
    $descText = $p['description'] ?: '';
    if ($descText && mb_stripos($descText, $query) !== false) {
        $snippet = extractSnippet($descText, $query);
    } else {
        // Fallback: check specs text
        $specText = implode('. ', $specs);
        if ($specText && mb_stripos($specText, $query) !== false) {
            $snippet = extractSnippet($specText, $query);
        } else {
            $snippet = $descText ? mb_substr(strip_tags($descText), 0, 120) . '...' : implode(' · ', $specs);
        }
    }

    $results[] = [
        'id'       => 'product-' . $p['id'],
        'type'     => 'product',
        'title'    => $p['nama'],
        'image'    => $p['gambar'] ?: null,
        'badge'    => $p['kategori'] === 'Paket' ? 'Paket Lengkap' : $p['kategori'],
        'desc'     => implode(' · ', $specs),
        'snippet'  => $snippet,
        'link'     => '/product/' . ($p['slug'] ?: $p['id']),
        'kategori' => $p['kategori'],
    ];
}

// ── Search Posts (title, subtitle, category, content) ────────────
$postStmt = $db->prepare("
    SELECT id, title, subtitle, category, cover_image, language, slug, content
    FROM posts
    WHERE title LIKE :q1 OR subtitle LIKE :q2 OR category LIKE :q3 OR content LIKE :q4
    ORDER BY created_at DESC
    LIMIT :plimit
");
$postStmt->bindValue(':q1', "%$query%");
$postStmt->bindValue(':q2', "%$query%");
$postStmt->bindValue(':q3', "%$query%");
$postStmt->bindValue(':q4', "%$query%");
$postStmt->bindValue(':plimit', $limit, PDO::PARAM_INT);
$postStmt->execute();
$posts = $postStmt->fetchAll();

// Collect post IDs to also check deliverables
$postIds = array_column($posts, 'id');
$postIdMap = [];
foreach ($posts as $p) $postIdMap[$p['id']] = $p;

// ── Search post_deliverables for additional matches ─────────────
if (!empty($query)) {
    $delStmt = $db->prepare("
        SELECT DISTINCT pd.post_id, pd.item
        FROM post_deliverables pd
        INNER JOIN posts p ON p.id = pd.post_id
        WHERE pd.item LIKE :q1
        ORDER BY pd.post_id DESC
        LIMIT 20
    ");
    $delStmt->bindValue(':q1', "%$query%");
    $delStmt->execute();
    $deliverableHits = $delStmt->fetchAll();

    foreach ($deliverableHits as $dh) {
        $pid = (int) $dh['post_id'];
        if (!isset($postIdMap[$pid])) {
            // This post wasn't found in the main query, fetch it
            $fetchPost = $db->prepare("SELECT id, title, subtitle, category, cover_image, language, slug, content FROM posts WHERE id = :id");
            $fetchPost->execute([':id' => $pid]);
            $fp = $fetchPost->fetch();
            if ($fp) {
                $postIdMap[$pid] = $fp;
                $postIdMap[$pid]['_deliverable_match'] = $dh['item'];
            }
        } else if (!isset($postIdMap[$pid]['_deliverable_match'])) {
            $postIdMap[$pid]['_deliverable_match'] = $dh['item'];
        }
    }
}

foreach ($postIdMap as $post) {
    // Build snippet: prioritize content match, then deliverable match, then subtitle
    $snippet = '';
    $content = $post['content'] ?? '';
    $deliverableMatch = $post['_deliverable_match'] ?? '';

    if ($content && mb_stripos($content, $query) !== false) {
        $snippet = extractSnippet($content, $query);
    } else if ($deliverableMatch) {
        $snippet = extractSnippet($deliverableMatch, $query, 40);
    } else if ($post['subtitle'] && mb_stripos($post['subtitle'], $query) !== false) {
        $snippet = extractSnippet($post['subtitle'], $query);
    } else {
        // Fallback
        $fallback = $post['subtitle'] ?: strip_tags($content);
        $snippet = mb_substr($fallback, 0, 120) . (mb_strlen($fallback) > 120 ? '...' : '');
    }

    $results[] = [
        'id'       => 'post-' . $post['id'],
        'type'     => 'post',
        'title'    => $post['title'],
        'image'    => $post['cover_image'] ?: null,
        'badge'    => $post['category'],
        'desc'     => $post['subtitle'] ?: '',
        'snippet'  => $snippet,
        'link'     => '/post/' . $post['slug'],
        'language' => $post['language'],
    ];
}

jsonSuccess([
    'results' => $results,
    'total'   => count($results),
    'query'   => $query,
]);
