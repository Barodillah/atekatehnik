<?php
/**
 * Chat History API — Ateka Tehnik Admin Backend
 * 
 * Endpoints:
 *   GET  ?action=sessions          — List chat sessions (admin, paginated)
 *   GET  ?action=messages&session_id=X — Messages for a session (admin)
 *   GET  ?action=stats             — Chat statistics (admin)
 *   GET  ?action=load&session_key=X — Load messages by session_key (public, for widget)
 *   POST ?action=clear             — Clear session: delete messages, create new session_key (public)
 *   DELETE ?id=X                   — Delete a session (admin)
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ── Public endpoints (no auth required) ──────────────────────────────
if ($action === 'load' && $method === 'GET') {
    $sessionKey = $_GET['session_key'] ?? '';
    if (empty($sessionKey)) {
        jsonError(400, 'session_key is required.');
    }

    $db = getDB();

    // Find session
    $stmt = $db->prepare("SELECT id FROM chat_sessions WHERE session_key = :sk LIMIT 1");
    $stmt->execute([':sk' => $sessionKey]);
    $session = $stmt->fetch();

    if (!$session) {
        jsonSuccess(['messages' => []]);
    }

    // Get messages
    $stmt = $db->prepare("SELECT role, content, is_error, sent_at FROM chat_messages WHERE session_id = :sid ORDER BY sent_at ASC, id ASC");
    $stmt->execute([':sid' => $session['id']]);
    $messages = $stmt->fetchAll();

    jsonSuccess(['messages' => $messages]);
}

if ($action === 'clear' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $sessionKey = $input['session_key'] ?? '';

    if (!empty($sessionKey)) {
        $db = getDB();
        // Close the old session
        $stmt = $db->prepare("UPDATE chat_sessions SET status = 'closed', closed_at = NOW() WHERE session_key = :sk");
        $stmt->execute([':sk' => $sessionKey]);
    }

    jsonSuccess(['message' => 'Session cleared.']);
}

// ── Admin endpoints (auth required) ──────────────────────────────────
$user = requireAuth();

// ── GET: Sessions list ───────────────────────────────────────────────
if ($action === 'sessions' && $method === 'GET') {
    $db = getDB();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';

    $where = [];
    $params = [];

    if ($status && in_array($status, ['active', 'closed'])) {
        $where[] = "s.status = :status";
        $params[':status'] = $status;
    }

    if ($search) {
        $where[] = "(s.visitor_ip LIKE :search OR s.page_url LIKE :search2 OR s.session_key LIKE :search3)";
        $params[':search'] = "%$search%";
        $params[':search2'] = "%$search%";
        $params[':search3'] = "%$search%";
    }

    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count total
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM chat_sessions s $whereClause");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetch()['total'];

    // Fetch sessions
    $stmt = $db->prepare("
        SELECT s.*, 
               (SELECT content FROM chat_messages WHERE session_id = s.id AND role = 'user' ORDER BY id ASC LIMIT 1) as first_message
        FROM chat_sessions s
        $whereClause
        ORDER BY s.last_message_at DESC, s.started_at DESC
        LIMIT :limit OFFSET :offset
    ");
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $sessions = $stmt->fetchAll();

    jsonSuccess([
        'sessions' => $sessions,
        'page' => $page,
        'totalPages' => max(1, ceil($total / $limit)),
        'total' => $total,
    ]);
}

// ── GET: Messages for a session ──────────────────────────────────────
if ($action === 'messages' && $method === 'GET') {
    $sessionId = (int) ($_GET['session_id'] ?? 0);
    if ($sessionId <= 0) {
        jsonError(400, 'session_id is required.');
    }

    $db = getDB();

    // Get session info
    $stmt = $db->prepare("SELECT * FROM chat_sessions WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $sessionId]);
    $session = $stmt->fetch();

    if (!$session) {
        jsonError(404, 'Session not found.');
    }

    // Get all messages
    $stmt = $db->prepare("SELECT * FROM chat_messages WHERE session_id = :sid ORDER BY sent_at ASC, id ASC");
    $stmt->execute([':sid' => $sessionId]);
    $messages = $stmt->fetchAll();

    jsonSuccess([
        'session' => $session,
        'messages' => $messages,
    ]);
}

// ── GET: Stats ───────────────────────────────────────────────────────
if ($action === 'stats' && $method === 'GET') {
    $db = getDB();

    $totalSessions = (int) $db->query("SELECT COUNT(*) FROM chat_sessions")->fetchColumn();
    $activeSessions = (int) $db->query("SELECT COUNT(*) FROM chat_sessions WHERE status = 'active'")->fetchColumn();
    $totalMessages = (int) $db->query("SELECT COUNT(*) FROM chat_messages")->fetchColumn();
    $todaySessions = (int) $db->query("SELECT COUNT(*) FROM chat_sessions WHERE DATE(started_at) = CURDATE()")->fetchColumn();

    jsonSuccess([
        'stats' => [
            'totalSessions' => $totalSessions,
            'activeSessions' => $activeSessions,
            'totalMessages' => $totalMessages,
            'todaySessions' => $todaySessions,
        ]
    ]);
}

// ── DELETE: Remove a session ─────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonError(400, 'Session ID is required.');
    }

    $db = getDB();
    $stmt = $db->prepare("DELETE FROM chat_sessions WHERE id = :id");
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        jsonError(404, 'Session not found.');
    }

    logActivity('delete_chat_session', 'chat_session', $id, "Deleted chat session #$id", $user['user_id']);
    jsonSuccess(['message' => 'Session deleted.']);
}

jsonError(400, 'Invalid action or method.');
