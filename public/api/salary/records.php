<?php
/**
 * Rekaman Penggajian & Presensi Endpoint — Ateka Tehnik Internal Payroll System
 * 
 * Mengelola matrix absensi, jam kerja, perhitungan upah, uang saku dinas,
 * penyesuaian/lembur, dan pencatatan import fingerprint Excel.
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

$db = getInternalDB();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function resolveSalaryPeriod($db, $raw) {
    $raw = trim((string)$raw);
    if ($raw === '') return null;
    if (is_numeric($raw)) {
        $stmt = $db->prepare("SELECT * FROM salary_periods WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$raw]);
    } else {
        $stmt = $db->prepare("SELECT * FROM salary_periods WHERE period_code = :code LIMIT 1");
        $stmt->execute([':code' => $raw]);
    }
    return $stmt->fetch();
}

try {
    switch ($method) {
        case 'GET':
            $rawPeriodId = trim($_GET['period_id'] ?? '');
            if (empty($rawPeriodId)) {
                jsonError(400, 'Parameter period_id wajib diberikan.');
            }

            $periodInfo = resolveSalaryPeriod($db, $rawPeriodId);
            if (!$periodInfo) {
                jsonError(404, 'Periode tidak ditemukan.');
            }
            $periodId = (int)$periodInfo['id'];
            $periodWorkDays = (float)$periodInfo['work_days'];

            $stmt = $db->prepare("
                SELECT r.*, e.employee_code, e.is_active AS employee_is_active
                FROM salary_records r
                LEFT JOIN employees e ON e.id = r.employee_id
                WHERE r.period_id = :period_id
                ORDER BY CAST(r.snapshot_id_absen AS UNSIGNED) ASC, r.id ASC
            ");
            $stmt->execute([':period_id' => $periodId]);
            $records = $stmt->fetchAll();

            foreach ($records as &$rec) {
                $rec['id'] = (int)$rec['id'];
                $rec['period_id'] = (int)$rec['period_id'];
                $rec['employee_id'] = (int)$rec['employee_id'];
                $rec['total_work_hours'] = (float)$rec['total_work_hours'];
                $rec['workshop_days'] = (float)$rec['workshop_days'];
                $rec['business_trip_days'] = (float)$rec['business_trip_days'];
                $rec['leave_days'] = (float)$rec['leave_days'];
                $rec['rate_daily_salary'] = (float)$rec['rate_daily_salary'];
                $rec['rate_trip_allowance'] = (float)$rec['rate_trip_allowance'];
                $rec['base_salary'] = (float)$rec['base_salary'];
                $rec['trip_allowance_total'] = (float)$rec['trip_allowance_total'];
                $rec['salary_subtotal'] = (float)$rec['salary_subtotal'];
                $rec['extra_income_amount'] = (float)$rec['extra_income_amount'];
                $rec['net_income'] = (float)$rec['net_income'];
                $rec['standard_work_days'] = $periodWorkDays;

                // Alias field untuk kompatibilitas UI frontend
                $rec['name'] = $rec['snapshot_name'];
                $rec['department'] = $rec['snapshot_department'];
                $rec['id_absen'] = $rec['snapshot_id_absen'];
            }
            unset($rec);

            jsonSuccess([
                'period_id'   => $periodId,
                'period_info' => $periodInfo,
                'records'     => $records,
            ]);
            break;

        case 'PUT':
            $body = getJsonInput();
            $id = (int)($body['id'] ?? ($_GET['id'] ?? 0));

            if ($id <= 0) {
                jsonError(400, 'ID rekaman gaji tidak valid.');
            }

            // Ambil data rekaman & periode
            $rStmt = $db->prepare("
                SELECT r.*, p.work_days AS period_work_days, p.status AS period_status
                FROM salary_records r
                JOIN salary_periods p ON p.id = r.period_id
                WHERE r.id = :id
                LIMIT 1
            ");
            $rStmt->execute([':id' => $id]);
            $current = $rStmt->fetch();

            if (!$current) {
                jsonError(404, 'Rekaman gaji tidak ditemukan.');
            }

            if ($current['period_status'] !== 'Draft' && !isset($_GET['force'])) {
                jsonError(403, 'Periode tidak dalam status Draft. Rekaman tidak dapat diedit.');
            }

            $merged = array_merge($current, $body);
            $calculated = calculateSalaryRowBackend($merged, (float)$current['period_work_days']);

            $update = $db->prepare("
                UPDATE salary_records
                SET total_work_hours = :hours,
                    workshop_days = :work_days,
                    business_trip_days = :trip_days,
                    leave_days = :leave_days,
                    rate_daily_salary = :rate_daily,
                    rate_trip_allowance = :rate_trip,
                    base_salary = :base_salary,
                    trip_allowance_total = :trip_total,
                    salary_subtotal = :subtotal,
                    extra_income_notes = :extra_notes,
                    extra_income_amount = :extra_amount,
                    net_income = :net_income
                WHERE id = :id
            ");

            $update->execute([
                ':hours'        => isset($body['total_work_hours']) ? (float)$body['total_work_hours'] : (float)$current['total_work_hours'],
                ':work_days'    => $calculated['workshop_days'],
                ':trip_days'    => $calculated['business_trip_days'],
                ':leave_days'   => $calculated['leave_days'],
                ':rate_daily'   => $calculated['rate_daily_salary'],
                ':rate_trip'    => $calculated['rate_trip_allowance'],
                ':base_salary'  => $calculated['base_salary'],
                ':trip_total'   => $calculated['trip_allowance_total'],
                ':subtotal'     => $calculated['salary_subtotal'],
                ':extra_notes'  => $calculated['extra_income_notes'] ?? '',
                ':extra_amount' => $calculated['extra_income_amount'],
                ':net_income'   => $calculated['net_income'],
                ':id'           => $id,
            ]);

            jsonSuccess([
                'record' => $calculated
            ], 'Rekaman gaji berhasil diperbarui.');
            break;

        case 'POST':
            $action = $_GET['action'] ?? '';
            $body = getJsonInput();

            if ($action === 'batch_save') {
                $rows = $body['rows'] ?? [];
                if (!is_array($rows)) {
                    jsonError(400, 'Data rows wajib disertakan berupa array.');
                }

                $period = resolveSalaryPeriod($db, $body['period_id'] ?? '');
                if (!$period) {
                    jsonError(404, 'Periode tidak ditemukan.');
                }
                if ($period['status'] !== 'Draft' && !isset($_GET['force'])) {
                    jsonError(403, 'Periode tidak dalam status Draft. Rekaman terkunci.');
                }

                $periodId = (int)$period['id'];
                $workDays = (float)$period['work_days'];

                $db->beginTransaction();

                $stmt = $db->prepare("
                    UPDATE salary_records
                    SET total_work_hours = :hours,
                        workshop_days = :work_days,
                        business_trip_days = :trip_days,
                        leave_days = :leave_days,
                        rate_daily_salary = :rate_daily,
                        rate_trip_allowance = :rate_trip,
                        base_salary = :base_salary,
                        trip_allowance_total = :trip_total,
                        salary_subtotal = :subtotal,
                        extra_income_notes = :extra_notes,
                        extra_income_amount = :extra_amount,
                        net_income = :net_income
                    WHERE id = :id AND period_id = :period_id
                ");

                foreach ($rows as $row) {
                    $id = (int)($row['id'] ?? 0);
                    if ($id <= 0) continue;

                    $calculated = calculateSalaryRowBackend($row, $workDays);

                    $stmt->execute([
                        ':hours'        => isset($row['total_work_hours']) ? (float)$row['total_work_hours'] : 0.00,
                        ':work_days'    => $calculated['workshop_days'],
                        ':trip_days'    => $calculated['business_trip_days'],
                        ':leave_days'   => $calculated['leave_days'],
                        ':rate_daily'   => $calculated['rate_daily_salary'],
                        ':rate_trip'    => $calculated['rate_trip_allowance'],
                        ':base_salary'  => $calculated['base_salary'],
                        ':trip_total'   => $calculated['trip_allowance_total'],
                        ':subtotal'     => $calculated['salary_subtotal'],
                        ':extra_notes'  => $calculated['extra_income_notes'] ?? '',
                        ':extra_amount' => $calculated['extra_income_amount'],
                        ':net_income'   => $calculated['net_income'],
                        ':id'           => $id,
                        ':period_id'    => $periodId,
                    ]);
                }

                $db->commit();
                jsonSuccess([], 'Seluruh data rekaman gaji periode berhasil disimpan.');

            } elseif ($action === 'import_attendance') {
                $fileName = trim($body['file_name'] ?? 'Import_Absensi.xlsx');
                $attendanceRows = $body['attendance_rows'] ?? [];

                if (!is_array($attendanceRows)) {
                    jsonError(400, 'Parameter attendance_rows wajib diisi.');
                }

                $period = resolveSalaryPeriod($db, $body['period_id'] ?? '');
                if (!$period) {
                    jsonError(404, 'Periode tidak ditemukan.');
                }
                if ($period['status'] !== 'Draft') {
                    jsonError(403, 'Import absensi hanya dapat dilakukan pada periode bertaraf Draft.');
                }

                $periodId = (int)$period['id'];
                $standardDays = (float)$period['work_days'];

                // Ambil semua records periode
                $recStmt = $db->prepare("SELECT * FROM salary_records WHERE period_id = :id");
                $recStmt->execute([':id' => $periodId]);
                $records = $recStmt->fetchAll();

                // Buat index pencarian berdasarkan id_absen dan nama
                $byAbsen = [];
                $byName = [];
                foreach ($attendanceRows as $ar) {
                    if (!empty($ar['id_absen'])) {
                        $byAbsen[trim((string)$ar['id_absen'])] = $ar;
                    }
                    if (!empty($ar['name'])) {
                        $byName[strtoupper(trim((string)$ar['name']))] = $ar;
                    }
                }

                $matched = 0;
                $unmatched = 0;

                $updateStmt = $db->prepare("
                    UPDATE salary_records
                    SET total_work_hours = :hours,
                        workshop_days = :work_days,
                        leave_days = :leave_days,
                        base_salary = :base_salary,
                        salary_subtotal = :subtotal,
                        net_income = :net_income
                    WHERE id = :id
                ");

                $db->beginTransaction();

                foreach ($records as $rec) {
                    $snapAbsen = trim((string)$rec['snapshot_id_absen']);
                    $snapName = strtoupper(trim((string)$rec['snapshot_name']));

                    $match = $byAbsen[$snapAbsen] ?? ($byName[$snapName] ?? null);

                    if ($match) {
                        $matched++;
                        $workshopDays = isset($match['days']) ? (float)$match['days'] : 0.00;
                        $totalHours = isset($match['total_hours']) ? (float)$match['total_hours'] : round($workshopDays * 8, 2);

                        $tripDays = (float)$rec['business_trip_days'];
                        $leaveDays = max(0.00, round($standardDays - ($workshopDays + $tripDays), 2));

                        $rateDaily = (float)$rec['rate_daily_salary'];
                        $baseSalary = round($workshopDays * $rateDaily);
                        $tripTotal = (float)$rec['trip_allowance_total'];
                        $subtotal = $baseSalary + $tripTotal;
                        $netIncome = $subtotal + (float)$rec['extra_income_amount'];

                        $updateStmt->execute([
                            ':hours'       => $totalHours,
                            ':work_days'   => $workshopDays,
                            ':leave_days'  => $leaveDays,
                            ':base_salary' => $baseSalary,
                            ':subtotal'    => $subtotal,
                            ':net_income'  => $netIncome,
                            ':id'          => (int)$rec['id'],
                        ]);
                    } else {
                        $unmatched++;
                    }
                }

                // Catat ke salary_attendance_imports
                $logStmt = $db->prepare("
                    INSERT INTO salary_attendance_imports (
                        period_id, file_name, total_rows, matched_rows, unmatched_rows
                    ) VALUES (
                        :p_id, :fname, :total, :matched, :unmatched
                    )
                ");
                $logStmt->execute([
                    ':p_id'      => $periodId,
                    ':fname'     => $fileName,
                    ':total'     => count($attendanceRows),
                    ':matched'   => $matched,
                    ':unmatched' => $unmatched,
                ]);

                $db->commit();

                jsonSuccess([
                    'matched_count'   => $matched,
                    'unmatched_count' => $unmatched,
                    'total_input'     => count($attendanceRows),
                ], "Berhasil mencocokkan {$matched} data kehadiran karyawan.");

            } elseif ($action === 'sync_new_employees') {
                // Sinkronisasi jika ada karyawan aktif baru yang belum masuk ke periode ini
                $period = resolveSalaryPeriod($db, $body['period_id'] ?? '');
                if (!$period) jsonError(404, 'Periode tidak ditemukan.');
                if ($period['status'] !== 'Draft') jsonError(403, 'Periode terkunci.');
                $periodId = (int)$period['id'];

                $existingEmpIds = $db->query("SELECT employee_id FROM salary_records WHERE period_id = {$periodId}")->fetchAll(PDO::FETCH_COLUMN);

                $missing = $db->query("
                    SELECT * FROM employees 
                    WHERE is_active = 1 AND id NOT IN (" . (empty($existingEmpIds) ? '0' : implode(',', $existingEmpIds)) . ")
                ")->fetchAll();

                $workDays = (float)$period['work_days'];
                $periodCode = $period['period_code'];

                $insStmt = $db->prepare("
                    INSERT INTO salary_records (
                        record_code, period_id, employee_id, snapshot_name, snapshot_department, snapshot_id_absen,
                        total_work_hours, workshop_days, business_trip_days, leave_days,
                        rate_daily_salary, rate_trip_allowance, base_salary, trip_allowance_total,
                        salary_subtotal, extra_income_notes, extra_income_amount, net_income
                    ) VALUES (
                        :code, :p_id, :emp_id, :name, :dept, :absen,
                        0.00, :w_days, 0.00, 0.00,
                        :rate_d, :rate_t, :base, 0.00,
                        :subtotal, '', 0.00, :net
                    )
                ");

                $db->beginTransaction();
                foreach ($missing as $m) {
                    $rateDaily = (float)$m['daily_salary'];
                    $baseSal = round($workDays * $rateDaily);
                    $insStmt->execute([
                        ':code'     => "REC-{$periodCode}-{$m['employee_code']}",
                        ':p_id'     => $periodId,
                        ':emp_id'   => (int)$m['id'],
                        ':name'     => $m['name'],
                        ':dept'     => $m['department_name'],
                        ':absen'    => $m['id_absen'],
                        ':w_days'   => $workDays,
                        ':rate_d'   => $rateDaily,
                        ':rate_t'   => (float)$m['trip_allowance'],
                        ':base'     => $baseSal,
                        ':subtotal' => $baseSal,
                        ':net'      => $baseSal,
                    ]);
                }
                $db->commit();

                jsonSuccess(['added_count' => count($missing)], "Berhasil menambahkan " . count($missing) . " karyawan baru ke periode.");
            } elseif ($action === 'add_employee') {
                $empId = isset($body['employee_id']) ? (int)$body['employee_id'] : 0;
                if ($empId <= 0) {
                    jsonError(400, 'Parameter employee_id wajib disertakan.');
                }

                $period = resolveSalaryPeriod($db, $body['period_id'] ?? '');
                if (!$period) jsonError(404, 'Periode tidak ditemukan.');
                if ($period['status'] !== 'Draft') jsonError(403, 'Periode terkunci.');
                $periodId = (int)$period['id'];

                $eStmt = $db->prepare("SELECT * FROM employees WHERE id = :id LIMIT 1");
                $eStmt->execute([':id' => $empId]);
                $emp = $eStmt->fetch();
                if (!$emp) jsonError(404, 'Data karyawan tidak ditemukan.');

                // Cek apakah sudah ada di periode ini
                $check = $db->prepare("SELECT id FROM salary_records WHERE period_id = :p_id AND employee_id = :e_id LIMIT 1");
                $check->execute([':p_id' => $periodId, ':e_id' => $empId]);
                if ($check->fetch()) {
                    jsonError(409, "Karyawan {$emp['name']} sudah terdaftar di periode ini.");
                }

                $workDays = (float)$period['work_days'];
                $rateDaily = (float)$emp['daily_salary'];
                $rateTrip = (float)$emp['trip_allowance'];
                $baseSal = round($workDays * $rateDaily);
                $recCode = "REC-{$period['period_code']}-{$emp['employee_code']}";

                $ins = $db->prepare("
                    INSERT INTO salary_records (
                        record_code, period_id, employee_id, snapshot_name, snapshot_department, snapshot_id_absen,
                        total_work_hours, workshop_days, business_trip_days, leave_days,
                        rate_daily_salary, rate_trip_allowance, base_salary, trip_allowance_total,
                        salary_subtotal, extra_income_notes, extra_income_amount, net_income
                    ) VALUES (
                        :code, :p_id, :e_id, :name, :dept, :absen,
                        0.00, :w_days, 0.00, 0.00,
                        :rate_d, :rate_t, :base, 0.00,
                        :subtotal, '', 0.00, :net
                    )
                ");
                $ins->execute([
                    ':code'     => $recCode,
                    ':p_id'     => $periodId,
                    ':e_id'     => $empId,
                    ':name'     => $emp['name'],
                    ':dept'     => $emp['department_name'],
                    ':absen'    => $emp['id_absen'],
                    ':w_days'   => $workDays,
                    ':rate_d'   => $rateDaily,
                    ':rate_t'   => $rateTrip,
                    ':base'     => $baseSal,
                    ':subtotal' => $baseSal,
                    ':net'      => $baseSal,
                ]);

                $newRecId = (int)$db->lastInsertId();
                jsonSuccess(['id' => $newRecId], "Karyawan {$emp['name']} berhasil ditambahkan ke periode.");
            } else {
                jsonError(400, 'Aksi POST tidak dikenali.');
            }
            break;

        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                jsonError(400, 'ID rekaman gaji wajib diberikan.');
            }

            $rStmt = $db->prepare("
                SELECT r.id, r.snapshot_name, p.status AS period_status 
                FROM salary_records r
                JOIN salary_periods p ON p.id = r.period_id
                WHERE r.id = :id
                LIMIT 1
            ");
            $rStmt->execute([':id' => $id]);
            $row = $rStmt->fetch();

            if (!$row) {
                jsonError(404, 'Rekaman gaji tidak ditemukan.');
            }

            if ($row['period_status'] !== 'Draft' && !isset($_GET['force'])) {
                jsonError(403, 'Periode terkunci. Rekaman tidak dapat dihapus.');
            }

            $del = $db->prepare("DELETE FROM salary_records WHERE id = :id");
            $del->execute([':id' => $id]);

            jsonSuccess([], "Karyawan {$row['snapshot_name']} berhasil dihapus dari periode.");
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
