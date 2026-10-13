<?php
/**
 * Departemen Endpoint — Ateka Tehnik Internal Payroll System
 * 
 * Menangani operasi CRUD departemen/divisi pada database `ateka_internal`.
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

$db = getInternalDB();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("
                SELECT id, name, description, is_default, sort_order, created_at, updated_at
                FROM salary_departments
                ORDER BY sort_order ASC, name ASC
            ");
            $rows = $stmt->fetchAll();
            jsonSuccess(['departments' => $rows]);
            break;

        case 'POST':
            $body = getJsonInput();
            $name = strtoupper(trim($body['name'] ?? ''));
            $desc = trim($body['description'] ?? '');
            $sort = (int)($body['sort_order'] ?? 0);

            if (empty($name)) {
                jsonError(400, 'Nama departemen tidak boleh kosong.');
            }

            // Cek duplikasi
            $check = $db->prepare("SELECT id FROM salary_departments WHERE name = :name LIMIT 1");
            $check->execute([':name' => $name]);
            if ($check->fetch()) {
                jsonError(409, "Departemen '{$name}' sudah terdaftar.");
            }

            $stmt = $db->prepare("
                INSERT INTO salary_departments (name, description, sort_order)
                VALUES (:name, :desc, :sort)
            ");
            $stmt->execute([
                ':name' => $name,
                ':desc' => $desc,
                ':sort' => $sort,
            ]);
            $newId = (int)$db->lastInsertId();

            jsonSuccess([
                'id' => $newId,
                'department' => [
                    'id'          => $newId,
                    'name'        => $name,
                    'description' => $desc,
                    'sort_order'  => $sort,
                ]
            ], 'Departemen berhasil ditambahkan.');
            break;

        case 'PUT':
            $body = getJsonInput();
            $id = (int)($body['id'] ?? ($_GET['id'] ?? 0));
            $name = strtoupper(trim($body['name'] ?? ''));
            $desc = trim($body['description'] ?? '');
            $sort = isset($body['sort_order']) ? (int)$body['sort_order'] : null;

            if ($id <= 0 || empty($name)) {
                jsonError(400, 'ID dan Nama departemen wajib diisi.');
            }

            // Ambil data lama
            $current = $db->prepare("SELECT id, name FROM salary_departments WHERE id = :id LIMIT 1");
            $current->execute([':id' => $id]);
            $oldDept = $current->fetch();
            if (!$oldDept) {
                jsonError(404, 'Departemen tidak ditemukan.');
            }

            // Cek duplikasi jika nama berubah
            if ($oldDept['name'] !== $name) {
                $check = $db->prepare("SELECT id FROM salary_departments WHERE name = :name AND id != :id LIMIT 1");
                $check->execute([':name' => $name, ':id' => $id]);
                if ($check->fetch()) {
                    jsonError(409, "Departemen '{$name}' sudah digunakan.");
                }
            }

            $db->beginTransaction();
            if ($sort !== null) {
                $stmt = $db->prepare("
                    UPDATE salary_departments 
                    SET name = :name, description = :desc, sort_order = :sort
                    WHERE id = :id
                ");
                $stmt->execute([':name' => $name, ':desc' => $desc, ':sort' => $sort, ':id' => $id]);
            } else {
                $stmt = $db->prepare("
                    UPDATE salary_departments 
                    SET name = :name, description = :desc
                    WHERE id = :id
                ");
                $stmt->execute([':name' => $name, ':desc' => $desc, ':id' => $id]);
            }

            // Cascade update ke employees jika nama departemen berubah
            if ($oldDept['name'] !== $name) {
                $updateEmp = $db->prepare("
                    UPDATE employees 
                    SET department_name = :newName 
                    WHERE department_id = :id OR department_name = :oldName
                ");
                $updateEmp->execute([
                    ':newName' => $name,
                    ':id'      => $id,
                    ':oldName' => $oldDept['name'],
                ]);

                // Cascade update ke snapshot salary_records
                $updateRec = $db->prepare("
                    UPDATE salary_records 
                    SET snapshot_department = :newName 
                    WHERE snapshot_department = :oldName
                ");
                $updateRec->execute([
                    ':newName' => $name,
                    ':oldName' => $oldDept['name'],
                ]);
            }

            $db->commit();
            jsonSuccess([], 'Departemen dan data terkait berhasil diperbarui.');
            break;

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                jsonError(400, 'Parameter ID departemen wajib diberikan.');
            }

            // Cek apakah ada karyawan yang terikat
            $empCheck = $db->prepare("SELECT COUNT(*) FROM employees WHERE department_id = :id AND is_active = 1");
            $empCheck->execute([':id' => $id]);
            $empCount = (int)$empCheck->fetchColumn();
            if ($empCount > 0) {
                jsonError(400, "Tidak dapat menghapus departemen karena masih memiliki {$empCount} karyawan aktif.");
            }

            $stmt = $db->prepare("DELETE FROM salary_departments WHERE id = :id");
            $stmt->execute([':id' => $id]);

            jsonSuccess([], 'Departemen berhasil dihapus.');
            break;

        default:
            jsonError(405, 'Metode HTTP tidak didukung.');
    }
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonError(500, 'Terjadi kesalahan sistem: ' . $e->getMessage());
}
