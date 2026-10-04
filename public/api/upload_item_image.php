<?php
require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    jsonError('No file uploaded or upload error');
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 2 * 1024 * 1024; // 2MB

if (!in_array($file['type'], $allowedTypes)) {
    jsonError('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.');
}

if ($file['size'] > $maxSize) {
    jsonError('File size exceeds 2MB limit.');
}

$uploadDir = __DIR__ . '/../uploads/rab/items/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('item_') . '_' . time() . '.' . $ext;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Return absolute URL with domain
    $url = 'https://atekatehnik.com/uploads/rab/items/' . $filename;
    jsonSuccess(['url' => $url]);
} else {
    jsonError('Failed to move uploaded file');
}
