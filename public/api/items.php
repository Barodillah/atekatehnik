<?php
require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

// Only authenticated users can access item management
$user = requireAuth();

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM items WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$item) {
            jsonError('Item not found', 404);
        }
        jsonSuccess(['item' => $item]);
    } else {
        $search = $_GET['search'] ?? '';
        $category = $_GET['category'] ?? '';
        $page   = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit  = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 20;
        $offset = ($page - 1) * $limit;

        $whereClause = "WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $whereClause .= " AND (name LIKE :search OR sku LIKE :search)";
            $params[':search'] = "%$search%";
        }

        if ($category !== '') {
            $whereClause .= " AND category = :category";
            $params[':category'] = $category;
        }

        $totalStmt = $db->prepare("SELECT COUNT(*) FROM items $whereClause");
        $totalStmt->execute($params);
        $total = $totalStmt->fetchColumn();

        $sql = "SELECT * FROM items $whereClause ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        jsonSuccess([
            'items' => $items,
            'total' => $total,
            'page'  => $page,
            'totalPages' => ceil($total / $limit)
        ]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        jsonError('Invalid input data');
    }

    $sku = trim($data['sku'] ?? '');
    $name = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? 'machine');
    $defaultUnit = trim($data['default_unit'] ?? 'Unit');
    $defaultPrice = (float)($data['default_price'] ?? 0);
    $specifications = trim($data['specifications'] ?? '');
    $description = trim($data['description'] ?? '');
    $imageUrl = trim($data['image_url'] ?? '');
    $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    if (empty($name)) {
        jsonError('Name is required');
    }

    $sql = "INSERT INTO items (sku, name, category, default_unit, default_price, specifications, description, image_url, is_active) 
            VALUES (:sku, :name, :category, :default_unit, :default_price, :specifications, :description, :image_url, :is_active)";
    
    $stmt = $db->prepare($sql);
    try {
        $stmt->execute([
            ':sku' => $sku === '' ? null : $sku,
            ':name' => $name,
            ':category' => $category,
            ':default_unit' => $defaultUnit,
            ':default_price' => $defaultPrice,
            ':specifications' => $specifications,
            ':description' => $description,
            ':image_url' => $imageUrl,
            ':is_active' => $isActive
        ]);
        $newId = $db->lastInsertId();
        jsonSuccess(['message' => 'Item created successfully', 'id' => $newId]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            jsonError('SKU already exists');
        }
        jsonError('Failed to create item: ' . $e->getMessage());
    }
} elseif ($method === 'PUT') {
    if (!$id) {
        jsonError('Item ID is required for update');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        jsonError('Invalid input data');
    }

    $sku = trim($data['sku'] ?? '');
    $name = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? 'machine');
    $defaultUnit = trim($data['default_unit'] ?? 'Unit');
    $defaultPrice = (float)($data['default_price'] ?? 0);
    $specifications = trim($data['specifications'] ?? '');
    $description = trim($data['description'] ?? '');
    $imageUrl = trim($data['image_url'] ?? '');
    $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    if (empty($name)) {
        jsonError('Name is required');
    }

    $sql = "UPDATE items SET 
            sku = :sku, 
            name = :name, 
            category = :category, 
            default_unit = :default_unit, 
            default_price = :default_price, 
            specifications = :specifications, 
            description = :description, 
            image_url = :image_url, 
            is_active = :is_active 
            WHERE id = :id";
            
    $stmt = $db->prepare($sql);
    try {
        $stmt->execute([
            ':sku' => $sku === '' ? null : $sku,
            ':name' => $name,
            ':category' => $category,
            ':default_unit' => $defaultUnit,
            ':default_price' => $defaultPrice,
            ':specifications' => $specifications,
            ':description' => $description,
            ':image_url' => $imageUrl,
            ':is_active' => $isActive,
            ':id' => $id
        ]);
        jsonSuccess(['message' => 'Item updated successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            jsonError('SKU already exists');
        }
        jsonError('Failed to update item: ' . $e->getMessage());
    }
} elseif ($method === 'DELETE') {
    if (!$id) {
        jsonError('Item ID is required for deletion');
    }
    
    $stmt = $db->prepare("DELETE FROM items WHERE id = :id");
    if ($stmt->execute([':id' => $id])) {
        jsonSuccess(['message' => 'Item deleted successfully']);
    } else {
        jsonError('Failed to delete item');
    }
} else {
    jsonError('Method not allowed', 405);
}
