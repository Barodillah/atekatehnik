<?php
/**
 * Konfigurasi Penggajian Endpoint — Ateka Tehnik Internal Payroll System
 * 
 * Mengelola setting sistem seperti kota penandatanganan, nama direktur,
 * label jabatan, gambar tanda tangan, dan teks peringatan slip gaji.
 */

require_once __DIR__ . '/helpers.php';
setCorsHeaders();

$db = getInternalDB();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT setting_key, setting_value, description FROM salary_settings");
            $rows = $stmt->fetchAll();

            $settings = [];
            foreach ($rows as $r) {
                $settings[$r['setting_key']] = $r['setting_value'];
            }

            // Default fallback jika belum di-seed
            $defaults = [
                'city_name'              => 'Karanganyar',
                'company_name'           => 'CV. ATEKA TEHNIK',
                'director_name'          => 'WARSITO',
                'director_title'         => '( DIREKTUR )',
                'director_signature_url' => 'https://atekatehnik.com/wp/uploads/asset_6acd5d6b506ee2.49528031.png',
                'admin_title'            => '( ADMINISTRASI )',
                'payslip_notice'         => 'Apabila terdapat kesalahan input gaji mohon di laporkan secara terang terangan ke pihak CV Ateka Tehnik!!!!!',
            ];

            foreach ($defaults as $k => $v) {
                if (!isset($settings[$k])) {
                    $settings[$k] = $v;
                }
            }

            jsonSuccess(['settings' => $settings]);
            break;

        case 'PUT':
        case 'POST':
            $body = getJsonInput();
            $items = $body['settings'] ?? $body;

            if (!is_array($items)) {
                jsonError(400, 'Data setting harus berupa objek pasangan key-value.');
            }

            $stmt = $db->prepare("
                INSERT INTO salary_settings (setting_key, setting_value)
                VALUES (:key, :val)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            ");

            $db->beginTransaction();
            foreach ($items as $k => $v) {
                if (is_string($k) && !empty($k)) {
                    $stmt->execute([
                        ':key' => trim($k),
                        ':val' => is_bool($v) ? ($v ? '1' : '0') : (string)$v,
                    ]);
                }
            }
            $db->commit();

            jsonSuccess([], 'Pengaturan sistem berhasil disimpan.');
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
