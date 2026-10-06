<?php
/**
 * Database Connection — Ateka Tehnik Admin Backend
 * 
 * Provides a singleton PDO instance for all API endpoints.
 * Credentials are for the Hostinger MySQL database.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'atekatehnik');
define('DB_USER', 'root');
define('DB_PASS', '');

// Fallback Database Config
define('DB_HOST_FALLBACK', 'localhost');
define('DB_NAME_FALLBACK', 'atekatehnik_backup');
define('DB_USER_FALLBACK', 'root');
define('DB_PASS_FALLBACK', '');

$GLOBALS['db_status_info'] = [
    'active_db' => 'primary',
    'primary_error' => null
];

function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 3, // 3 seconds timeout to fail fast
        ];

        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $GLOBALS['db_status_info']['active_db'] = 'primary';
        } catch (PDOException $e) {
            $GLOBALS['db_status_info']['active_db'] = 'fallback';
            $GLOBALS['db_status_info']['primary_error'] = $e->getMessage();
            
            // Log the error (e.g., Too many connections)
            error_log("Primary DB Error: " . $e->getMessage() . ". Trying fallback...");

            try {
                // Attempt connection to the fallback DB
                $dsnFallback = 'mysql:host=' . DB_HOST_FALLBACK . ';dbname=' . DB_NAME_FALLBACK . ';charset=utf8mb4';
                $pdo = new PDO($dsnFallback, DB_USER_FALLBACK, DB_PASS_FALLBACK, $options);
            } catch (PDOException $fallbackE) {
                // Both databases are down
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed. Please try again later.']);
                exit;
            }
        }
    }
    return $pdo;
}
