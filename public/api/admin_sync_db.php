<?php
/**
 * Database Sync — Ateka Tehnik Admin Backend
 * 
 * Synchronizes the primary database to the fallback database.
 * Only accessible by superadmin.
 */

require_once __DIR__ . '/helpers.php';
requireMethod('POST');

$session = requireAuth();

// Periksa apakah user adalah superadmin
if ($session['role'] !== 'superadmin') {
    jsonError(403, 'Akses ditolak. Hanya superadmin yang dapat melakukan sinkronisasi database.');
}

// Tambahkan waktu eksekusi agar tidak timeout jika database besar
set_time_limit(300);

function getDirectDB($host, $name, $user, $pass) {
    $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, $user, $pass, $options);
}

try {
    $primaryDb = getDirectDB(DB_HOST, DB_NAME, DB_USER, DB_PASS);
} catch (Exception $e) {
    jsonError(500, 'Koneksi ke database utama gagal: ' . $e->getMessage());
}

try {
    $fallbackDb = getDirectDB(DB_HOST_FALLBACK, DB_NAME_FALLBACK, DB_USER_FALLBACK, DB_PASS_FALLBACK);
} catch (Exception $e) {
    jsonError(500, 'Koneksi ke database cadangan gagal. Pastikan database "' . DB_NAME_FALLBACK . '" sudah dibuat: ' . $e->getMessage());
}

try {
    // Ambil semua nama tabel dari database utama
    $tables = $primaryDb->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    // Matikan foreign key checks saat proses sync agar tidak error constraint
    $fallbackDb->exec("SET FOREIGN_KEY_CHECKS=0;");

    foreach ($tables as $table) {
        // Ambil statement CREATE TABLE
        $createStmt = $primaryDb->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        $createSql = $createStmt['Create Table'];
        
        // Hapus tabel lama dan buat yang baru di database cadangan
        $fallbackDb->exec("DROP TABLE IF EXISTS `$table`");
        $fallbackDb->exec($createSql);

        // Ambil semua data
        $rows = $primaryDb->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($rows)) {
            // Masukkan data per chunk agar tidak kehabisan memori atau melewati max_allowed_packet
            $chunkSize = 100;
            $chunks = array_chunk($rows, $chunkSize);
            
            foreach ($chunks as $chunk) {
                $columns = array_keys($chunk[0]);
                $colStr = implode("`, `", $columns);
                
                $placeholders = [];
                $values = [];
                
                foreach ($chunk as $row) {
                    $rowPlaceholders = [];
                    foreach ($columns as $col) {
                        $rowPlaceholders[] = "?";
                        $values[] = $row[$col];
                    }
                    $placeholders[] = "(" . implode(", ", $rowPlaceholders) . ")";
                }
                
                $sql = "INSERT INTO `$table` (`$colStr`) VALUES " . implode(", ", $placeholders);
                $stmt = $fallbackDb->prepare($sql);
                $stmt->execute($values);
            }
        }
    }

    $fallbackDb->exec("SET FOREIGN_KEY_CHECKS=1;");
    
    // Log aktivitas
    logActivity('sync_db', 'system', null, 'Database berhasil disinkronisasi ke cadangan', $session['user_id']);
    
    jsonSuccess([], 'Sinkronisasi database ke cadangan berhasil dilakukan.');

} catch (Exception $e) {
    if (isset($fallbackDb)) {
        $fallbackDb->exec("SET FOREIGN_KEY_CHECKS=1;");
    }
    jsonError(500, 'Terjadi kesalahan saat sinkronisasi: ' . $e->getMessage());
}
