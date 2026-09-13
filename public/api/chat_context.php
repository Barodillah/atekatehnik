<?php
/**
 * Chat Context API — Ateka Tehnik AI Chatbot Knowledge Base
 * 
 * Generates a compact Markdown document (~5-8KB) optimized for injection
 * into the AI chatbot's system prompt. Contains:
 *   - Full product catalog with technical specifications
 *   - Recent portfolio/installation projects with deliverables
 *   - Recent news/articles with summaries
 *   - Technical FAQ
 * 
 * Uses file-based caching (1-hour TTL) to avoid DB queries on every chat open.
 * 
 * Endpoint: GET /api/chat_context.php
 * Response: text/markdown
 */

require_once __DIR__ . '/db.php';

date_default_timezone_set('Asia/Jakarta');

// ── Configuration ────────────────────────────────────────────────────
define('CONTEXT_CACHE_TTL', 3600); // 1 hour
define('CONTEXT_CACHE_DIR', sys_get_temp_dir() . '/atekatehnik_chat_context');
define('CONTEXT_CACHE_FILE', CONTEXT_CACHE_DIR . '/chat_context.md');
define('MAX_PORTFOLIO_ITEMS', 10);
define('MAX_NEWS_ITEMS', 10);
define('MAX_CONTENT_SUMMARY', 200);

// ── CORS & Headers ───────────────────────────────────────────────────
header('Content-Type: text/plain; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=3600');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Serve from cache if valid ────────────────────────────────────────
if (!is_dir(CONTEXT_CACHE_DIR)) {
    @mkdir(CONTEXT_CACHE_DIR, 0755, true);
}

if (file_exists(CONTEXT_CACHE_FILE)) {
    $cacheAge = time() - filemtime(CONTEXT_CACHE_FILE);
    if ($cacheAge < CONTEXT_CACHE_TTL) {
        echo file_get_contents(CONTEXT_CACHE_FILE);
        exit;
    }
}

