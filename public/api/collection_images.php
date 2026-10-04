<?php
/**
 * Collection Images API — returns all uploaded images with names
 * from quotations, items, quotation_items, galleries (type=image).
 */
require_once __DIR__ . '/helpers.php';
setCorsHeaders();
requireAuth();

$db = getDB();

$queries = [
    'Galeri'    => "SELECT src AS url, title AS name FROM galleries WHERE type = 'image' AND src IS NOT NULL AND src != ''",
    'Penawaran' => "SELECT cover_image_url AS url, title AS name FROM quotations WHERE cover_image_url IS NOT NULL AND cover_image_url != ''",
    'Item'      => "SELECT image_url AS url, name FROM items WHERE image_url IS NOT NULL AND image_url != ''",
    'Item Penawaran' => "SELECT image_url AS url, name FROM quotation_items WHERE image_url IS NOT NULL AND image_url != ''",
    'Produk'    => "SELECT gambar AS url, nama AS name FROM products WHERE gambar IS NOT NULL AND gambar != '' ORDER BY CASE kategori WHEN 'Unit Mesin Tunggal' THEN 1 WHEN 'Paket' THEN 2 WHEN 'Peralatan Pendukung' THEN 3 WHEN 'Suku Cadang' THEN 4 ELSE 5 END ASC",
    'Pemasangan' => "SELECT pp.image_url AS url, p.title AS name FROM post_phases pp JOIN posts p ON pp.post_id = p.id WHERE p.category = 'Industrial Installations' AND pp.image_url IS NOT NULL AND pp.image_url != ''",
];

$images = [];
$seen = [];
$errors = [];

foreach ($queries as $source => $sql) {
    try {
        $stmt = $db->query($sql);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $rawUrl = trim($row['url']);
            if (empty($rawUrl)) continue;

            $urlsToProcess = [];
            // Khusus tabel Produk, gambarnya dipisah koma. Ambil SEMUA gambar.
            if ($source === 'Produk' && strpos($rawUrl, ',') !== false) {
                $parts = explode(',', $rawUrl);
                foreach ($parts as $p) {
                    $urlsToProcess[] = trim($p);
                }
            } else {
                $urlsToProcess[] = $rawUrl;
            }

            foreach ($urlsToProcess as $url) {
                if (empty($url) || isset($seen[$url])) continue;
                
                // Jangan tampilkan jika formatnya video
                if (preg_match('/\.(mp4|webm|ogg|avi|mov|mkv)(\?.*)?$/i', $url)) {
                    continue;
                }

                $seen[$url] = true;
                
                $images[] = [
                    'url'    => $url,
                    'name'   => $row['name'] ?: '-',
                    'source' => $source,
                ];
            }
        }
    } catch (\Throwable $e) {
        $errors[] = $e->getMessage();
        error_log('collection_images error: ' . $e->getMessage());
    }
}

jsonSuccess(['images' => $images, 'errors' => $errors]);
