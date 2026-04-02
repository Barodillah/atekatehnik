<?php
/**
 * Activity Logs API — Ateka Tehnik
 *
 * GET /api/activity_logs.php
 * Fetch paginated activity logs for the admin dashboard.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();
requireMethod('GET');

$user = requireAuth();
$db = getDB();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

$search = trim($_GET['search'] ?? '');
$entityType = trim($_GET['entity_type'] ?? '');

$conditions = [];
$params = [];

if ($search) {
    $conditions[] = "(action LIKE :search OR details LIKE :search)";
    $params[':search'] = "%$search%";
}

if ($entityType) {
    if ($entityType === 'comment') {
         // Some comment actions are e.g. "approve_comment" but entity might be "post" or "comment", adjust if needed
         $conditions[] = "action LIKE '%comment%'";
    } else {
        $conditions[] = "entity_type = :entity";
        $params[':entity'] = $entityType;
    }
}

$whereClause = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

// Get total count
$countSql = "SELECT COUNT(*) FROM activity_logs $whereClause";
$countStmt = $db->prepare($countSql);
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// Fetch rows with join to admin_users to get the name if possible. 
// Assuming user_id refers to admin_users.id. We'll LEFT JOIN in case it's null.
$sql = "
    SELECT a.*, u.name as user_name 
    FROM activity_logs a 
    LEFT JOIN admin_users u ON a.user_id = u.id 
    $whereClause 
    ORDER BY a.created_at DESC 
    LIMIT :limit OFFSET :offset
";

$stmt = $db->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
$stmt->execute();
$logs = $stmt->fetchAll();

jsonSuccess([
    'logs' => $logs,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'totalPages' => ceil($total / $limit)
]);
