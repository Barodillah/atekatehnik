<?php
/**
 * Gallery API — Ateka Tehnik
 * 
 * Public endpoint to fetch gallery items (images and videos).
 * 
 * GET /api/gallery.php
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    jsonError(405, 'Method not allowed.');
}

try {
    $db = getDB();
    
    $stmt = $db->query("
        SELECT id, type, src, title, height_class as height
        FROM galleries
        ORDER BY sort_order ASC, created_at DESC
    ");
    $galleries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch all related links
    $linkStmt = $db->query("
        SELECT l.gallery_id, l.related_type,
               CASE 
                   WHEN l.related_type = 'product' THEN (SELECT nama FROM products p WHERE p.id = l.related_id)
                   ELSE (SELECT title FROM posts po WHERE po.id = l.related_id)
               END as target_title,
               CASE 
                   WHEN l.related_type = 'product' THEN (SELECT slug FROM products p WHERE p.id = l.related_id)
                   ELSE (SELECT slug FROM posts po WHERE po.id = l.related_id)
               END as target_slug
        FROM gallery_related_links l
        ORDER BY l.sort_order ASC, l.created_at DESC
    ");
    $allLinks = $linkStmt->fetchAll(PDO::FETCH_ASSOC);

    $linksByGallery = [];
    foreach ($allLinks as $link) {
        if ($link['target_title'] && $link['target_slug']) {
            $linksByGallery[$link['gallery_id']][] = [
                'type' => $link['related_type'],
                'title' => $link['target_title'],
                'slug' => $link['target_slug']
            ];
        }
    }

    foreach ($galleries as &$gallery) {
        $gallery['links'] = $linksByGallery[$gallery['id']] ?? [];
    }
    
    jsonSuccess([
        'galleries' => $galleries,
        'total' => count($galleries)
    ]);
} catch (PDOException $e) {
    jsonError(500, 'Database error: ' . $e->getMessage());
}
