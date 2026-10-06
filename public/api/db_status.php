<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

setCorsHeaders();
requireMethod('GET');

try {
    $db = getDB();
    $db->query("SELECT 1");

    $statusData = [
        'status' => 'connected',
        'active_db' => $GLOBALS['db_status_info']['active_db']
    ];
    
    if ($statusData['active_db'] === 'fallback') {
        $statusData['primary_error'] = $GLOBALS['db_status_info']['primary_error'];
    }

    jsonSuccess($statusData);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error_detail' => $e->getMessage()
    ]);
    exit;
}
