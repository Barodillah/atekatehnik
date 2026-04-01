<?php
/**
 * Leads API — Ateka Tehnik Admin Backend
 * 
 * Endpoints:
 *   GET    /api/leads.php               — List all leads (with pagination/search)
 *   GET    /api/leads.php?id=X          — Get single lead
 *   POST   /api/leads.php               — Create new lead
 *   PUT    /api/leads.php?id=X          — Update lead (e.g. status change)
 *   DELETE /api/leads.php?id=X          — Delete lead
 *   GET    /api/leads.php?action=stats  — Get lead statistics
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? '';
$db     = getDB();

// ── Stats Endpoint ───────────────────────────────────────────────────
if ($action === 'stats' && $method === 'GET') {
    $user = requireAuth();

    $total     = (int)$db->query("SELECT COUNT(*) FROM leads")->fetchColumn();
    $newCount  = (int)$db->query("SELECT COUNT(*) FROM leads WHERE status = 'New'")->fetchColumn();
    $followUp  = (int)$db->query("SELECT COUNT(*) FROM leads WHERE status = 'Follow-up'")->fetchColumn();
    $closed    = (int)$db->query("SELECT COUNT(*) FROM leads WHERE status = 'Closed'")->fetchColumn();

    // Conversion rate: closed / total * 100
    $conversionRate = $total > 0 ? round(($closed / $total) * 100, 1) : 0;

    jsonSuccess([
        'stats' => [
            'total'          => $total,
            'new'            => $newCount,
            'follow_up'      => $followUp,
            'closed'         => $closed,
            'conversionRate' => $conversionRate,
        ]
    ]);
}

switch ($method) {

    // ── GET: List or Single ──────────────────────────────────────────
    case 'GET':
        $user = requireAuth();

        if ($id) {
            $stmt = $db->prepare("SELECT * FROM leads WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $lead = $stmt->fetch();
            if (!$lead) jsonError(404, 'Lead not found.');
            jsonSuccess(['lead' => $lead]);
        } else {
            $search = trim($_GET['search'] ?? '');
            $status = trim($_GET['status'] ?? '');
            $page   = max(1, (int)($_GET['page'] ?? 1));
            $limit  = min(50, max(1, (int)($_GET['limit'] ?? 10)));
            $offset = ($page - 1) * $limit;
            $sort   = $_GET['sort'] ?? 'latest';

            $conditions = [];
            $params = [];

            if ($search) {
                $conditions[] = "(name LIKE :search OR company LIKE :search2 OR email LIKE :search3 OR service_request LIKE :search4)";
                $params[':search']  = "%$search%";
                $params[':search2'] = "%$search%";
                $params[':search3'] = "%$search%";
                $params[':search4'] = "%$search%";
            }
            if ($status) {
                $conditions[] = "status = :status";
                $params[':status'] = $status;
            }

            $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

            $orderBy = 'ORDER BY created_at DESC';
            if ($sort === 'status_new') {
                $orderBy = "ORDER BY FIELD(status, 'New', 'Follow-up', 'Closed'), created_at DESC";
            }

            $countStmt = $db->prepare("SELECT COUNT(*) FROM leads $where");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            $sql = "SELECT * FROM leads $where $orderBy LIMIT :limit OFFSET :offset";
            $stmt = $db->prepare($sql);
            foreach ($params as $k => $v) $stmt->bindValue($k, $v);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $leads = $stmt->fetchAll();

            jsonSuccess([
                'leads'      => $leads,
                'total'      => $total,
                'page'       => $page,
                'limit'      => $limit,
                'totalPages' => ceil($total / $limit),
            ]);
        }
        break;

    // ── POST: Create ─────────────────────────────────────────────────
    case 'POST':
        $user  = requireAuth();
        $input = getJsonInput();

        $name           = trim($input['name'] ?? '');
        $company        = trim($input['company'] ?? '');
        $capacityRef    = trim($input['capacity_ref'] ?? '');
        $location       = trim($input['location'] ?? '');
        $email          = trim($input['email'] ?? '');
        $phone          = trim($input['phone'] ?? '');
        $serviceRequest = trim($input['service_request'] ?? '');

        if (empty($name) || empty($email) || empty($phone) || empty($serviceRequest)) {
            jsonError(400, 'name, email, phone, and service_request are required.');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError(400, 'Invalid email address.');
        }

        $stmt = $db->prepare("
            INSERT INTO leads (name, company, capacity_ref, location, email, phone, service_request, status)
            VALUES (:name, :company, :cap, :loc, :email, :phone, :svc, 'New')
        ");
        $stmt->execute([
            ':name'    => $name,
            ':company' => $company,
            ':cap'     => $capacityRef,
            ':loc'     => $location,
            ':email'   => $email,
            ':phone'   => $phone,
            ':svc'     => $serviceRequest,
        ]);
        $leadId = (int)$db->lastInsertId();

        logActivity('create_lead', 'lead', $leadId, "New lead: $name ($company)", $user['user_id']);

        jsonSuccess(['lead_id' => $leadId], 'Lead created successfully.');
        break;

    // ── PUT: Update ──────────────────────────────────────────────────
    case 'PUT':
        $user = requireAuth();
        if (!$id) jsonError(400, 'Lead ID required for update.');

        $exists = $db->prepare("SELECT * FROM leads WHERE id = :id");
        $exists->execute([':id' => $id]);
        $existingLead = $exists->fetch();
        if (!$existingLead) jsonError(404, 'Lead not found.');

        $input = getJsonInput();

        // Build dynamic update
        $fields = [];
        $params = [':id' => $id];

        $updatable = ['name', 'company', 'capacity_ref', 'location', 'email', 'phone', 'service_request', 'status'];
        foreach ($updatable as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = trim($input[$field]);
            }
        }

        if (empty($fields)) {
            jsonError(400, 'No fields provided for update.');
        }

        // Validate status if provided
        if (isset($input['status']) && !in_array($input['status'], ['New', 'Follow-up', 'Closed'])) {
            jsonError(400, 'Invalid status. Use: New, Follow-up, Closed.');
        }

        $sql = "UPDATE leads SET " . implode(', ', $fields) . " WHERE id = :id";
        $db->prepare($sql)->execute($params);

        $changes = implode(', ', array_keys(array_intersect_key($input, array_flip($updatable))));
        logActivity('update_lead', 'lead', $id, "Updated fields: $changes", $user['user_id']);

        jsonSuccess([], 'Lead updated successfully.');
        break;

    // ── DELETE ────────────────────────────────────────────────────────
    case 'DELETE':
        $user = requireAuth();
        if (!$id) jsonError(400, 'Lead ID required for deletion.');

        $exists = $db->prepare("SELECT name, company FROM leads WHERE id = :id");
        $exists->execute([':id' => $id]);
        $lead = $exists->fetch();
        if (!$lead) jsonError(404, 'Lead not found.');

        $db->prepare("DELETE FROM leads WHERE id = :id")->execute([':id' => $id]);

        logActivity('delete_lead', 'lead', $id, "Deleted lead: " . $lead['name'], $user['user_id']);

        jsonSuccess([], 'Lead deleted successfully.');
        break;

    default:
        jsonError(405, 'Method not allowed.');
}