// ── Generate Fresh Context ───────────────────────────────────────────
try {
    $db = getDB();
    $md = [];

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 1: FULL PRODUCT CATALOG WITH SPECIFICATIONS
    // ═══════════════════════════════════════════════════════════════════
    $md[] = '## KATALOG PRODUK LENGKAP';
    $md[] = '';

    $products = $db->query("
        SELECT p.id, p.nama, p.slug, p.description, p.kategori, p.gambar, p.shopee_link, p.inaproc_link
        FROM products p
        ORDER BY 
            CASE p.kategori 
                WHEN 'Paket' THEN 1
                WHEN 'Unit Mesin Tunggal' THEN 2
                WHEN 'Peralatan Pendukung' THEN 3
                WHEN 'Suku Cadang' THEN 4
                ELSE 5
            END,
            p.created_at ASC
    ")->fetchAll();

    // Pre-fetch all specs in one query
    $allSpecs = [];
    if (!empty($products)) {
        $productIds = array_column($products, 'id');
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $specStmt = $db->prepare("
            SELECT product_id, spesifikasi 
            FROM product_specs 
            WHERE product_id IN ({$placeholders}) 
            ORDER BY id
        ");
        $specStmt->execute($productIds);
        while ($row = $specStmt->fetch()) {
            $allSpecs[$row['product_id']][] = $row['spesifikasi'];
        }
    }

    $currentKategori = null;
    foreach ($products as $p) {
        if ($p['kategori'] !== $currentKategori) {
            $currentKategori = $p['kategori'];
            $md[] = "### Kategori: {$currentKategori}";
            $md[] = '';
        }

        $md[] = "#### {$p['nama']} [{$p['kategori']}]";
        $md[] = "Link: /product/{$p['slug']}";

        // Image (first one only, for related_links reference)
        if (!empty($p['gambar'])) {
            $firstImage = trim(explode(',', $p['gambar'])[0]);
            $md[] = "Gambar: {$firstImage}";
        }

        // Description (cleaned, max 300 chars)
        if (!empty($p['description'])) {
            $desc = strip_tags($p['description']);
            $desc = preg_replace('/\s+/', ' ', trim($desc));
            if (mb_strlen($desc) > 300) {
                $desc = mb_substr($desc, 0, 300) . '...';
            }
            $md[] = "Deskripsi: {$desc}";
        }

        // Technical specifications
        $specs = $allSpecs[$p['id']] ?? [];
        if (!empty($specs)) {
            $md[] = 'Spesifikasi:';
            foreach ($specs as $spec) {
                $md[] = "- {$spec}";
            }
        }

        // Purchase links
        if (!empty($p['shopee_link'])) {
            $md[] = "Shopee: {$p['shopee_link']}";
        }
        if (!empty($p['inaproc_link'])) {
            $md[] = "INAPROC: {$p['inaproc_link']}";
        }

        $md[] = '';
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 2: PORTFOLIO / INDUSTRIAL INSTALLATIONS
    // ═══════════════════════════════════════════════════════════════════
    $md[] = '## PORTFOLIO & INSTALASI TERBARU';
    $md[] = '';

    $stmt = $db->prepare("
        SELECT id, title, slug, subtitle, location, publish_date
        FROM posts
        WHERE category = 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', MAX_PORTFOLIO_ITEMS, PDO::PARAM_INT);
    $stmt->execute();
    $guides = $stmt->fetchAll();

    if (!empty($guides)) {
        // Pre-fetch deliverables
        $guideIds = array_column($guides, 'id');
        $placeholders = implode(',', array_fill(0, count($guideIds), '?'));
        $delStmt = $db->prepare("
            SELECT post_id, item 
            FROM post_deliverables 
            WHERE post_id IN ({$placeholders}) 
            ORDER BY id
        ");
        $delStmt->execute($guideIds);
        $allDeliverables = [];
        while ($row = $delStmt->fetch()) {
            $allDeliverables[$row['post_id']][] = $row['item'];
        }

        foreach ($guides as $g) {
            $md[] = "### {$g['title']}";
            $md[] = "Link: /portfolio/{$g['slug']}";
            if (!empty($g['location'])) {
                $md[] = "Lokasi: {$g['location']}";
            }
            if (!empty($g['publish_date'])) {
                $md[] = "Tanggal: {$g['publish_date']}";
            }
            if (!empty($g['subtitle'])) {
                $subtitle = mb_strlen($g['subtitle']) > MAX_CONTENT_SUMMARY 
                    ? mb_substr($g['subtitle'], 0, MAX_CONTENT_SUMMARY) . '...' 
                    : $g['subtitle'];
                $md[] = "Ringkasan: {$subtitle}";
            }

            $deliverables = $allDeliverables[$g['id']] ?? [];
            if (!empty($deliverables)) {
                $md[] = 'Cakupan Pekerjaan:';
                foreach ($deliverables as $d) {
                    $md[] = "- {$d}";
                }
            }
            $md[] = '';
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 3: NEWS & ARTICLES
    // ═══════════════════════════════════════════════════════════════════
    $md[] = '## BERITA & ARTIKEL TERBARU';
    $md[] = '';

    $stmt = $db->prepare("
        SELECT id, title, slug, subtitle, category, publish_date
        FROM posts
        WHERE category != 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', MAX_NEWS_ITEMS, PDO::PARAM_INT);
    $stmt->execute();
    $articles = $stmt->fetchAll();

    if (!empty($articles)) {
        foreach ($articles as $a) {
            $md[] = "### {$a['title']}";
            $md[] = "Kategori: {$a['category']}";
            $md[] = "Link: /news/{$a['slug']}";
            if (!empty($a['publish_date'])) {
                $md[] = "Tanggal: {$a['publish_date']}";
            }
            if (!empty($a['subtitle'])) {
                $subtitle = mb_strlen($a['subtitle']) > MAX_CONTENT_SUMMARY 
                    ? mb_substr($a['subtitle'], 0, MAX_CONTENT_SUMMARY) . '...' 
                    : $a['subtitle'];
                $md[] = "Ringkasan: {$subtitle}";
            }
            $md[] = '';
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 4: FAQ TEKNIS (Hardcoded — rarely changes)
    // ═══════════════════════════════════════════════════════════════════
    $md[] = '## FAQ TEKNIS';
    $md[] = '';

    $md[] = 'Q: Bagaimana metode pengiriman mesin ke luar pulau Jawa?';
    $md[] = 'A: Pengiriman via truk ekspedisi logistik antar-pulau atau kargo kapal laut (Sumatera, Kalimantan, Sulawesi, Papua). Teknisi diberangkatkan terpisah untuk perakitan di lokasi.';
    $md[] = '';
    $md[] = 'Q: Berapa kapasitas giling mesin RMU ATEKA?';
    $md[] = 'A: Tipe menengah (1-2 ton/jam) dan industri premium (3-5 ton/jam). Tersedia juga Mobile RMU dengan mesin diesel 24 PK.';
    $md[] = '';
    $md[] = 'Q: Apa perbedaan sistem statis dan Mobile RMU?';
    $md[] = 'A: Statis = operasi permanen dengan elevator vertikal. Mobile = sasis kendaraan (tipe Colt) untuk layanan jemput bola ke lokasi petani.';
    $md[] = '';
    $md[] = 'Q: Apa itu Polisher Satake?';
    $md[] = 'A: Komponen premium dengan derajat sosoh tinggi dan kerusakan butir sangat rendah. Ideal untuk beras premium ekspor.';
    $md[] = '';
    $md[] = 'Q: Bagaimana menekan persentase beras patah?';
    $md[] = 'A: Konfigurasi Huller + Polisher dengan tekanan presisi, beras patah bisa di bawah 5-10%.';
    $md[] = '';
    $md[] = 'Q: Mesin penggerak apa yang digunakan?';
    $md[] = 'A: Mesin otomotif modifikasi (Mitsubishi PS100) atau diesel industri khusus untuk keawetan operasional jangka panjang.';
    $md[] = '';
    $md[] = 'Q: Apakah tersedia mesin pengering (Dryer)?';
    $md[] = 'A: Tersedia Bed Dryer kapasitas 8-10 ton dengan sistem plat frame, gabah mencapai kadar air standar 14%.';
    $md[] = '';
    $md[] = 'Q: Bagaimana perawatan rutin mesin diesel Mobile RMU?';
    $md[] = 'A: Ganti oli setiap 200 jam kerja, bersihkan air filter setiap minggu, bersihkan injektor setiap 3 bulan.';
    $md[] = '';
    $md[] = 'Q: Bisa pesan untuk instansi pemerintah?';
    $md[] = 'A: Ya, kami vendor resmi E-Katalog LKPP (INAPROC). Hubungi kami untuk RAB dan desain spesifikasi sesuai anggaran Dinas Pertanian.';
    $md[] = '';

    // ── Write to cache ───────────────────────────────────────────────
    $output = implode("\n", $md);
    file_put_contents(CONTEXT_CACHE_FILE, $output, LOCK_EX);

    echo $output;

} catch (Exception $e) {
    // Serve stale cache if available
    if (file_exists(CONTEXT_CACHE_FILE)) {
        echo file_get_contents(CONTEXT_CACHE_FILE);
    } else {
        http_response_code(500);
        echo "Error generating chat context.";
    }
}
