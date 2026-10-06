<?php
/**
 * Admin Gallery Links API
 * POST, GET, DELETE related links for gallery items.
 */

require_once __DIR__ . '/helpers.php';

$adminUser = requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    $gallery_id = (int)($_GET['gallery_id'] ?? 0);
    if ($gallery_id <= 0) {
        jsonError(400, 'Invalid gallery ID');
    }

    $stmt = $db->prepare("
        SELECT id, gallery_id, related_type, related_id, external_url, external_title, sort_order, created_at
        FROM gallery_related_links
        WHERE gallery_id = ?
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute([$gallery_id]);
    
    $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Quick enhancement: Fetch titles based on type
    foreach ($links as &$link) {
        if ($link['related_type'] === 'external') {
            $link['target_title'] = $link['external_title'];
        } elseif ($link['related_type'] === 'product') {
            $s = $db->prepare("SELECT nama FROM products WHERE id = ?");
            $s->execute([$link['related_id']]);
            if ($row = $s->fetch()) $link['target_title'] = $row['nama'];
        } elseif (in_array($link['related_type'], ['post', 'portfolio', 'news'])) {
            $s = $db->prepare("SELECT title FROM posts WHERE id = ?");
            $s->execute([$link['related_id']]);
            if ($row = $s->fetch()) $link['target_title'] = $row['title'];
        }
    }

    jsonSuccess(['data' => $links]);
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $db->prepare("DELETE FROM gallery_related_links WHERE id = ?");
        $stmt->execute([$id]);
        jsonSuccess(['message' => 'Deleted successfully']);
    }

    if ($action === 'add') {
        $gallery_id = (int)($_POST['gallery_id'] ?? 0);
        $related_type = trim($_POST['related_type'] ?? '');
        $related_id = (int)($_POST['related_id'] ?? 0);
        $external_url = trim($_POST['external_url'] ?? '');
        $external_title = trim($_POST['external_title'] ?? '');
        $sort_order = (int)($_POST['sort_order'] ?? 0);

        if ($gallery_id <= 0 || empty($related_type)) {
            jsonError(400, 'Invalid input parameters');
        }

        $stmt = $db->prepare("INSERT INTO gallery_related_links (gallery_id, related_type, related_id, external_url, external_title, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $gallery_id, 
            $related_type, 
            $related_type === 'external' ? null : $related_id,
            $related_type === 'external' ? $external_url : null,
            $related_type === 'external' ? $external_title : null,
            $sort_order
        ]);
        jsonSuccess(['message' => 'Link added successfully', 'id' => $db->lastInsertId()]);
    }
}

jsonError(405, 'Method not allowed');
