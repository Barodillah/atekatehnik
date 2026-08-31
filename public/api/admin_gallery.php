<?php
/**
 * Admin Gallery API
 * POST, GET, DELETE gallery items.
 */

require_once __DIR__ . '/helpers.php';

$adminUser = requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM galleries ORDER BY sort_order ASC, created_at DESC");
    jsonSuccess(['data' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        
        // Find existing to delete file if it's local
        $stmt = $db->prepare("SELECT src FROM galleries WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $src = $row['src'];
            if (strpos($src, 'https://atekatehnik.com/uploads/') === 0) {
                $fileName = str_replace('https://atekatehnik.com/uploads/', '', $src);
                $filePath = __DIR__ . '/../uploads/' . $fileName;
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            } elseif (strpos($src, '/uploads/') === 0) {
                $filePath = __DIR__ . '/..' . $src;
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }
        }

        $stmt = $db->prepare("DELETE FROM galleries WHERE id = ?");
        $stmt->execute([$id]);
        jsonSuccess(['message' => 'Deleted successfully']);
    }

    // Handle Create/Update
    $id = (int)($_POST['id'] ?? 0);
    $type = $_POST['type'] ?? 'image';
    $title = trim($_POST['title'] ?? '');
    $height_class = $_POST['height_class'] ?? 'aspect-square';
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    $src = trim($_POST['src'] ?? '');

    // Handle File Upload
    if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $tmpName = $_FILES['media']['tmp_name'];
        $name = basename($_FILES['media']['name']);
        
        // Sanitize filename
        $name = preg_replace('/[^a-zA-Z0-9.\-_]/', '', $name);
        $name = time() . '_' . $name;
        
        $destPath = $uploadDir . $name;
        if (move_uploaded_file($tmpName, $destPath)) {
            $src = 'https://atekatehnik.com/uploads/' . $name;
            
            // Auto detect type if not passed
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (in_array($ext, ['mp4', 'webm', 'ogg'])) {
                $type = 'video';
            } else {
                $type = 'image';
            }
        }
    }

    if (empty($src)) {
        jsonError(400, 'Image/Video source is required');
    }

    if ($id > 0) {
        // Update
        $stmt = $db->prepare("UPDATE galleries SET type=?, src=?, title=?, height_class=?, sort_order=? WHERE id=?");
        $stmt->execute([$type, $src, $title, $height_class, $sort_order, $id]);
        jsonSuccess(['message' => 'Updated successfully', 'src' => $src]);
    } else {
        // Insert
        $stmt = $db->prepare("INSERT INTO galleries (type, src, title, height_class, sort_order) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$type, $src, $title, $height_class, $sort_order]);
        jsonSuccess(['message' => 'Created successfully', 'id' => $db->lastInsertId(), 'src' => $src]);
    }
}

jsonError(405, 'Method not allowed');
