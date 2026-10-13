<?php
/**
 * Shared Helpers — Ateka Tehnik Internal Payroll System
 * 
 * Menyediakan penanganan CORS, standarisasi response JSON,
 * parsing input request, dan integrasi dengan db_internal.php.
 */

require_once __DIR__ . '/db_internal.php';

// ── CORS Headers ─────────────────────────────────────────────────────
function setCorsHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ── JSON Response ────────────────────────────────────────────────────
function jsonResponse(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonSuccess(array $data = [], string $message = 'OK'): void {
    jsonResponse(200, array_merge(['success' => true, 'message' => $message], $data));
}

function jsonError(int $status, string $message): void {
    jsonResponse($status, ['success' => false, 'error' => $message, 'message' => $message]);
}

// ── Parse JSON Body ──────────────────────────────────────────────────
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return [];
    }
    $input = json_decode($raw, true);
    if (!is_array($input)) {
        jsonError(400, 'Format payload JSON tidak valid atau rusak.');
    }
    return $input;
}

// ── Kalkulasi Formula Gaji Internal ──────────────────────────────────
/**
 * Melakukan kalkulasi baris penggajian sesuai rumus operasional Ateka Tehnik
 *
 * @param array $row
 * @param float $workDaysDefault
 * @return array
 */
function calculateSalaryRowBackend(array $row, float $workDaysDefault = 6.00): array {
    $standardDays = isset($row['standard_work_days']) && (float)$row['standard_work_days'] > 0
        ? (float)$row['standard_work_days']
        : $workDaysDefault;

    $workshopDays = isset($row['workshop_days']) ? (float)$row['workshop_days'] : 0.00;
    $tripDays = isset($row['business_trip_days']) ? (float)$row['business_trip_days'] : 0.00;
    
    // Cuti otomatis: Standard Work Days - (Hadir Bengkel + Dinas Luar)
    $leaveDays = max(0.00, round($standardDays - ($workshopDays + $tripDays), 2));

    $rateDaily = isset($row['rate_daily_salary']) ? (float)$row['rate_daily_salary'] : 0.00;
    $rateTrip = isset($row['rate_trip_allowance']) ? (float)$row['rate_trip_allowance'] : 0.00;
    $extraIncome = isset($row['extra_income_amount']) ? (float)$row['extra_income_amount'] : 0.00;

    $baseSalary = round($workshopDays * $rateDaily);
    $tripAllowanceTotal = round($tripDays * $rateTrip);
    $salarySubtotal = $baseSalary + $tripAllowanceTotal;
    $netIncome = $salarySubtotal + $extraIncome;

    return array_merge($row, [
        'standard_work_days'   => $standardDays,
        'workshop_days'        => $workshopDays,
        'business_trip_days'   => $tripDays,
        'leave_days'           => $leaveDays,
        'rate_daily_salary'    => $rateDaily,
        'rate_trip_allowance'  => $rateTrip,
        'base_salary'          => $baseSalary,
        'trip_allowance_total' => $tripAllowanceTotal,
        'salary_subtotal'      => $salarySubtotal,
        'extra_income_amount'  => $extraIncome,
        'net_income'           => $netIncome,
    ]);
}
