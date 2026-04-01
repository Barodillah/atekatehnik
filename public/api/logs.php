<?php
/**
 * Activity Logs API — Ateka Tehnik Admin Backend
 * 
 * Endpoints:
 *   GET /api/logs.php             — List activity logs (paginated)
 *   GET /api/logs.php?action=stats — Get log summary statistics
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$user   = requireAuth();
$action = $_GET['action'] ?? '';
$db     = getDB();

// ── Stats ────────────────────────────────────────────────────────────
if ($action === 'stats') {
    // Counts by entity type
    $byEntity = $db->query("
        SELECT entity_type, COUNT(*) as count 
        FROM activity_logs 
        GROUP BY entity_type 
        ORDER BY count DESC
    ")->fetchAll();

    // Counts by action (last 30 days)
    $byAction = $db->query("
        SELECT action, COUNT(*) as count 
        FROM activity_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
        GROUP BY action 
        ORDER BY count DESC
    ")->fetchAll();

    // Total today
    $today = (int)$db->query("
        SELECT COUNT(*) FROM activity_logs WHERE DATE(created_at) = CURDATE()
    ")->fetchColumn();

    // Total all-time
    $totalAll = (int)$db->query("SELECT COUNT(*) FROM activity_logs")->fetchColumn();

    jsonSuccess([
        'stats' => [
            'total_all'   => $totalAll,
            'today'       => $today,
            'by_entity'   => $byEntity,
            'by_action'   => $byAction,
        ]
    ]);
}

// ── List Logs ────────────────────────────────────────────────────────
$search     = trim($_GET['search'] ?? '');
$entityType = trim($_GET['entity_type'] ?? '');
$page       = max(1, (int)($_GET['page'] ?? 1));
$limit      = min(100, max(1, (int)($_GET['limit'] ?? 20)));
$offset     = ($page - 1) * $limit;

$conditions = [];
$params     = [];

if ($search) {
    $conditions[] = "(l.action LIKE :search OR l.details LIKE :search2 OR u.name LIKE :search3)";
    $params[':search']  = "%$search%";
    $params[':search2'] = "%$search%";
    $params[':search3'] = "%$search%";
}
if ($entityType) {
    $conditions[] = "l.entity_type = :etype";
    $params[':etype'] = $entityType;
}

$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

$countStmt = $db->prepare("SELECT COUNT(*) FROM activity_logs l LEFT JOIN admin_users u ON u.id = l.user_id $where");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

$sql = "
    SELECT l.*, u.name AS user_name, u.email AS user_email 
    FROM activity_logs l 
    LEFT JOIN admin_users u ON u.id = l.user_id 
    $where 
    ORDER BY l.created_at DESC 
    LIMIT :limit OFFSET :offset
";
$stmt = $db->prepare($sql);
foreach ($params as $k => $v) $stmt->bindValue($k, $v);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$logs = $stmt->fetchAll();

jsonSuccess([
    'logs'       => $logs,
    'total'      => $total,
    'page'       => $page,
    'limit'      => $limit,
    'totalPages' => ceil($total / $limit),
]);
