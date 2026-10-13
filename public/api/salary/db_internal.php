<?php
/**
 * Database Connection — Ateka Tehnik Internal System (Payroll / Gaji)
 * 
 * Memberikan koneksi PDO terisolasi khusus ke database `ateka_internal`.
 * Terpisah secara independen dari kredensial dan database utama website.
 */

// Kredensial Database Internal
define('DB_INTERNAL_HOST', 'localhost');
define('DB_INTERNAL_NAME', 'ateka_internal');
define('DB_INTERNAL_USER', 'root');
define('DB_INTERNAL_PASS', '');

/**
 * Mendapatkan koneksi PDO singleton ke database ateka_internal
 * @return PDO
 */
function getInternalDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];

        try {
            $dsn = 'mysql:host=' . DB_INTERNAL_HOST . ';dbname=' . DB_INTERNAL_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_INTERNAL_USER, DB_INTERNAL_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'error'   => 'Koneksi ke database internal (' . DB_INTERNAL_NAME . ') gagal: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    return $pdo;
}
