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
    
    // Fetch all gallery items, ordered by sort_order and then created_at
    $stmt = $db->query("
        SELECT id, type, src, title, height_class as height
        FROM galleries
        ORDER BY sort_order ASC, created_at DESC
    ");
    
    $galleries = $stmt->fetchAll();
    
    jsonSuccess([
        'galleries' => $galleries,
        'total' => count($galleries)
    ]);
} catch (PDOException $e) {
    jsonError(500, 'Database error: ' . $e->getMessage());
}
