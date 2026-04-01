<?php
/**
 * Authentication API — Ateka Tehnik Admin Backend
 * 
 * Endpoints:
 *   POST /api/auth.php?action=login     — Login with email & password
 *   POST /api/auth.php?action=logout    — Invalidate token
 *   GET  /api/auth.php?action=verify    — Check if token is still valid
 *   POST /api/auth.php?action=setup     — One-time admin user creation (remove after use)
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$action = $_GET['action'] ?? '';

switch ($action) {

    // ── LOGIN ────────────────────────────────────────────────────────
    case 'login':
        requireMethod('POST');
        $input = getJsonInput();

        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            jsonError(400, 'Email and password are required.');
        }

        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM admin_users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonError(401, 'Invalid email or password.');
        }

        // Generate a secure random token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        // Clean old sessions for this user (max 5 active)
        $db->prepare("
            DELETE FROM admin_sessions 
            WHERE user_id = :uid AND id NOT IN (
                SELECT id FROM (
                    SELECT id FROM admin_sessions WHERE user_id = :uid2 ORDER BY created_at DESC LIMIT 4
                ) AS keep
            )
        ")->execute([':uid' => $user['id'], ':uid2' => $user['id']]);

        // Insert new session
        $stmt = $db->prepare("
            INSERT INTO admin_sessions (user_id, token, expires_at)
            VALUES (:uid, :token, :expires)
        ");
        $stmt->execute([
            ':uid'     => $user['id'],
            ':token'   => $token,
            ':expires' => $expiresAt,
        ]);

        logActivity('login', 'auth', $user['id'], "Login from IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), $user['id']);

        jsonSuccess([
            'token' => $token,
            'user'  => [
                'id'    => $user['id'],
                'email' => $user['email'],
                'name'  => $user['name'],
                'role'  => $user['role'],
            ],
            'expires_at' => $expiresAt,
        ], 'Login successful.');
        break;

    // ── LOGOUT ───────────────────────────────────────────────────────
    case 'logout':
        requireMethod('POST');
        $user = requireAuth();

        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        $token  = substr($header, 7);

        $db = getDB();
        $db->prepare("DELETE FROM admin_sessions WHERE token = :token")->execute([':token' => $token]);

        logActivity('logout', 'auth', null, 'User logged out', $user['user_id']);

        jsonSuccess([], 'Logged out successfully.');
        break;

    // ── VERIFY TOKEN ─────────────────────────────────────────────────
    case 'verify':
        requireMethod('GET');
        $user = requireAuth();

        jsonSuccess([
            'user' => [
                'id'    => $user['user_id'],
                'email' => $user['email'],
                'name'  => $user['name'],
                'role'  => $user['role'],
            ]
        ], 'Token is valid.');
        break;

    // ── SETUP (one-time) ─────────────────────────────────────────────
    case 'setup':
        requireMethod('POST');
        $input = getJsonInput();

        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $name     = trim($input['name'] ?? '');

        if (empty($email) || empty($password) || empty($name)) {
            jsonError(400, 'email, password, and name are required.');
        }

        $db = getDB();

        // Check if any admin already exists
        $count = $db->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
        if ($count > 0) {
            jsonError(403, 'Setup already completed. Admin user exists.');
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare("
            INSERT INTO admin_users (email, password_hash, name, role)
            VALUES (:email, :hash, :name, 'superadmin')
        ");
        $stmt->execute([
            ':email' => $email,
            ':hash'  => $hash,
            ':name'  => $name,
        ]);

        logActivity('setup', 'auth', (int) $db->lastInsertId(), "Initial admin created: $email");

        jsonSuccess([], 'Admin user created successfully. You can now login.');
        break;

    default:
        jsonError(400, 'Invalid action. Use: login, logout, verify, or setup.');
}
