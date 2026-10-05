<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

setCorsHeaders();
requireMethod('GET');

try {
    $db = getDB();
    $db->query("SELECT 1");
    jsonSuccess(['status' => 'connected']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error_detail' => $e->getMessage()
    ]);
    exit;
}
