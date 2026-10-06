<?php
require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$user = requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $is_template = isset($_GET['is_template']) ? $_GET['is_template'] : null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT q.*, l.name as lead_name, l.company as lead_company, l.location as lead_location, l.phone as lead_phone FROM quotations q LEFT JOIN leads l ON q.lead_id = l.id WHERE q.id = ?");
        $stmt->execute([$id]);
        $quotation = $stmt->fetch();

        if ($quotation) {
            $quotation['cover_advantages'] = json_decode($quotation['cover_advantages'], true);
            
            // Get items
            $itemStmt = $pdo->prepare("SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC");
            $itemStmt->execute([$id]);
            $quotation['items'] = $itemStmt->fetchAll();
            
            jsonSuccess(['quotation' => $quotation]);
        } else {
            jsonError(404, 'Quotation not found');
        }
    } else {
        $sql = "SELECT q.*, l.name as lead_name, l.company as lead_company 
                FROM quotations q 
                LEFT JOIN leads l ON q.lead_id = l.id ";
        $params = [];
        
        $where_clauses = [];
        if ($is_template !== null) {
            $where_clauses[] = "q.is_template = ?";
            $params[] = $is_template;
        }
        
        $lead_id = $_GET['lead_id'] ?? null;
        if ($lead_id !== null) {
            $where_clauses[] = "q.lead_id = ?";
            $params[] = $lead_id;
        }

        if (!empty($where_clauses)) {
            $sql .= " WHERE " . implode(' AND ', $where_clauses);
        }
        
        $sql .= " ORDER BY q.updated_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $quotations = $stmt->fetchAll();
        
        // Optionally count items for each
        foreach($quotations as &$q) {
            $q['cover_advantages'] = json_decode($q['cover_advantages'], true);
            
            $iStmt = $pdo->prepare("SELECT count(*) as total FROM quotation_items WHERE quotation_id = ?");
            $iStmt->execute([$q['id']]);
            $q['item_count'] = $iStmt->fetchColumn();
        }
        
        jsonSuccess(['quotations' => $quotations]);
    }
} 
elseif ($method === 'POST' || $method === 'PUT') {
    $data = getJsonInput();
    
    if (!$data) {
        jsonError(400, 'Invalid input');
    }
    
    $is_template = isset($data['is_template']) ? (int)$data['is_template'] : 0;
    
    $template_name = $data['template_name'] ?? null;
    $lead_id = !empty($data['lead_id']) ? $data['lead_id'] : null;
    $quotation_number = !empty($data['quotation_number']) ? $data['quotation_number'] : null;
    $title = $data['title'] ?? 'Draft Penawaran';
    $capacity_label = $data['capacity_label'] ?? null;
    $quotation_date = !empty($data['quotation_date']) ? $data['quotation_date'] : date('Y-m-d');
    $valid_until = !empty($data['valid_until']) ? $data['valid_until'] : null;
    $cover_title = $data['cover_title'] ?? null;
    $cover_description = $data['cover_description'] ?? null;
    $cover_advantages = isset($data['cover_advantages']) ? json_encode($data['cover_advantages']) : null;
    $cover_image_url = $data['cover_image_url'] ?? null;
    $subtotal = $data['subtotal'] ?? 0;
    $installation_fee = $data['installation_fee'] ?? 0;
    $shipping_fee = $data['shipping_fee'] ?? 0;
    $discount_amount = $data['discount_amount'] ?? 0;
    $use_tax = isset($data['use_tax']) ? (int)$data['use_tax'] : 0;
    $tax_amount = $data['tax_amount'] ?? 0;
    $grand_total = $data['grand_total'] ?? 0;
    $terms_conditions = $data['terms_conditions'] ?? null;
    $status = $data['status'] ?? 'draft';
    
    $items = $data['items'] ?? [];

    try {
        $pdo->beginTransaction();

        if (empty($quotation_number) && !$is_template) {
            // Generate a unique quotation number
            // Format: {No_Urut}/ATK.S.PN/{Bulan_Romawi}/{Tahun}
            $year = date('Y');
            $month = date('n'); // 1 to 12
            $romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            $romanMonth = $romans[$month - 1];
            
            $suffix = "/ATK.S.PN/{$romanMonth}/{$year}";
            
            $stmt = $pdo->prepare("SELECT quotation_number FROM quotations WHERE quotation_number LIKE ? ORDER BY id DESC LIMIT 1");
            $stmt->execute(['%' . $suffix]);
            $lastQuotation = $stmt->fetchColumn();
            
            if ($lastQuotation) {
                $parts = explode('/', $lastQuotation);
                $lastNum = (int)$parts[0];
                $nextNum = str_pad($lastNum + 1, 2, '0', STR_PAD_LEFT);
            } else {
                $nextNum = '01';
            }
            $quotation_number = $nextNum . $suffix;
        }

        if ($method === 'POST') {
            $sql = "INSERT INTO quotations 
                    (is_template, template_name, lead_id, quotation_number, title, capacity_label, quotation_date, valid_until, cover_title, cover_description, cover_advantages, cover_image_url, subtotal, installation_fee, shipping_fee, discount_amount, use_tax, tax_amount, grand_total, terms_conditions, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $is_template, $template_name, $lead_id, $quotation_number, $title, $capacity_label, $quotation_date, $valid_until, $cover_title, $cover_description, $cover_advantages, $cover_image_url, $subtotal, $installation_fee, $shipping_fee, $discount_amount, $use_tax, $tax_amount, $grand_total, $terms_conditions, $status
            ]);
            $quotation_id = $pdo->lastInsertId();
        } else {
            $quotation_id = $_GET['id'] ?? null;
            if (!$quotation_id) jsonError(400, 'ID required for PUT');

            $sql = "UPDATE quotations SET 
                    is_template=?, template_name=?, lead_id=?, quotation_number=?, title=?, capacity_label=?, quotation_date=?, valid_until=?, cover_title=?, cover_description=?, cover_advantages=?, cover_image_url=?, subtotal=?, installation_fee=?, shipping_fee=?, discount_amount=?, use_tax=?, tax_amount=?, grand_total=?, terms_conditions=?, status=?, updated_at=NOW()
                    WHERE id=?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $is_template, $template_name, $lead_id, $quotation_number, $title, $capacity_label, $quotation_date, $valid_until, $cover_title, $cover_description, $cover_advantages, $cover_image_url, $subtotal, $installation_fee, $shipping_fee, $discount_amount, $use_tax, $tax_amount, $grand_total, $terms_conditions, $status, $quotation_id
            ]);
            
            // Delete existing items
            $pdo->prepare("DELETE FROM quotation_items WHERE quotation_id = ?")->execute([$quotation_id]);
        }

        // Insert items
        if (!empty($items) && is_array($items)) {
            $itemSql = "INSERT INTO quotation_items 
                        (quotation_id, item_id, name, specifications, description, image_url, qty, unit, price, show_on_cover, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $itemStmt = $pdo->prepare($itemSql);
            
            $sort = 0;
            foreach ($items as $item) {
                $item_id = isset($item['item_id']) ? $item['item_id'] : null;
                $show_on_cover = isset($item['showOnCover']) ? (int)$item['showOnCover'] : 0;
                
                $itemStmt->execute([
                    $quotation_id,
                    $item_id,
                    $item['name'] ?? '',
                    $item['specifications'] ?? '',
                    $item['description'] ?? '',
                    $item['image_url'] ?? '',
                    $item['qty'] ?? 1,
                    $item['unit'] ?? 'Unit',
                    $item['price'] ?? 0,
                    $show_on_cover,
                    $sort
                ]);
                $sort++;
            }
        }

        $pdo->commit();
        
        $action = ($method === 'POST') ? 'create' : 'update';
        $descType = $is_template ? "Template RAB" : "RAB";
        $descName = $is_template ? $template_name : $quotation_number;
        logActivity($action, 'rab', $quotation_id, "Menyimpan $descType: $descName", $user['user_id'] ?? null);

        jsonSuccess([
            'message' => 'Quotation saved successfully', 
            'id' => $quotation_id,
            'quotation_number' => $quotation_number
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonError(500, 'Failed to save quotation: ' . $e->getMessage());
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) jsonError(400, 'ID required');

    try {
        $stmt = $pdo->prepare("SELECT quotation_number, template_name, is_template FROM quotations WHERE id = ?");
        $stmt->execute([$id]);
        $rabInfo = $stmt->fetch();

        $pdo->beginTransaction();
        $pdo->prepare("DELETE FROM quotation_items WHERE quotation_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM quotations WHERE id = ?")->execute([$id]);
        $pdo->commit();
        
        if ($rabInfo) {
            $descType = $rabInfo['is_template'] ? "Template RAB" : "RAB";
            $descName = $rabInfo['is_template'] ? $rabInfo['template_name'] : $rabInfo['quotation_number'];
            logActivity('delete', 'rab', $id, "Menghapus $descType: $descName", $user['user_id'] ?? null);
        }

        jsonSuccess(['message' => 'Quotation deleted successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonError(500, 'Failed to delete quotation');
    }
} else {
    jsonError(405, 'Method not allowed');
}
