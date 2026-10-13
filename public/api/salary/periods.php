<?php
/**
 * Periode Penggajian Endpoint — Ateka Tehnik Internal Payroll System
 * 
 * Menangani siklus periode gaji, agregasi data, serta inisialisasi
 * otomatis baris slip/rekaman gaji karyawan aktif.
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

$db = getInternalDB();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/**
 * Generate kode periode unik (contoh: PER-202610-01)
 */
function generatePeriodCode(PDO $db, string $startDate): string {
    $prefix = 'PER-' . date('Ym', strtotime($startDate ?: 'now'));
    $stmt = $db->prepare("SELECT period_code FROM salary_periods WHERE period_code LIKE :pref ORDER BY id DESC LIMIT 1");
    $stmt->execute([':pref' => $prefix . '%']);
    $last = $stmt->fetchColumn();

    $num = 1;
    if ($last && preg_match('/-(\d+)$/', $last, $m)) {
        $num = ((int)$m[1]) + 1;
    }
    return $prefix . '-' . str_pad($num, 2, '0', STR_PAD_LEFT);
}

try {
    switch ($method) {
        case 'GET':
            $rawId = trim($_GET['id'] ?? '');

            if (!empty($rawId)) {
                // Detail 1 periode (dukung ID numerik maupun period_code)
                if (is_numeric($rawId)) {
                    $stmt = $db->prepare("
                        SELECT p.*,
                               (SELECT COUNT(*) FROM salary_records r WHERE r.period_id = p.id) AS total_employees,
                               (SELECT COALESCE(SUM(r.net_income), 0) FROM salary_records r WHERE r.period_id = p.id) AS total_net_payout
                        FROM salary_periods p
                        WHERE p.id = :id
                        LIMIT 1
                    ");
                    $stmt->execute([':id' => (int)$rawId]);
                } else {
                    $stmt = $db->prepare("
                        SELECT p.*,
                               (SELECT COUNT(*) FROM salary_records r WHERE r.period_id = p.id) AS total_employees,
                               (SELECT COALESCE(SUM(r.net_income), 0) FROM salary_records r WHERE r.period_id = p.id) AS total_net_payout
                        FROM salary_periods p
                        WHERE p.period_code = :code
                        LIMIT 1
                    ");
                    $stmt->execute([':code' => $rawId]);
                }
                $period = $stmt->fetch();

                if (!$period) {
                    jsonError(404, 'Periode penggajian tidak ditemukan.');
                }

                $period['id'] = (int)$period['id'];
                $period['total_calendar_days'] = (int)$period['total_calendar_days'];
                $period['holidays'] = (int)$period['holidays'];
                $period['work_days'] = (float)$period['work_days'];
                $period['total_employees'] = (int)$period['total_employees'];
                $period['total_net_payout'] = (float)$period['total_net_payout'];

                jsonSuccess(['period' => $period]);
            } else {
                // List seluruh periode
                $stmt = $db->query("
                    SELECT p.*,
                           (SELECT COUNT(*) FROM salary_records r WHERE r.period_id = p.id) AS total_employees,
                           (SELECT COALESCE(SUM(r.net_income), 0) FROM salary_records r WHERE r.period_id = p.id) AS total_net_payout
                    FROM salary_periods p
                    ORDER BY p.start_date DESC, p.id DESC
                ");
                $periods = $stmt->fetchAll();

                foreach ($periods as &$p) {
                    $p['id'] = (int)$p['id'];
                    $p['total_calendar_days'] = (int)$p['total_calendar_days'];
                    $p['holidays'] = (int)$p['holidays'];
                    $p['work_days'] = (float)$p['work_days'];
                    $p['total_employees'] = (int)$p['total_employees'];
                    $p['total_net_payout'] = (float)$p['total_net_payout'];
                }
                unset($p);

                jsonSuccess(['periods' => $periods]);
            }
            break;

        case 'POST':
            $body = getJsonInput();
            $periodName = trim($body['period_name'] ?? '');
            $startDate = trim($body['start_date'] ?? date('Y-m-d'));
            $endDate = trim($body['end_date'] ?? date('Y-m-d'));
            $totalDays = isset($body['total_calendar_days']) ? (int)$body['total_calendar_days'] : 6;
            $holidays = isset($body['holidays']) ? (int)$body['holidays'] : 0;
            $workDays = isset($body['work_days']) ? (float)$body['work_days'] : max(1, $totalDays - $holidays);
            $notes = trim($body['notes'] ?? '');
            $periodCode = trim($body['period_code'] ?? ($body['id'] ?? ''));

            if (empty($periodName)) {
                jsonError(400, 'Nama periode penggajian wajib diisi.');
            }

            if (empty($periodCode)) {
                $periodCode = generatePeriodCode($db, $startDate);
            }

            // Pastikan period_code unik
            $cStmt = $db->prepare("SELECT id FROM salary_periods WHERE period_code = :code LIMIT 1");
            $cStmt->execute([':code' => $periodCode]);
            if ($cStmt->fetch()) {
                $periodCode = generatePeriodCode($db, $startDate);
            }

            $db->beginTransaction();

            $stmt = $db->prepare("
                INSERT INTO salary_periods (
                    period_code, period_name, start_date, end_date,
                    total_calendar_days, holidays, work_days, status, notes
                ) VALUES (
                    :code, :name, :start, :end,
                    :calendar, :holidays, :work, 'Draft', :notes
                )
            ");
            $stmt->execute([
                ':code'     => $periodCode,
                ':name'     => $periodName,
                ':start'    => $startDate,
                ':end'      => $endDate,
                ':calendar' => $totalDays,
                ':holidays' => $holidays,
                ':work'     => $workDays,
                ':notes'    => !empty($notes) ? $notes : null,
            ]);

            $newPeriodId = (int)$db->lastInsertId();

            // OTOMATIS INISIALISASI BARIS SALARY_RECORDS UNTUK SEMUA KARYAWAN AKTIF
            $empStmt = $db->query("
                SELECT id, employee_code, id_absen, name, department_name, daily_salary, trip_allowance
                FROM employees
                WHERE is_active = 1
                ORDER BY CAST(id_absen AS UNSIGNED) ASC, id ASC
            ");
            $activeEmployees = $empStmt->fetchAll();

            $recStmt = $db->prepare("
                INSERT INTO salary_records (
                    record_code, period_id, employee_id, snapshot_name, snapshot_department, snapshot_id_absen,
                    total_work_hours, workshop_days, business_trip_days, leave_days,
                    rate_daily_salary, rate_trip_allowance, base_salary, trip_allowance_total,
                    salary_subtotal, extra_income_notes, extra_income_amount, net_income
                ) VALUES (
                    :rec_code, :period_id, :emp_id, :snap_name, :snap_dept, :snap_absen,
                    0.00, :workshop_days, 0.00, 0.00,
                    :rate_daily, :rate_trip, :base_sal, 0.00,
                    :subtotal, '', 0.00, :net_inc
                )
            ");

            foreach ($activeEmployees as $emp) {
                $recCode = "REC-{$periodCode}-{$emp['employee_code']}";
                $rateDaily = (float)$emp['daily_salary'];
                $rateTrip = (float)$emp['trip_allowance'];
                $baseSalary = round($workDays * $rateDaily);

                $recStmt->execute([
                    ':rec_code'      => $recCode,
                    ':period_id'     => $newPeriodId,
                    ':emp_id'        => (int)$emp['id'],
                    ':snap_name'     => $emp['name'],
                    ':snap_dept'     => $emp['department_name'],
                    ':snap_absen'    => $emp['id_absen'],
                    ':workshop_days' => $workDays,
                    ':rate_daily'    => $rateDaily,
                    ':rate_trip'     => $rateTrip,
                    ':base_sal'      => $baseSalary,
                    ':subtotal'      => $baseSalary,
                    ':net_inc'       => $baseSalary,
                ]);
            }

            $db->commit();

            jsonSuccess([
                'id' => $newPeriodId,
                'period' => [
                    'id'                  => $newPeriodId,
                    'period_code'         => $periodCode,
                    'period_name'         => $periodName,
                    'start_date'          => $startDate,
                    'end_date'            => $endDate,
                    'total_calendar_days' => $totalDays,
                    'holidays'            => $holidays,
                    'work_days'           => $workDays,
                    'status'              => 'Draft',
                    'notes'               => $notes,
                    'total_employees'     => count($activeEmployees),
                ]
            ], 'Periode penggajian baru berhasil dibuat beserta seluruh daftar karyawan aktif.');
            break;

        case 'PUT':
            $body = getJsonInput();
            $id = (int)($body['id'] ?? ($_GET['id'] ?? 0));

            if ($id <= 0) {
                jsonError(400, 'ID periode penggajian tidak valid.');
            }

            // Ambil data eksisting
            $pStmt = $db->prepare("SELECT * FROM salary_periods WHERE id = :id LIMIT 1");
            $pStmt->execute([':id' => $id]);
            $current = $pStmt->fetch();

            if (!$current) {
                jsonError(404, 'Periode penggajian tidak ditemukan.');
            }

            $periodName = isset($body['period_name']) ? trim($body['period_name']) : $current['period_name'];
            $startDate  = isset($body['start_date']) ? trim($body['start_date']) : $current['start_date'];
            $endDate    = isset($body['end_date']) ? trim($body['end_date']) : $current['end_date'];
            $totalDays  = isset($body['total_calendar_days']) ? (int)$body['total_calendar_days'] : (int)$current['total_calendar_days'];
            $holidays   = isset($body['holidays']) ? (int)$body['holidays'] : (int)$current['holidays'];
            $workDays   = isset($body['work_days']) ? (float)$body['work_days'] : (float)$current['work_days'];
            $status     = isset($body['status']) ? trim($body['status']) : $current['status'];
            $notes      = isset($body['notes']) ? trim($body['notes']) : $current['notes'];

            $publishedAt = $current['published_at'];
            $paidAt      = $current['paid_at'];

            if ($status === 'Published' && empty($publishedAt)) {
                $publishedAt = date('Y-m-d H:i:s');
            } elseif ($status === 'Paid') {
                if (empty($publishedAt)) $publishedAt = date('Y-m-d H:i:s');
                if (empty($paidAt)) $paidAt = date('Y-m-d H:i:s');
            }

            $stmt = $db->prepare("
                UPDATE salary_periods
                SET period_name = :name,
                    start_date = :start,
                    end_date = :end,
                    total_calendar_days = :calendar,
                    holidays = :holidays,
                    work_days = :work,
                    status = :status,
                    notes = :notes,
                    published_at = :pub_at,
                    paid_at = :paid_at
                WHERE id = :id
            ");
            $stmt->execute([
                ':name'     => $periodName,
                ':start'    => $startDate,
                ':end'      => $endDate,
                ':calendar' => $totalDays,
                ':holidays' => $holidays,
                ':work'     => $workDays,
                ':status'   => $status,
                ':notes'    => !empty($notes) ? $notes : null,
                ':pub_at'   => $publishedAt,
                ':paid_at'  => $paidAt,
                ':id'       => $id,
            ]);

            jsonSuccess([], 'Data periode penggajian berhasil diperbarui.');
            break;

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                jsonError(400, 'Parameter ID periode wajib diberikan.');
            }

            $db->beginTransaction();
            // Hapus semua rekaman gaji terkait
            $delRec = $db->prepare("DELETE FROM salary_records WHERE period_id = :id");
            $delRec->execute([':id' => $id]);

            // Hapus log import terkait jika ada
            $delImp = $db->prepare("DELETE FROM salary_attendance_imports WHERE period_id = :id");
            $delImp->execute([':id' => $id]);

            // Hapus periode
            $delPeriod = $db->prepare("DELETE FROM salary_periods WHERE id = :id");
            $delPeriod->execute([':id' => $id]);

            $db->commit();
            jsonSuccess([], 'Periode penggajian beserta seluruh rekaman gajinya berhasil dihapus.');
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
