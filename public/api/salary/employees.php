<?php
/**
 * Master Karyawan Endpoint — Ateka Tehnik Internal Payroll System
 * 
 * Menangani operasi CRUD master karyawan pada database `ateka_internal`.
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

$db = getInternalDB();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/**
 * Generate kode karyawan berikutnya (format ATK-001, ATK-002, dst)
 */
function generateNextEmployeeCode(PDO $db): string {
    $stmt = $db->query("SELECT employee_code FROM employees WHERE employee_code LIKE 'ATK-%'");
    $codes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $maxNum = 0;
    foreach ($codes as $c) {
        if (preg_match('/^ATK-(\d+)$/i', $c, $matches)) {
            $num = (int)$matches[1];
            if ($num > $maxNum) {
                $maxNum = $num;
            }
        }
    }
    return 'ATK-' . str_pad($maxNum + 1, 3, '0', STR_PAD_LEFT);
}

try {
    switch ($method) {
        case 'GET':
            $deptFilter = $_GET['department_id'] ?? ($_GET['department'] ?? '');
            $search     = trim($_GET['search'] ?? '');
            $activeOnly = isset($_GET['active_only']) && $_GET['active_only'] === '1';

            $sql = "
                SELECT e.id, e.employee_code, e.id_absen, e.name, 
                       e.department_id, e.department_name,
                       e.daily_salary, e.trip_allowance, e.phone, e.is_active,
                       e.created_at, e.updated_at
                FROM employees e
                WHERE 1=1
            ";
            $params = [];

            if (!empty($deptFilter) && $deptFilter !== 'ALL') {
                if (is_numeric($deptFilter)) {
                    $sql .= " AND e.department_id = :dept_id";
                    $params[':dept_id'] = (int)$deptFilter;
                } else {
                    $sql .= " AND e.department_name = :dept_name";
                    $params[':dept_name'] = $deptFilter;
                }
            }

            if ($activeOnly) {
                $sql .= " AND e.is_active = 1";
            }

            if (!empty($search)) {
                $sql .= " AND (e.name LIKE :search OR e.employee_code LIKE :search OR e.id_absen LIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }

            // Urut berdasarkan ID atau employee_code
            $sql .= " ORDER BY CAST(e.id_absen AS UNSIGNED) ASC, e.id ASC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $employees = $stmt->fetchAll();

            // Cast tipe data numerik
            foreach ($employees as &$emp) {
                $emp['id'] = (int)$emp['id'];
                $emp['department_id'] = $emp['department_id'] !== null ? (int)$emp['department_id'] : null;
                $emp['daily_salary'] = (float)$emp['daily_salary'];
                $emp['trip_allowance'] = (float)$emp['trip_allowance'];
                $emp['is_active'] = (bool)$emp['is_active'];
                // Alias untuk kompatibilitas frontend
                $emp['department'] = $emp['department_name'];
            }
            unset($emp);

            jsonSuccess(['employees' => $employees]);
            break;

        case 'POST':
            $body = getJsonInput();
            $name = strtoupper(trim($body['name'] ?? ''));
            $idAbsen = trim($body['id_absen'] ?? '');
            $deptId = isset($body['department_id']) && (int)$body['department_id'] > 0 ? (int)$body['department_id'] : null;
            $deptName = strtoupper(trim($body['department_name'] ?? ($body['department'] ?? '')));
            $dailySalary = isset($body['daily_salary']) ? (float)$body['daily_salary'] : 150000.00;
            $tripAllowance = isset($body['trip_allowance']) ? (float)$body['trip_allowance'] : 250000.00;
            $phone = trim($body['phone'] ?? '');
            $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

            if (empty($name)) {
                jsonError(400, 'Nama karyawan wajib diisi.');
            }

            // Cari nama departemen jika deptId ada tapi deptName kosong
            if ($deptId && empty($deptName)) {
                $dStmt = $db->prepare("SELECT name FROM salary_departments WHERE id = :id LIMIT 1");
                $dStmt->execute([':id' => $deptId]);
                $deptName = $dStmt->fetchColumn() ?: 'PRODUKSI';
            } elseif (!empty($deptName) && !$deptId) {
                $dStmt = $db->prepare("SELECT id FROM salary_departments WHERE name = :name LIMIT 1");
                $dStmt->execute([':name' => $deptName]);
                $deptId = $dStmt->fetchColumn() ?: null;
            }

            if (empty($deptName)) {
                $deptName = 'PRODUKSI';
            }

            // Kode karyawan
            $empCode = trim($body['employee_code'] ?? ($body['id'] ?? ''));
            if (empty($empCode) || !str_starts_with($empCode, 'ATK-')) {
                $empCode = generateNextEmployeeCode($db);
            }

            // Cek duplikasi kode
            $cStmt = $db->prepare("SELECT id FROM employees WHERE employee_code = :code LIMIT 1");
            $cStmt->execute([':code' => $empCode]);
            if ($cStmt->fetch()) {
                $empCode = generateNextEmployeeCode($db);
            }

            // Cek duplikasi ID Absen jika diisi
            if (!empty($idAbsen)) {
                $aStmt = $db->prepare("SELECT id, name FROM employees WHERE id_absen = :absen LIMIT 1");
                $aStmt->execute([':absen' => $idAbsen]);
                $existAbsen = $aStmt->fetch();
                if ($existAbsen) {
                    jsonError(409, "ID Absen '{$idAbsen}' sudah digunakan oleh karyawan: {$existAbsen['name']}.");
                }
            }

            $stmt = $db->prepare("
                INSERT INTO employees (
                    employee_code, id_absen, name, department_id, department_name,
                    daily_salary, trip_allowance, phone, is_active
                ) VALUES (
                    :code, :id_absen, :name, :dept_id, :dept_name,
                    :daily, :trip, :phone, :is_active
                )
            ");
            $stmt->execute([
                ':code'      => $empCode,
                ':id_absen'  => !empty($idAbsen) ? $idAbsen : null,
                ':name'      => $name,
                ':dept_id'   => $deptId,
                ':dept_name' => $deptName,
                ':daily'     => $dailySalary,
                ':trip'      => $tripAllowance,
                ':phone'     => !empty($phone) ? $phone : null,
                ':is_active' => $isActive,
            ]);

            $newId = (int)$db->lastInsertId();

            jsonSuccess([
                'id' => $newId,
                'employee' => [
                    'id'             => $newId,
                    'employee_code'  => $empCode,
                    'id_absen'       => $idAbsen,
                    'name'           => $name,
                    'department_id'  => $deptId,
                    'department_name'=> $deptName,
                    'department'     => $deptName,
                    'daily_salary'   => $dailySalary,
                    'trip_allowance' => $tripAllowance,
                    'phone'          => $phone,
                    'is_active'      => (bool)$isActive,
                ]
            ], 'Karyawan berhasil ditambahkan.');
            break;

        case 'PUT':
            $body = getJsonInput();
            $id = (int)($body['id'] ?? ($_GET['id'] ?? 0));
            $name = strtoupper(trim($body['name'] ?? ''));
            $idAbsen = trim($body['id_absen'] ?? '');
            $deptId = isset($body['department_id']) && (int)$body['department_id'] > 0 ? (int)$body['department_id'] : null;
            $deptName = strtoupper(trim($body['department_name'] ?? ($body['department'] ?? '')));
            $dailySalary = isset($body['daily_salary']) ? (float)$body['daily_salary'] : 150000.00;
            $tripAllowance = isset($body['trip_allowance']) ? (float)$body['trip_allowance'] : 250000.00;
            $phone = trim($body['phone'] ?? '');
            $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

            if ($id <= 0 || empty($name)) {
                jsonError(400, 'ID dan Nama karyawan wajib diisi.');
            }

            // Cek data karyawan
            $cStmt = $db->prepare("SELECT id, employee_code FROM employees WHERE id = :id LIMIT 1");
            $cStmt->execute([':id' => $id]);
            $currentEmp = $cStmt->fetch();
            if (!$currentEmp) {
                jsonError(404, 'Data karyawan tidak ditemukan.');
            }

            // Cari nama departemen jika deptId ada
            if ($deptId && empty($deptName)) {
                $dStmt = $db->prepare("SELECT name FROM salary_departments WHERE id = :id LIMIT 1");
                $dStmt->execute([':id' => $deptId]);
                $deptName = $dStmt->fetchColumn() ?: 'PRODUKSI';
            } elseif (!empty($deptName) && !$deptId) {
                $dStmt = $db->prepare("SELECT id FROM salary_departments WHERE name = :name LIMIT 1");
                $dStmt->execute([':name' => $deptName]);
                $deptId = $dStmt->fetchColumn() ?: null;
            }

            // Cek duplikasi ID Absen pada karyawan lain
            if (!empty($idAbsen)) {
                $aStmt = $db->prepare("SELECT id, name FROM employees WHERE id_absen = :absen AND id != :id LIMIT 1");
                $aStmt->execute([':absen' => $idAbsen, ':id' => $id]);
                $existAbsen = $aStmt->fetch();
                if ($existAbsen) {
                    jsonError(409, "ID Absen '{$idAbsen}' sudah digunakan oleh karyawan: {$existAbsen['name']}.");
                }
            }

            $stmt = $db->prepare("
                UPDATE employees
                SET name = :name,
                    id_absen = :id_absen,
                    department_id = :dept_id,
                    department_name = :dept_name,
                    daily_salary = :daily,
                    trip_allowance = :trip,
                    phone = :phone,
                    is_active = :is_active
                WHERE id = :id
            ");
            $stmt->execute([
                ':name'      => $name,
                ':id_absen'  => !empty($idAbsen) ? $idAbsen : null,
                ':dept_id'   => $deptId,
                ':dept_name' => $deptName,
                ':daily'     => $dailySalary,
                ':trip'      => $tripAllowance,
                ':phone'     => !empty($phone) ? $phone : null,
                ':is_active' => $isActive,
                ':id'        => $id,
            ]);

            jsonSuccess([], 'Data karyawan berhasil diperbarui.');
            break;

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);
            $force = isset($_GET['force']) && $_GET['force'] === '1';

            if ($id <= 0) {
                jsonError(400, 'Parameter ID karyawan wajib diberikan.');
            }

            // Cek apakah karyawan memiliki riwayat penggajian
            $recStmt = $db->prepare("SELECT COUNT(*) FROM salary_records WHERE employee_id = :id");
            $recStmt->execute([':id' => $id]);
            $recCount = (int)$recStmt->fetchColumn();

            if ($recCount > 0 && !$force) {
                // Soft delete jika sudah ada riwayat gaji agar integritas data masa lalu tidak rusak
                $update = $db->prepare("UPDATE employees SET is_active = 0 WHERE id = :id");
                $update->execute([':id' => $id]);
                jsonSuccess([], 'Karyawan dinonaktifkan (karena memiliki riwayat penggajian).');
            } else {
                $stmt = $db->prepare("DELETE FROM employees WHERE id = :id");
                $stmt->execute([':id' => $id]);
                jsonSuccess([], 'Data karyawan berhasil dihapus permanen.');
            }
            break;

        default:
            jsonError(405, 'Metode HTTP tidak didukung.');
    }
} catch (Exception $e) {
    jsonError(500, 'Terjadi kesalahan sistem: ' . $e->getMessage());
}
