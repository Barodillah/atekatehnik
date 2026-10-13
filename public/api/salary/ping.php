<?php
/**
 * Ping & Status Endpoint — Ateka Tehnik Internal Payroll System
 * 
 * Memverifikasi konektivitas ke database `ateka_internal`
 * dan mengembalikan status jumlah baris per tabel.
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

try {
    $db = getInternalDB();

    $tables = [
        'salary_departments',
        'employees',
        'salary_periods',
        'salary_records',
        'salary_settings',
        'salary_attendance_imports',
    ];

    $counts = [];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) AS total FROM `{$table}`");
            $counts[$table] = (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            $counts[$table] = 'Table not found: ' . $e->getMessage();
        }
    }

    jsonSuccess([
        'database'   => DB_INTERNAL_NAME,
        'connection' => 'Connected successfully',
        'counts'     => $counts,
        'timestamp'  => date('Y-m-d H:i:s'),
    ], 'Koneksi database internal berhasil diverifikasi.');

} catch (Exception $e) {
    jsonError(500, 'Gagal terhubung ke ateka_internal: ' . $e->getMessage());
}
