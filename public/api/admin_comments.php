<?php
/**
 * Admin Comments API — Ateka Tehnik
 *
 * GET    /api/admin_comments.php?status=pending    — List comments by status + stats
 * PUT    /api/admin_comments.php?id=X              — Update comment status
 * DELETE /api/admin_comments.php?id=X              — Delete comment
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {

    case 'GET':
        // Stats
        $statsStmt = $db->query("
            SELECT 
                SUM(status = 'pending') as pending,
                SUM(status = 'approved') as approved,
                SUM(status = 'spam') as spam
            FROM post_comments
        ");
        $stats = $statsStmt->fetch();
        $stats = [
            'pending'  => (int) ($stats['pending'] ?? 0),
            'approved' => (int) ($stats['approved'] ?? 0),
            'spam'     => (int) ($stats['spam'] ?? 0),
        ];

        // Filter by status
        $status = $_GET['status'] ?? 'pending';
        if (!in_array($status, ['pending', 'approved', 'spam'])) {
            $status = 'pending';
        }

        $search = trim($_GET['search'] ?? '');

        $conditions = ["status = :status"];
        $params = [':status' => $status];

        if ($search) {
            $conditions[] = "(user_name LIKE :search OR comment_text LIKE :search2 OR post_slug LIKE :search3 OR ip_address LIKE :search4)";
            $params[':search']  = "%$search%";
            $params[':search2'] = "%$search%";
            $params[':search3'] = "%$search%";
            $params[':search4'] = "%$search%";
        }

        $whereClause = 'WHERE ' . implode(' AND ', $conditions);

        $stmt = $db->prepare("
            SELECT id, post_slug, user_name, is_anonymous, comment_text, ip_address, status, created_at
            FROM post_comments
            $whereClause
            ORDER BY created_at DESC
        ");
        $stmt->execute($params);
        $comments = $stmt->fetchAll();

        jsonSuccess([
            'comments' => $comments,
            'stats'    => $stats,
        ]);
        break;

    case 'PUT':
        $user = requireAuth();
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;
        if (!$id) jsonError(400, 'Comment ID required.');

        $input = getJsonInput();
        $newStatus = trim($input['status'] ?? '');

        if (!in_array($newStatus, ['pending', 'approved', 'spam'])) {
            jsonError(400, 'Invalid status. Use: pending, approved, spam.');
        }

        $stmt = $db->prepare("UPDATE post_comments SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $newStatus, ':id' => $id]);

        if ($stmt->rowCount() === 0) {
            jsonError(404, 'Comment not found.');
        }

        logActivity('update_comment', 'comment', $id, "Changed comment status to: $newStatus", $user['user_id']);
        jsonSuccess([], "Comment status updated to $newStatus.");
        break;

    case 'DELETE':
        $user = requireAuth();
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;
        if (!$id) jsonError(400, 'Comment ID required.');

        $stmt = $db->prepare("DELETE FROM post_comments WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            jsonError(404, 'Comment not found.');
        }

        logActivity('delete_comment', 'comment', $id, 'Deleted comment permanently.', $user['user_id']);
        jsonSuccess([], 'Comment deleted.');
        break;

    default:
        jsonError(405, 'Method not allowed.');
}
