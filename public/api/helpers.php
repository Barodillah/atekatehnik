<?php
/**
 * Shared Helpers — Ateka Tehnik Admin Backend
 * 
 * Provides CORS headers, authentication verification,
 * activity logging, and standardized JSON responses.
 */

require_once __DIR__ . '/db.php';

// ── CORS Headers ─────────────────────────────────────────────────────
function setCorsHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ── JSON Response ────────────────────────────────────────────────────
function jsonResponse(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonSuccess(array $data = [], string $message = 'OK'): void {
    jsonResponse(200, array_merge(['success' => true, 'message' => $message], $data));
}

function jsonError(int $status, string $message): void {
    jsonResponse($status, ['success' => false, 'error' => $message]);
}

// ── Parse JSON Body ──────────────────────────────────────────────────
function getJsonInput(): array {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        jsonError(400, 'Invalid or missing JSON body.');
    }
    return $input;
}

// ── Authentication ───────────────────────────────────────────────────
/**
 * Verify Bearer token from Authorization header.
 * Returns the user row on success, terminates with 401 on failure.
 */
function requireAuth(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');

    if (empty($header) || !str_starts_with($header, 'Bearer ')) {
        jsonError(401, 'Authentication required. Send Bearer token.');
    }

    $token = substr($header, 7);
    $db = getDB();

    $stmt = $db->prepare("
        SELECT s.id AS session_id, s.user_id, s.expires_at,
               u.email, u.name, u.role
        FROM admin_sessions s
        JOIN admin_users u ON u.id = s.user_id
        WHERE s.token = :token
        LIMIT 1
    ");
    $stmt->execute([':token' => $token]);
    $session = $stmt->fetch();

    if (!$session) {
        jsonError(401, 'Invalid or expired token.');
    }

    // Check expiry
    if (strtotime($session['expires_at']) < time()) {
        // Clean up expired session
        $db->prepare("DELETE FROM admin_sessions WHERE id = :id")->execute([':id' => $session['session_id']]);
        jsonError(401, 'Token expired. Please login again.');
    }

    return $session;
}

// ── Activity Logging ─────────────────────────────────────────────────
/**
 * Log an admin action to the activity_logs table.
 * 
 * @param string $action      e.g. 'create_product', 'update_lead', 'login'
 * @param string $entityType  e.g. 'product', 'post', 'lead', 'auth'
 * @param int|null $entityId  The ID of the affected record
 * @param string|null $details Extra description text
 * @param int|null $userId    If null, attempts to derive from current auth
 */
function logActivity(string $action, string $entityType, ?int $entityId = null, ?string $details = null, ?int $userId = null): void {
    try {
        $db = getDB();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
            VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip)
        ");
        $stmt->execute([
            ':user_id'     => $userId,
            ':action'      => $action,
            ':entity_type' => $entityType,
            ':entity_id'   => $entityId,
            ':details'     => $details,
            ':ip'          => $ip,
        ]);
    } catch (\Exception $e) {
        // Logging failure should not break the main request
        error_log("Activity log error: " . $e->getMessage());
    }
}

// ── Request Method Check ─────────────────────────────────────────────
function requireMethod(string ...$methods): void {
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods)) {
        jsonError(405, 'Method not allowed. Accepted: ' . implode(', ', $methods));
    }
}
