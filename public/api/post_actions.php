<?php
/**
 * Post Actions API — Ateka Tehnik
 *
 * Public endpoints for post engagement (likes, comments, stats).
 *
 * GET  /api/post_actions.php?slug=X                  — Get engagement data (views, likes, comments)
 * POST /api/post_actions.php?action=like&slug=X       — Toggle like (by IP)
 * POST /api/post_actions.php?action=comment&slug=X    — Add comment (pending admin approval)
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$slug = trim($_GET['slug'] ?? '');
$action = trim($_GET['action'] ?? '');
$db = getDB();

if (empty($slug)) {
    jsonError(400, 'slug parameter is required.');
}

// ── GET: Retrieve engagement data ────────────────────────────────────
if ($method === 'GET') {

    // View count
    $vStmt = $db->prepare("SELECT COUNT(*) FROM page_views WHERE page_type = 'post' AND page_slug = :slug");
    $vStmt->execute([':slug' => $slug]);
    $views = (int) $vStmt->fetchColumn();

    // Like count
    $lStmt = $db->prepare("SELECT COUNT(*) FROM post_likes WHERE post_slug = :slug");
    $lStmt->execute([':slug' => $slug]);
    $likeCount = (int) $lStmt->fetchColumn();

    // Check if current user (by IP) has liked
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }

    $myLikeStmt = $db->prepare("SELECT COUNT(*) FROM post_likes WHERE post_slug = :slug AND ip_address = :ip");
    $myLikeStmt->execute([':slug' => $slug, ':ip' => $ip]);
    $isLiked = (int) $myLikeStmt->fetchColumn() > 0;

    // Comments (only approved ones for public)
    $cStmt = $db->prepare("
        SELECT id, user_name, is_anonymous, comment_text, created_at
        FROM post_comments
        WHERE post_slug = :slug AND status = 'approved'
        ORDER BY created_at DESC
    ");
    $cStmt->execute([':slug' => $slug]);
    $comments = $cStmt->fetchAll();

    // Format comments for frontend
    $formattedComments = array_map(function ($c) {
        return [
            'id' => (int) $c['id'],
            'user' => $c['is_anonymous'] ? 'Anonymous' : $c['user_name'],
            'text' => $c['comment_text'],
            'date' => date('M d, Y', strtotime($c['created_at'])),
        ];
    }, $comments);

    jsonSuccess([
        'views'    => $views,
        'likes'    => $likeCount,
        'isLiked'  => $isLiked,
        'comments' => $formattedComments,
    ]);
}

// ── POST: Like or Comment ────────────────────────────────────────────
if ($method === 'POST') {

    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }

    // ── Like Toggle ──────────────────────────────────────────────────
    if ($action === 'like') {

        // Check if already liked
        $check = $db->prepare("SELECT id FROM post_likes WHERE post_slug = :slug AND ip_address = :ip");
        $check->execute([':slug' => $slug, ':ip' => $ip]);
        $existing = $check->fetch();

        if ($existing) {
            // Unlike
            $db->prepare("DELETE FROM post_likes WHERE id = :id")->execute([':id' => $existing['id']]);
            $isLiked = false;
        } else {
            // Like
            $db->prepare("INSERT INTO post_likes (post_slug, ip_address) VALUES (:slug, :ip)")
                ->execute([':slug' => $slug, ':ip' => $ip]);
            $isLiked = true;
        }

        // Get updated count
        $countStmt = $db->prepare("SELECT COUNT(*) FROM post_likes WHERE post_slug = :slug");
        $countStmt->execute([':slug' => $slug]);
        $likeCount = (int) $countStmt->fetchColumn();

        jsonSuccess([
            'likes'   => $likeCount,
            'isLiked' => $isLiked,
        ], $isLiked ? 'Post liked.' : 'Like removed.');
    }

    // ── Add Comment ──────────────────────────────────────────────────
    if ($action === 'comment') {

        $input = getJsonInput();

        $userName = trim($input['user_name'] ?? '');
        $isAnonymous = (bool) ($input['is_anonymous'] ?? false);
        $commentText = trim($input['comment_text'] ?? '');

        if (empty($commentText)) {
            jsonError(400, 'Comment text is required.');
        }

        // If anonymous, override name
        if ($isAnonymous) {
            $userName = 'Anonymous';
        } elseif (empty($userName)) {
            jsonError(400, 'Name is required when not posting anonymously.');
        }

        try {
            $stmt = $db->prepare("
                INSERT INTO post_comments (post_slug, user_name, is_anonymous, comment_text, ip_address, status)
                VALUES (:slug, :name, :anon, :text, :ip, 'pending')
            ");
            $stmt->execute([
                ':slug' => $slug,
                ':name' => $userName,
                ':anon' => $isAnonymous ? 1 : 0,
                ':text' => $commentText,
                ':ip'   => $ip,
            ]);

            jsonSuccess([], 'Comment submitted! It will appear after admin approval.');

        } catch (\Exception $e) {
            jsonError(500, 'Failed to submit comment: ' . $e->getMessage());
        }
    }

    jsonError(400, 'Invalid action. Use "like" or "comment".');
}

jsonError(405, 'Method not allowed.');
