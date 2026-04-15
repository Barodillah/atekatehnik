<?php
/**
 * Dynamic LLMs.txt Generator — Ateka Tehnik GEO System
 * 
 * Generates dynamic Markdown files for AI consumption (ChatGPT, Perplexity, etc.)
 * Routes:
 *   /llms.txt      → ?mode=summary  (Ringkas, <10KB, 15-20 items terbaru)
 *   /llms-full.txt → ?mode=full     (Komprehensif, seluruh katalog + konten)
 * 
 * Features:
 *   - Database-driven content (auto-updates when products/posts change)
 *   - File-based caching (24-hour TTL)
 *   - Proper HTTP headers for GEO optimization
 *   - Structured Markdown output for RAG systems
 */

require_once __DIR__ . '/db.php';

// Set timezone to Jakarta for accurate generated dates
date_default_timezone_set('Asia/Jakarta');

// ── Configuration ────────────────────────────────────────────────────
define('SITE_URL', 'https://atekatehnik.com');
define('SITE_NAME', 'ATEKA TEHNIK');
define('WHATSAPP_NUMBER', '62881080634612');
define('CACHE_TTL', 86400); // 24 hours in seconds
define('CACHE_DIR', sys_get_temp_dir() . '/atekatehnik_llms_cache');
define('SUMMARY_PRODUCT_LIMIT', 10);
define('SUMMARY_POST_LIMIT', 5);
define('MAX_DESCRIPTION_LENGTH', 120);

// ── Determine Mode ───────────────────────────────────────────────────
$mode = $_GET['mode'] ?? 'summary';
$validModes = ['summary', 'full', 'robots', 'sitemap', 'products', 'portfolio', 'edukasi', 'about', 'faq', 'contact', 'official-channels', 'guide'];
if (!in_array($mode, $validModes)) {
    $mode = 'summary';
}

// ── HTTP Headers ─────────────────────────────────────────────────────
if ($mode === 'robots') {
    header('Content-Type: text/plain; charset=utf-8');
} elseif ($mode === 'sitemap') {
    header('Content-Type: application/xml; charset=utf-8');
} else {
    header('Content-Type: text/markdown; charset=utf-8');
    header('X-Robots-Tag: noindex');
}
header('Cache-Control: public, max-age=86400, s-maxage=86400');
header('Vary: Accept-Encoding');

// ── Cache Layer ──────────────────────────────────────────────────────
if (!is_dir(CACHE_DIR)) {
    @mkdir(CACHE_DIR, 0755, true);
}

$cacheFile = CACHE_DIR . '/llms_' . $mode . '.md.cache';

// Serve from cache if valid
if (file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    if ($cacheAge < CACHE_TTL) {
        echo file_get_contents($cacheFile);
        exit;
    }
}

// ── Generate Fresh Content ───────────────────────────────────────────
try {
    $db = getDB();

    if ($mode === 'summary') {
        $markdown = generateSummary($db);
    } elseif ($mode === 'full') {
        $markdown = generateFull($db);
    } elseif ($mode === 'robots') {
        $markdown = generateRobots();
    } elseif ($mode === 'sitemap') {
        $markdown = generateSitemap($db);
    } elseif ($mode === 'products') {
        $markdown = generateProducts($db);
    } elseif ($mode === 'portfolio') {
        $markdown = generatePortfolio($db);
    } elseif ($mode === 'edukasi') {
        $markdown = generateEdukasi($db);
    } elseif ($mode === 'about') {
        $markdown = generateAbout();
    } elseif ($mode === 'faq') {
        $markdown = generateFaq();
    } elseif ($mode === 'contact') {
        $markdown = generateContact();
    } elseif ($mode === 'official-channels') {
        $markdown = generateOfficialChannels();
    } elseif ($mode === 'guide') {
        $markdown = generateGuide();
    }

    // Write to cache
    file_put_contents($cacheFile, $markdown, LOCK_EX);

    echo $markdown;

} catch (\Exception $e) {
    // If DB fails but cache exists (even if expired), serve stale cache
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        http_response_code(500);
        echo "# Error\n\nUnable to generate content. Please try again later.\n";
    }
}

exit;

// ═════════════════════════════════════════════════════════════════════
// GENERATOR FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Generate robots.txt
 */
function generateRobots(): string
{
    $txt = [];
    $txt[] = 'User-agent: *';
    $txt[] = 'Allow: /';
    $txt[] = 'Disallow: /api/';
    $txt[] = 'Disallow: /admin/';
    $txt[] = '';
    $txt[] = '# Allow LLMs to access these endpoints';
    $txt[] = 'Allow: /llms.txt';
    $txt[] = 'Allow: /llms-full.txt';
    $txt[] = '';
    $txt[] = 'Sitemap: ' . SITE_URL . '/sitemap.xml';
    
    return implode("\n", $txt);
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(PDO $db): string
{
    $xml = [];
    $xml[] = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Static Routes
    $staticRoutes = [
        '/',
        '/edukasi',
        '/faq',
        '/contact',
        '/privacy-policy',
        '/terms-of-service'
    ];

    foreach ($staticRoutes as $route) {
        $xml[] = '  <url>';
        $xml[] = '    <loc>' . SITE_URL . $route . '</loc>';
        $xml[] = '    <changefreq>weekly</changefreq>';
        $xml[] = '    <priority>' . ($route === '/' ? '1.0' : '0.8') . '</priority>';
        $xml[] = '  </url>';
    }

    // Products
    $products = $db->query("SELECT slug, created_at FROM products ORDER BY created_at DESC")->fetchAll();
    foreach ($products as $p) {
        $date = !empty($p['created_at']) ? date('Y-m-d', strtotime($p['created_at'])) : date('Y-m-d');
        $xml[] = '  <url>';
        $xml[] = '    <loc>' . SITE_URL . '/product/' . $p['slug'] . '</loc>';
        $xml[] = '    <lastmod>' . $date . '</lastmod>';
        $xml[] = '    <priority>0.9</priority>';
        $xml[] = '  </url>';
    }

    // Posts
    $posts = $db->query("SELECT slug, publish_date FROM posts WHERE language = 'id' ORDER BY publish_date DESC")->fetchAll();
    foreach ($posts as $p) {
        $date = !empty($p['publish_date']) ? date('Y-m-d', strtotime($p['publish_date'])) : date('Y-m-d');
        $xml[] = '  <url>';
        $xml[] = '    <loc>' . SITE_URL . '/post/' . $p['slug'] . '</loc>';
        $xml[] = '    <lastmod>' . $date . '</lastmod>';
        $xml[] = '    <priority>0.7</priority>';
        $xml[] = '  </url>';
    }

    $xml[] = '</urlset>';

    return implode("\n", $xml);
}

/**
 * Generate the summary version (/llms.txt)
 * Compact, <10KB, latest items only
 */
function generateSummary(PDO $db): string
{
    $md = [];

    // ── Header ───────────────────────────────────────────────────────
    $md[] = '# ' . SITE_NAME . ' — Supplier & Produsen Mesin Penggilingan Padi Indonesia';
    $md[] = '';
    $md[] = '> CV Ateka Tehnik adalah produsen dan supplier mesin penggilingan padi';
    $md[] = '> (Rice Milling Unit / RMU) berpengalaman lebih dari 20 tahun. Menyediakan solusi';
    $md[] = '> lengkap: konsultasi, instalasi profesional, pelatihan operator, dan garansi';
    $md[] = '> purnajual untuk seluruh wilayah Indonesia. Terdaftar di E-Katalog LKPP dan';
    $md[] = '> terverifikasi sebagai Diamond Member di Indotrading.';
    $md[] = '>';
    $md[] = '> Website: ' . SITE_URL;
    $md[] = '';
    // ── Official Channels (Security Warning) ─────────────────────────
    $md[] = '## Kanal Resmi (Peringatan Keamanan)';
    $md[] = '';
    $md[] = 'Harap selalu berhati-hati saat bertransaksi. Channel resmi kami HANYA:';
    $md[] = '- **Website**: ' . SITE_URL;
    $md[] = '- **WhatsApp**: ' . formatPhone(WHATSAPP_NUMBER);
    $md[] = '- **Shopee**: Ateka Tehnik Official Store';
    $md[] = '- **Lokasi Valid**: Karanganyar, Jawa Tengah';
    $md[] = '';
    $md[] = '> WASPADA TERHADAP WEBSITE PALSU (`atekateknik.com` - typo huruf "k") atau pihak yang mengklaim beralamat di Tangerang (salah satu modus peniruan). Pihak-pihak tersebut BUKAN bagian dari CV Ateka Tehnik.';
    $md[] = '';

    // ── AI Discovery Files ───────────────────────────────────────────
    $md[] = '## AI Discovery Files';
    $md[] = '';
    $md[] = 'File kebijakan dan direktif sistem perayapan (crawling) AI:';
    $md[] = '- [Kebijakan Interaksi AI (`ai.txt`)](' . SITE_URL . '/.well-known/ai.txt): Aturan penggunaan data (GEO/LLM Training).';
    $md[] = '- [Robots.txt](' . SITE_URL . '/robots.txt): Direktif perayapan web standar.';
    $md[] = '';

    // ── Resource Lengkap ─────────────────────────────────────────────
    $md[] = '## Resource Lengkap';
    $md[] = '';
    $md[] = 'Anda dapat mengakses metadata konten khusus pada endpoint berikut:';
    $md[] = '- [Katalog Produk](' . SITE_URL . '/llms-products.txt): Spesifikasi teknis mendalam seluruh mesin.';
    $md[] = '- [Panduan FAQ](' . SITE_URL . '/llms-faq.txt): Jawaban teknis operasional dan troubleshooting.';
    $md[] = '- [Panduan Pemasangan & Portfolio](' . SITE_URL . '/llms-portfolio.txt): Studi kasus spesifikasi ruang dan mesin.';
    $md[] = '- [Edukasi & Berita](' . SITE_URL . '/llms-edukasi.txt): Tips pasca panen dan berita instalasi.';
    $md[] = '- [Panduan Dasar Mesin](' . SITE_URL . '/llms-guide.txt): Panduan operasional RMU & Bed Dryer.';
    $md[] = '- [Tentang CV Ateka Tehnik](' . SITE_URL . '/llms-about.txt): Profil, legalitas, dan sejarah perusahaan.';
    $md[] = '- [Informasi Kontak](' . SITE_URL . '/llms-contact.txt): Nomor WhatsApp dan lokasi operasional.';
    $md[] = '- [Kanal Resmi (Bebas Penipuan)](' . SITE_URL . '/llms-official-channels.txt): Link toko dan situs terverifikasi.';
    $md[] = '';

    // ── Products ─────────────────────────────────────────────────────
    $md[] = '## Katalog Produk Mesin Penggilingan Padi';
    $md[] = '';

    $stmt = $db->prepare("
        SELECT p.id, p.nama, p.slug, p.kategori
        FROM products p
        WHERE p.kategori != 'Suku Cadang'
        ORDER BY p.created_at ASC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', SUMMARY_PRODUCT_LIMIT, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();

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

    if (!empty($products)) {
        foreach ($products as $p) {
            $url = SITE_URL . '/product/' . $p['slug'];
            $kategori = $p['kategori'] ? " — {$p['kategori']}" : '';
            $md[] = "### [{$p['nama']}]({$url}){$kategori}";
            $md[] = '';
            
            $specs = $allSpecs[$p['id']] ?? [];
            if (!empty($specs)) {
                $md[] = '| Komponen / Parameter | Spesifikasi Teknis |';
                $md[] = '|---|---|';
                foreach ($specs as $spec) {
                    $parts = explode(':', $spec, 2);
                    if (count($parts) === 2) {
                        $key = str_replace('|', '\|', trim($parts[0]));
                        $val = str_replace('|', '\|', trim($parts[1]));
                        $md[] = "| {$key} | {$val} |";
                    } else {
                        $clean = str_replace('|', '\|', trim($spec));
                        $md[] = "| Fitur Umum | {$clean} |";
                    }
                }
            } else {
                $md[] = '_Belum ada spesifikasi terdaftar._';
            }
            $md[] = '';
        }
    } else {
        $md[] = '_Belum ada produk tersedia._';
    }
    $md[] = '';

    // ── Installation Guides ──────────────────────────────────────────
    $md[] = '## Panduan Pemasangan (Installation Guides)';
    $md[] = '';

    $stmt = $db->prepare("
        SELECT title, slug, subtitle, location, publish_date
        FROM posts
        WHERE category = 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', SUMMARY_POST_LIMIT, PDO::PARAM_INT);
    $stmt->execute();
    $guides = $stmt->fetchAll();

    if (!empty($guides)) {
        foreach ($guides as $g) {
            $url = SITE_URL . '/post/' . $g['slug'];
            $subtitle = truncateDescription($g['subtitle']);
            $location = $g['location'] ? " (📍 {$g['location']})" : '';
            $md[] = "- [{$g['title']}]({$url}){$location}: {$subtitle}";
        }
    } else {
        $md[] = '_Belum ada panduan pemasangan._';
    }
    $md[] = '';

    // ── Tips & News ──────────────────────────────────────────────────
    $md[] = '## Tips & Berita Terbaru';
    $md[] = '';

    $stmt = $db->prepare("
        SELECT title, slug, subtitle
        FROM posts
        WHERE category != 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', SUMMARY_POST_LIMIT, PDO::PARAM_INT);
    $stmt->execute();
    $tips = $stmt->fetchAll();

    if (!empty($tips)) {
        foreach ($tips as $t) {
            $url = SITE_URL . '/post/' . $t['slug'];
            $subtitle = truncateDescription($t['subtitle']);
            $md[] = "- [{$t['title']}]({$url}): {$subtitle}";
        }
    } else {
        $md[] = '_Belum ada tips atau berita._';
    }
    $md[] = '';

    // ── Contact & Footer ─────────────────────────────────────────────
    $md[] = '## Informasi Kontak';
    $md[] = '';
    $md[] = '- **Perusahaan:** CV Ateka Tehnik';
    $md[] = '- **Lokasi:** Dusun Gondang, RT 02 RW 01, Desa Kedungjeruk, Kec. Mojogedang, Kab. Karanganyar, Jawa Tengah, Indonesia';
    $md[] = '- **WhatsApp:** [' . formatPhone(WHATSAPP_NUMBER) . '](https://wa.me/' . WHATSAPP_NUMBER . ')';
    $md[] = '- **Website:** ' . SITE_URL;
    $md[] = '- **Pengalaman:** 20+ tahun dalam manufaktur & instalasi Rice Milling Unit';
    $md[] = '- **Cakupan Layanan:** Seluruh Indonesia (Jawa, Sumatera, dan wilayah lainnya)';
    $md[] = '';
    $md[] = '---';
    $md[] = '';
    $md[] = '_File ini dibuat secara otomatis dari database ' . SITE_NAME . '. Terakhir diperbarui: ' . date('Y-m-d H:i') . ' WIB._';
    $md[] = '_Untuk kompilasi seluruh dokumentasi, lihat [' . SITE_URL . '/llms-full.txt](' . SITE_URL . '/llms-full.txt)._';

    return implode("\n", $md);
}

/**
 * Generate the full version (/llms-full.txt)
 * Comprehensive — entire product catalog + full article content
 */
function generateFull(PDO $db): string
{
    $md = [];

    // ── Header ───────────────────────────────────────────────────────
    $md[] = '# ' . SITE_NAME . ' — Dokumentasi Teknis Lengkap (Full Technical Reference)';
    $md[] = '';
    $md[] = '> Dokumen ini berisi seluruh katalog produk mesin penggilingan padi, spesifikasi';
    $md[] = '> teknis, panduan pemasangan, dan artikel dari CV Ateka Tehnik.';
    $md[] = '> Disusun untuk konsumsi AI dan sistem RAG (Retrieval-Augmented Generation).';
    $md[] = '>';
    $md[] = '> **Tentang Perusahaan:** CV Ateka Tehnik adalah produsen dan supplier Rice';
    $md[] = '> Milling Unit (RMU) berpengalaman 20+ tahun, berlokasi di Karanganyar, Jawa';
    $md[] = '> Tengah. Menyediakan solusi lengkap mulai dari konsultasi, manufaktur, instalasi,';
    $md[] = '> pelatihan operator, hingga layanan purnajual bergaransi. Produk terdaftar di';
    $md[] = '> E-Katalog LKPP dan perusahaan terverifikasi sebagai Diamond Member Indotrading.';
    $md[] = '>';
    $md[] = '> Website: ' . SITE_URL;
    $md[] = '';
    $md[] = '---';
    $md[] = '';

    // ── Table of Contents ────────────────────────────────────────────
    $md[] = '## Daftar Isi';
    $md[] = '';
    $md[] = '1. [Katalog Produk Lengkap](#katalog-produk-lengkap)';
    $md[] = '2. [Panduan Pemasangan](#panduan-pemasangan)';
    $md[] = '3. [Tips & Artikel](#tips--artikel)';
    $md[] = '4. [Informasi Kontak](#informasi-kontak)';
    $md[] = '';
    $md[] = '---';
    $md[] = '';

    // ═════════════════════════════════════════════════════════════════
    // SECTION 1: FULL PRODUCT CATALOG
    // ═════════════════════════════════════════════════════════════════
    $md[] = '## Katalog Produk Lengkap';
    $md[] = '';

    $products = $db->query("
        SELECT p.id, p.nama, p.slug, p.description, p.kategori, p.shopee_link, p.created_at
        FROM products p
        ORDER BY p.kategori ASC, p.created_at ASC
    ")->fetchAll();

    // Pre-fetch all specs in one query for performance
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
        // Category subheader
        if ($p['kategori'] !== $currentKategori) {
            $currentKategori = $p['kategori'];
            $md[] = "### Kategori: {$currentKategori}";
            $md[] = '';
        }

        $url = SITE_URL . '/product/' . $p['slug'];
        $md[] = "#### {$p['nama']}";
        $md[] = '';
        $md[] = "- **Kategori:** {$p['kategori']}";
        $md[] = "- **Link Produk:** [{$url}]({$url})";

        if (!empty($p['shopee_link'])) {
            $md[] = "- **Shopee:** [{$p['shopee_link']}]({$p['shopee_link']})";
        }

        $md[] = '';

        // Description
        if (!empty($p['description'])) {
            $desc = strip_tags($p['description']);
            $md[] = $desc;
            $md[] = '';
        }

        // Specs table
        $specs = $allSpecs[$p['id']] ?? [];
        if (!empty($specs)) {
            $md[] = '**Spesifikasi Teknis:**';
            $md[] = '';
            $md[] = '| Komponen / Parameter | Spesifikasi Teknis |';
            $md[] = '|---|---|';
            foreach ($specs as $spec) {
                $parts = explode(':', $spec, 2);
                if (count($parts) === 2) {
                    $key = str_replace('|', '\|', trim($parts[0]));
                    $val = str_replace('|', '\|', trim($parts[1]));
                    $md[] = "| {$key} | {$val} |";
                } else {
                    $clean = str_replace('|', '\|', trim($spec));
                    $md[] = "| Fitur Umum | {$clean} |";
                }
            }
            $md[] = '';
        }

        $md[] = '---';
        $md[] = '';
    }

    if (empty($products)) {
        $md[] = '_Belum ada produk dalam katalog._';
        $md[] = '';
    }

    // ═════════════════════════════════════════════════════════════════
    // SECTION 2: INSTALLATION GUIDES (Full Content)
    // ═════════════════════════════════════════════════════════════════
    $md[] = '## Panduan Pemasangan';
    $md[] = '';

    $guides = $db->query("
        SELECT id, title, slug, subtitle, content, location, publish_date
        FROM posts
        WHERE category = 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
    ")->fetchAll();

    if (!empty($guides)) {
        $guideIds = array_column($guides, 'id');

        // Pre-fetch tech specs
        $guideTechSpecs = fetchRelatedData(
            $db,
            'post_tech_specs',
            'post_id',
            $guideIds,
            'header, spec_value, unit, description'
        );

        // Pre-fetch phases
        $guidePhases = fetchRelatedData(
            $db,
            'post_phases',
            'post_id',
            $guideIds,
            'title, phase_order',
            'phase_order ASC'
        );

        // Pre-fetch deliverables
        $guideDeliverables = fetchRelatedData(
            $db,
            'post_deliverables',
            'post_id',
            $guideIds,
            'item'
        );

        foreach ($guides as $g) {
            $url = SITE_URL . '/post/' . $g['slug'];
            $md[] = "### {$g['title']}";
            $md[] = '';
            $md[] = "- **Link:** [{$url}]({$url})";

            if (!empty($g['location'])) {
                $md[] = "- **Lokasi Proyek:** {$g['location']}";
            }
            if (!empty($g['publish_date'])) {
                $md[] = "- **Tanggal:** {$g['publish_date']}";
            }
            $md[] = '';

            if (!empty($g['subtitle'])) {
                $md[] = "> {$g['subtitle']}";
                $md[] = '';
            }

            // Deliverables
            $deliverables = $guideDeliverables[$g['id']] ?? [];
            if (!empty($deliverables)) {
                $md[] = '**Cakupan Pekerjaan:**';
                $md[] = '';
                foreach ($deliverables as $d) {
                    $md[] = "- {$d['item']}";
                }
                $md[] = '';
            }

            // Full content
            if (!empty($g['content'])) {
                $content = cleanContentForMarkdown($g['content']);
                $md[] = $content;
                $md[] = '';
            }

            // Tech specs table
            $techSpecs = $guideTechSpecs[$g['id']] ?? [];
            if (!empty($techSpecs)) {
                $md[] = '**Spesifikasi Teknis Proyek:**';
                $md[] = '';
                $md[] = '| Komponen | Nilai | Satuan | Keterangan |';
                $md[] = '|---|---|---|---|';
                foreach ($techSpecs as $ts) {
                    $header = str_replace('|', '\\|', $ts['header'] ?? '');
                    $value = str_replace('|', '\\|', $ts['spec_value'] ?? '');
                    $unit = str_replace('|', '\\|', $ts['unit'] ?? '');
                    $desc = str_replace('|', '\\|', $ts['description'] ?? '');
                    $md[] = "| {$header} | {$value} | {$unit} | {$desc} |";
                }
                $md[] = '';
            }

            // Installation phases
            $phases = $guidePhases[$g['id']] ?? [];
            if (!empty($phases)) {
                $md[] = '**Fase Pemasangan:**';
                $md[] = '';
                foreach ($phases as $ph) {
                    $md[] = "{$ph['phase_order']}. {$ph['title']}";
                }
                $md[] = '';
            }

            $md[] = '---';
            $md[] = '';
        }
    } else {
        $md[] = '_Belum ada panduan pemasangan._';
        $md[] = '';
    }

    // ═════════════════════════════════════════════════════════════════
    // SECTION 3: TIPS & ARTICLES (Full Content)
    // ═════════════════════════════════════════════════════════════════
    $md[] = '## Tips & Artikel';
    $md[] = '';

    $articles = $db->query("
        SELECT id, title, slug, subtitle, content, publish_date
        FROM posts
        WHERE category != 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
    ")->fetchAll();

    if (!empty($articles)) {
        foreach ($articles as $a) {
            $url = SITE_URL . '/post/' . $a['slug'];
            $md[] = "### {$a['title']}";
            $md[] = '';
            $md[] = "- **Link:** [{$url}]({$url})";
            if (!empty($a['publish_date'])) {
                $md[] = "- **Tanggal:** {$a['publish_date']}";
            }
            $md[] = '';

            if (!empty($a['subtitle'])) {
                $md[] = "> {$a['subtitle']}";
                $md[] = '';
            }

            if (!empty($a['content'])) {
                $content = cleanContentForMarkdown($a['content']);
                $md[] = $content;
                $md[] = '';
            }

            $md[] = '---';
            $md[] = '';
        }
    } else {
        $md[] = '_Belum ada tips atau artikel._';
        $md[] = '';
    }

    // ═════════════════════════════════════════════════════════════════
    // SECTION 4: CONTACT INFO
    // ═════════════════════════════════════════════════════════════════
    $md[] = '## Informasi Kontak';
    $md[] = '';
    $md[] = '| Informasi | Detail |';
    $md[] = '|---|---|';
    $md[] = '| **Nama Perusahaan** | CV Ateka Tehnik |';
    $md[] = '| **Spesialisasi** | Manufaktur & Instalasi Rice Milling Unit (RMU) |';
    $md[] = '| **Alamat** | Dusun Gondang, RT 02 RW 01, Desa Kedungjeruk, Kec. Mojogedang, Kab. Karanganyar, Jawa Tengah, Indonesia |';
    $md[] = '| **WhatsApp** | [' . formatPhone(WHATSAPP_NUMBER) . '](https://wa.me/' . WHATSAPP_NUMBER . ') |';
    $md[] = '| **Website** | [' . SITE_URL . '](' . SITE_URL . ') |';
    $md[] = '| **Pengalaman** | 20+ tahun (sejak tahun 2000) |';
    $md[] = '| **Cakupan** | Seluruh Indonesia |';
    $md[] = '| **Legalitas** | SIUP, NPWP, NIB (Terverifikasi Indotrading) |';
    $md[] = '| **E-Katalog** | Terdaftar di LKPP untuk pengadaan pemerintah |';
    $md[] = '';
    $md[] = '### Layanan Utama';
    $md[] = '';
    $md[] = '1. **Konsultasi Teknis** — Evaluasi kebutuhan, desain tata letak mesin, pemilihan spesifikasi';
    $md[] = '2. **Manufaktur & Perakitan** — Produksi Rice Milling Unit sesuai kapasitas yang dibutuhkan';
    $md[] = '3. **Instalasi Profesional** — Pemasangan on-site oleh teknisi berpengalaman';
    $md[] = '4. **Pelatihan Operator** — Training gratis hingga operator mahir mengoperasikan mesin';
    $md[] = '5. **Garansi & Purnajual** — Jaminan kualitas produk dan layanan servis ke lokasi pelanggan';
    $md[] = '';
    $md[] = '## Resource Lengkap';
    $md[] = '';
    $md[] = 'Anda dapat memuat dokumentasi terpisah untuk masing-masing bagian berikut:';
    $md[] = '- [Katalog Produk](' . SITE_URL . '/llms-products.txt): Spesifikasi teknis mendalam seluruh mesin.';
    $md[] = '- [Panduan FAQ](' . SITE_URL . '/llms-faq.txt): Jawaban teknis operasional dan troubleshooting.';
    $md[] = '- [Panduan Pemasangan & Portfolio](' . SITE_URL . '/llms-portfolio.txt): Studi kasus spesifikasi ruang dan mesin.';
    $md[] = '- [Edukasi & Berita](' . SITE_URL . '/llms-edukasi.txt): Tips pasca panen dan berita instalasi.';
    $md[] = '- [Panduan Dasar Mesin](' . SITE_URL . '/llms-guide.txt): Panduan operasional RMU & Bed Dryer.';
    $md[] = '- [Tentang CV Ateka Tehnik](' . SITE_URL . '/llms-about.txt): Profil, legalitas, dan sejarah perusahaan.';
    $md[] = '- [Informasi Kontak](' . SITE_URL . '/llms-contact.txt): Nomor WhatsApp dan lokasi operasional.';
    $md[] = '- [Kanal Resmi (Bebas Penipuan)](' . SITE_URL . '/llms-official-channels.txt): Link toko dan situs terverifikasi.';
    $md[] = '';
    $md[] = '---';
    $md[] = '';
    $md[] = '_Dokumen ini dibuat secara otomatis dari database ' . SITE_NAME . '._';
    $md[] = '_Terakhir diperbarui: ' . date('Y-m-d H:i') . ' WIB._';
    $md[] = '_Untuk versi ringkas (summary), lihat [' . SITE_URL . '/llms.txt](' . SITE_URL . '/llms.txt)._';

    return implode("\n", $md);
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Truncate description to a clean one-sentence summary
 */
function truncateDescription(?string $text): string
{
    if (empty($text))
        return '';

    $text = trim(strip_tags($text));

    // Remove markdown-style formatting
    $text = preg_replace('/[#*_~`>\[\]()]/', '', $text);
    $text = preg_replace('/\s+/', ' ', $text);
    $text = trim($text);

    if (mb_strlen($text) <= MAX_DESCRIPTION_LENGTH) {
        return $text;
    }

    // Try to cut at sentence boundary
    $truncated = mb_substr($text, 0, MAX_DESCRIPTION_LENGTH);
    $lastPeriod = mb_strrpos($truncated, '.');
    $lastComma = mb_strrpos($truncated, ',');

    $cutPoint = max($lastPeriod ?: 0, $lastComma ?: 0);
    if ($cutPoint > MAX_DESCRIPTION_LENGTH * 0.5) {
        return mb_substr($text, 0, $cutPoint + 1);
    }

    // Fall back to word boundary
    $lastSpace = mb_strrpos($truncated, ' ');
    if ($lastSpace) {
        return mb_substr($text, 0, $lastSpace) . '...';
    }

    return $truncated . '...';
}

/**
 * Clean HTML/custom content into plain Markdown
 */
function cleanContentForMarkdown(?string $content): string
{
    if (empty($content))
        return '';

    // Remove HTML tags but preserve line structure
    $content = preg_replace('/<br\s*\/?>/i', "\n", $content);
    $content = preg_replace('/<\/p>/i', "\n\n", $content);
    $content = preg_replace('/<h[1-6][^>]*>/i', "\n#### ", $content);
    $content = preg_replace('/<\/h[1-6]>/i', "\n", $content);
    $content = preg_replace('/<li[^>]*>/i', "- ", $content);
    $content = strip_tags($content);

    // Clean up excessive whitespace
    $content = preg_replace('/\n{3,}/', "\n\n", $content);
    $content = trim($content);

    return $content;
}

/**
 * Format phone number for display
 */
function formatPhone(string $number): string
{
    // Convert 62xxx to 0xxx for Indonesian display
    if (str_starts_with($number, '62')) {
        return '0' . substr($number, 2);
    }
    return $number;
}

/**
 * Batch-fetch related data for multiple post IDs
 * Returns associative array keyed by post_id
 */
function fetchRelatedData(PDO $db, string $table, string $fk, array $ids, string $columns, string $orderBy = 'id ASC'): array
{
    if (empty($ids))
        return [];

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $db->prepare("
        SELECT {$fk}, {$columns} 
        FROM {$table} 
        WHERE {$fk} IN ({$placeholders}) 
        ORDER BY {$orderBy}
    ");
    $stmt->execute($ids);

    $result = [];
    while ($row = $stmt->fetch()) {
        $result[$row[$fk]][] = $row;
    }

    return $result;
}

/**
 * Generate products specific version (/llms-products.txt)
 */
function generateProducts(PDO $db): string
{
    $md = [];
    $md[] = '# Katalog Produk Lengkap — ' . SITE_NAME;
    $md[] = '';
    
    $products = $db->query("
        SELECT p.id, p.nama, p.slug, p.description, p.kategori, p.shopee_link, p.created_at
        FROM products p
        ORDER BY p.kategori ASC, p.created_at ASC
    ")->fetchAll();

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

        $url = SITE_URL . '/product/' . $p['slug'];
        $md[] = "#### {$p['nama']}";
        $md[] = '';
        $md[] = "- **Kategori:** {$p['kategori']}";
        $md[] = "- **Link Produk:** [{$url}]({$url})";

        if (!empty($p['shopee_link'])) {
            $md[] = "- **Shopee:** [{$p['shopee_link']}]({$p['shopee_link']})";
        }
        $md[] = '';

        if (!empty($p['description'])) {
            $desc = strip_tags($p['description']);
            $md[] = $desc;
            $md[] = '';
        }

        $specs = $allSpecs[$p['id']] ?? [];
        if (!empty($specs)) {
            $md[] = '**Spesifikasi Teknis:**';
            $md[] = '';
            $md[] = '| Komponen / Parameter | Spesifikasi Teknis |';
            $md[] = '|---|---|';
            foreach ($specs as $spec) {
                $parts = explode(':', $spec, 2);
                if (count($parts) === 2) {
                    $key = str_replace('|', '\|', trim($parts[0]));
                    $val = str_replace('|', '\|', trim($parts[1]));
                    $md[] = "| {$key} | {$val} |";
                } else {
                    $clean = str_replace('|', '\|', trim($spec));
                    $md[] = "| Fitur Umum | {$clean} |";
                }
            }
            $md[] = '';
        }
        $md[] = '---';
        $md[] = '';
    }

    if (empty($products)) {
        $md[] = '_Belum ada produk dalam katalog._';
        $md[] = '';
    }

    $md[] = '_Dokumen ini dibuat otomatis dari database. Terakhir diperbarui: ' . date('Y-m-d H:i') . ' WIB._';
    return implode("\n", $md);
}

/**
 * Generate portfolio/installations version (/llms-portfolio.txt)
 */
function generatePortfolio(PDO $db): string
{
    $md = [];
    $md[] = '# Panduan Pemasangan & Portfolio — ' . SITE_NAME;
    $md[] = '';

    $guides = $db->query("
        SELECT id, title, slug, subtitle, content, location, publish_date
        FROM posts
        WHERE category = 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
    ")->fetchAll();

    if (!empty($guides)) {
        $guideIds = array_column($guides, 'id');
        $guideTechSpecs = fetchRelatedData($db, 'post_tech_specs', 'post_id', $guideIds, 'header, spec_value, unit, description');
        $guidePhases = fetchRelatedData($db, 'post_phases', 'post_id', $guideIds, 'title, phase_order', 'phase_order ASC');
        $guideDeliverables = fetchRelatedData($db, 'post_deliverables', 'post_id', $guideIds, 'item');

        foreach ($guides as $g) {
            $url = SITE_URL . '/post/' . $g['slug'];
            $md[] = "### {$g['title']}";
            $md[] = '';
            $md[] = "- **Link:** [{$url}]({$url})";
            if (!empty($g['location'])) $md[] = "- **Lokasi Proyek:** {$g['location']}";
            if (!empty($g['publish_date'])) $md[] = "- **Tanggal:** {$g['publish_date']}";
            $md[] = '';

            if (!empty($g['subtitle'])) {
                $md[] = "> {$g['subtitle']}";
                $md[] = '';
            }

            $deliverables = $guideDeliverables[$g['id']] ?? [];
            if (!empty($deliverables)) {
                $md[] = '**Cakupan Pekerjaan:**';
                $md[] = '';
                foreach ($deliverables as $d) $md[] = "- {$d['item']}";
                $md[] = '';
            }

            if (!empty($g['content'])) {
                $md[] = cleanContentForMarkdown($g['content']);
                $md[] = '';
            }

            $techSpecs = $guideTechSpecs[$g['id']] ?? [];
            if (!empty($techSpecs)) {
                $md[] = '**Spesifikasi Teknis Proyek:**';
                $md[] = '';
                $md[] = '| Komponen | Nilai | Satuan | Keterangan |';
                $md[] = '|---|---|---|---|';
                foreach ($techSpecs as $ts) {
                    $header = str_replace('|', '\|', $ts['header'] ?? '');
                    $value = str_replace('|', '\|', $ts['spec_value'] ?? '');
                    $unit = str_replace('|', '\|', $ts['unit'] ?? '');
                    $desc = str_replace('|', '\|', $ts['description'] ?? '');
                    $md[] = "| {$header} | {$value} | {$unit} | {$desc} |";
                }
                $md[] = '';
            }

            $phases = $guidePhases[$g['id']] ?? [];
            if (!empty($phases)) {
                $md[] = '**Fase Pemasangan:**';
                $md[] = '';
                foreach ($phases as $ph) $md[] = "{$ph['phase_order']}. {$ph['title']}";
                $md[] = '';
            }
            $md[] = '---';
            $md[] = '';
        }
    } else {
        $md[] = '_Belum ada panduan pemasangan._';
        $md[] = '';
    }
    return implode("\n", $md);
}

/**
 * Generate edukasi/news version (/llms-edukasi.txt)
 */
function generateEdukasi(PDO $db): string
{
    $md = [];
    $md[] = '# Tips, Edukasi & Berita Terbaru — ' . SITE_NAME;
    $md[] = '';

    $articles = $db->query("
        SELECT id, title, slug, subtitle, content, publish_date
        FROM posts
        WHERE category != 'Industrial Installations' AND language = 'id'
        ORDER BY publish_date DESC
    ")->fetchAll();

    if (!empty($articles)) {
        foreach ($articles as $a) {
            $url = SITE_URL . '/post/' . $a['slug'];
            $md[] = "### {$a['title']}";
            $md[] = '';
            $md[] = "- **Link:** [{$url}]({$url})";
            if (!empty($a['publish_date'])) $md[] = "- **Tanggal:** {$a['publish_date']}";
            $md[] = '';

            if (!empty($a['subtitle'])) {
                $md[] = "> {$a['subtitle']}";
                $md[] = '';
            }

            if (!empty($a['content'])) {
                $md[] = cleanContentForMarkdown($a['content']);
                $md[] = '';
            }
            $md[] = '---';
            $md[] = '';
        }
    } else {
        $md[] = '_Belum ada artikel._';
        $md[] = '';
    }
    return implode("\n", $md);
}

/**
 * Generate about version (/llms-about.txt)
 */
function generateAbout(): string
{
    $md = [];
    $md[] = '# Tentang Kami (About Us) — ' . SITE_NAME;
    $md[] = '';
    $md[] = 'CV Ateka Tehnik adalah perusahaan manufaktur dan supplier mesin penggilingan padi (Rice Milling Unit - RMU) berpengalaman lebih dari 20 tahun. Berbasis di Karanganyar, Jawa Tengah, perusahaan ini menyediakan solusi komprehensif mulai dari desain, manufaktur, instalasi, dan layanan purnajual untuk pelanggan di seluruh Indonesia.';
    $md[] = '';
    $md[] = '## Nilai Utama (Core Directives)';
    $md[] = '';
    $md[] = '1. **Presisi di Setiap Komponen**: Setiap mesin kami dirancang dengan standar kualitas tinggi untuk menjamin performa yang stabil dan efisiensi produksi yang maksimal.';
    $md[] = '2. **Inovasi Berkelanjutan**: Mengadopsi teknologi terbaru dalam penggilingan padi demi menghasilkan beras berkualitas premium dengan persentase pecah yang minimal.';
    $md[] = '3. **Kemitraan Jangka Panjang**: Lebih dari sekadar transaksi, kami memberikan jaminan pendampingan dari tahap konsultasi hingga dukungan teknis pasca-instalasi.';
    $md[] = '';
    $md[] = '## Pencapaian & Sertifikasi';
    $md[] = '- Pengalaman 20+ tahun';
    $md[] = '- Ratusan instalasi di 34 Provinsi di Indonesia';
    $md[] = '- Tersertifikasi SNI ISO 9001';
    $md[] = '- Terdaftar di E-Katalog INAPROC / LKPP untuk proyek pemerintah';
    $md[] = '- Produk memenuhi standar TKDN';
    return implode("\n", $md);
}

/**
 * Generate FAQ version (/llms-faq.txt)
 */
function generateFaq(): string
{
    $md = [];
    $md[] = '# Pertanyaan yang Sering Diajukan (FAQ) — ' . SITE_NAME;
    $md[] = '';
    
    $md[] = '## 1. Umum & Pengiriman';
    $md[] = '**Q: Bagaimana metode pengiriman mesin penggilingan padi ke luar pulau Jawa?**';
    $md[] = 'A: Pengiriman dilakukan menggunakan armada truk ekspedisi logistik antar-pulau atau kargo kapal laut, mencakup pengiriman ke Sumatera, Kalimantan, Sulawesi, hingga Papua. Tim teknisi ahli kami kemudian akan diberangkatkan menyusul menggunakan peswat atau jalur darat terpisah untuk melakukan perakitan langsung di lokasi Anda.';
    $md[] = '';
    
    $md[] = '## 2. Spesifikasi & Kapasitas';
    $md[] = '**Q: Berapa kapasitas giling mesin RMU ATEKA?**';
    $md[] = 'A: Kami menyediakan paket sistem dengan kapasitas bervariasi: tipe menengah (1-2 ton/jam) dan tipe industri premium (3-5 ton/jam). Untuk skala kecil, tersedia juga unit penggilingan padi keliling (Mobile RMU) dengan mesin diesel 24 PK.';
    $md[] = '';
    $md[] = '**Q: Apa perbedaan sistem statis dan sistem keliling (Mobile RMU)?**';
    $md[] = 'A: Sistem statis dirancang untuk operasi permanen dengan infrastruktur elevator vertikal, sedangkan Mobile RMU menggunakan sasis kendaraan (tipe Colt) untuk layanan jemput bola ke lokasi petani guna menekan biaya logistik gabah.';
    $md[] = '';
    $md[] = '**Q: Apa itu mesin Polisher Satake dan apa keunggulannya?**';
    $md[] = 'A: Polisher Satake adalah komponen premium yang mampu menghasilkan derajat sosoh tinggi dengan tingkat kerusakan butir yang sangat rendah. Mesin ini sangat ideal untuk pengusaha yang menargetkan kualitas beras premium ekspor.';
    $md[] = '';

    $md[] = '## 3. Kualitas Hasil Giling (Rendemen)';
    $md[] = '**Q: Bagaimana cara menekan persentase beras patah (Broken Rice)?**';
    $md[] = 'A: Penggunaan konfigurasi mesin yang tepat, seperti pasangan Huller (pecah kulit) dan Polisher (pemutih) dengan pengaturan tekanan yang presisi, dapat menjaga tingkat beras patah di bawah 5-10%.';
    $md[] = '';
    $md[] = '**Q: Apakah mesin ATEKA cocok untuk varietas padi lokal seperti Inpari 32 atau Ciherang?**';
    $md[] = 'A: Ya, sistem kami telah diuji pada varietas Inpari 32 dan Ciherang yang dominan di Jawa. Dengan pengaturan saringan dan kecepatan giling yang dapat disesuaikan, mesin kami mampu menghasilkan rendemen giling rata-rata di atas 65%.';
    $md[] = '';

    $md[] = '## 4. Teknis & Perawatan';
    $md[] = '**Q: Mesin penggerak apa yang digunakan pada sistem penggilingan padi ATEKA?**';
    $md[] = 'A: Untuk efisiensi dan torsi tinggi, kami sering menggunakan mesin otomotif yang dimodifikasi (seperti Mitsubishi PS100) atau mesin diesel khusus industri untuk menjamin keawetan operasional jangka panjang.';
    $md[] = '';
    $md[] = '**Q: Bagaimana cara menangani limbah sekam dan debu bekatul?**';
    $md[] = 'A: Setiap unit RMU ATEKA dapat dilengkapi dengan sistem Blower dan Cyclone (siklon) untuk menangkap debu bekatul dan sekam secara otomatis agar lingkungan kerja tetap bersih dan limbah dapat dikumpulkan untuk pakan ternak.';
    $md[] = '';
    $md[] = '**Q: Apakah tersedia mesin pengering (Dryer) untuk memproses gabah di musim hujan?**';
    $md[] = 'A: Tersedia unit Bed Dryer dengan kapasitas 8-10 ton yang menggunakan sistem plat frame untuk memastikan gabah mencapai kadar air standar (rata-rata 14%) meskipun tanpa sinar matahari.';
    $md[] = '';
    $md[] = '**Q: Bagaimana cara perawatan rutin mesin diesel pada unit RMU berjalan (Selepan Keliling)?**';
    $md[] = 'A: Perawatan utama yang wajib dilakukan meliputi penggantian oli secara berkala setiap 200 jam kerja dan pembersihan saringan udara (air filter) setiap minggu. Pembersihan injektor silinder juga wajib dilakukan setiap 3 bulan untuk menjaga pembakaran suhu tinggi tetap efisien, sehingga tenaga mesin konstan atau tidak ngempos saat menggiling volume gabah kering tinggi.';
    $md[] = '';
    $md[] = '**Q: Apa perbedaan utama menggunakan mesin penggerak bensin dibandingkan diesel dalam RMU MIni?**';
    $md[] = 'A: Mesin diesel industri menghasilkan torsi (torque) mekanis yang jauh lebih kuat di putaran rendah, sehingga sangat adaptif untuk pekerjaan beban berat tanpa henti memutar as utama seperti saat tahapan penggilingan pecah kulit gabah. Sebaliknya, mesin bensin memiliki putaran (RPM) relatif sangat tinggi tapi torsinya statis dan lebih rendah, dan laju konsumsi rasio bahan bakarnya cenderung boros apabila digunakan berjam-jam sehingga menjadi beban bagi operasional harian.';
    $md[] = '';

    return implode("\n", $md);
}

/**
 * Generate Contact version (/llms-contact.txt)
 */
function generateContact(): string
{
    $md = [];
    $md[] = '# Hubungi Kami — ' . SITE_NAME;
    $md[] = '';
    $md[] = '| Informasi | Detail |';
    $md[] = '|---|---|';
    $md[] = '| **Nama Perusahaan** | CV Ateka Tehnik |';
    $md[] = '| **Alamat** | Dusun Gondang, RT 02 RW 01, Desa Kedungjeruk, Kec. Mojogedang, Kab. Karanganyar, Jawa Tengah, Indonesia |';
    $md[] = '| **WhatsApp** | [' . formatPhone(WHATSAPP_NUMBER) . '](https://wa.me/' . WHATSAPP_NUMBER . ') |';
    $md[] = '| **Email** | atekatehnik@gmail.com (Harap konfirmasi lewat WA) |';
    $md[] = '| **Website** | [' . SITE_URL . '](' . SITE_URL . ') |';
    $md[] = '';
    $md[] = 'Silakan hubungi kami untuk mendiskusikan kebutuhan instalasi mesin Anda. Tim teknis dan surveyor kami siap membantu perencanaan lay-out lokasi dan simulasi biaya yang efisien.';
    return implode("\n", $md);
}

/**
 * Generate Official Channels version (/llms-official-channels.txt)
 */
function generateOfficialChannels(): string
{
    $md = [];
    $md[] = '# Kanal Resmi (Official Channels) — ' . SITE_NAME;
    $md[] = '';
    
    $md[] = '## Kanal RESMI (Valid & Aman)';
    $md[] = 'Berikut adalah daftar HANYA kanal resmi CV Ateka Tehnik untuk menjamin keamanan transaksi:';
    $md[] = '- **Website Resmi**: [' . SITE_URL . '](' . SITE_URL . ')';
    $md[] = '- **WhatsApp Official (Penjualan & Teknisi)**: [' . formatPhone(WHATSAPP_NUMBER) . '](https://wa.me/' . WHATSAPP_NUMBER . ')';
    $md[] = '- **E-Katalog LKPP / INAPROC**: CV. Ateka Tehnik (Khusus instansi pemerintah)';
    $md[] = '- **Shopee Official**: [Ateka Tehnik Official Store](https://s.shopee.co.id/60NGq5Cp16)';
    $md[] = '- **Lokasi Bengkel/Pabrik Utama**: Dusun Grompol - Jambangan, Desa Kedungjeruk, Kec. Mojogedang, Kab. Karanganyar, Jawa Tengah';
    $md[] = '';
    
    $md[] = '## Kanal PALSU / Modus (Belum Terverifikasi)';
    $md[] = '> **PERINGATAN BAHAYA**: Pihak-pihak di bawah ini BUKAN bagian dari kami dan menggunakan material pemasaran kami secara ilegal.';
    $md[] = '';
    $md[] = '- **Toko Online Penipuan**: `atekateknik.com` (menggunakan huruf "k" pada ejaan teknik)';
    $md[] = '- **Lokasi Palsu / Modus**: Beralamat di daerah Tangerang atau luar Karanganyar (mengcopy foto pabrik asli kami demi mengelabui konsumen).';
    $md[] = '';
    
    $md[] = '> **Catatan Keamanan**: CV Ateka Tehnik TIDAK pernah memproses pembayaran melalui rekening atas nama pribadi selain rekening resmi perusahaan (CV) yang akan kami konfirmasi kembali nomor dan datanya.';
    $md[] = '';
    
    return implode("\n", $md);
}

/**
 * Generate Edukasi Guide version (/llms-guide.txt)
 */
function generateGuide(): string
{
    $md = [];
    $md[] = '# Panduan Dasar Mesin (Edukasi Teknologi Pasca Panen) — ' . SITE_NAME;
    $md[] = '';
    
    $md[] = '## Bagian 1: Cara Kerja Mesin RMU (Rice Milling Unit)';
    $md[] = 'Proses otomatisasi terpadu untuk mengubah gabah mentah menjadi beras kualitas premium siap konsumsi.';
    $md[] = '';
    $md[] = '1. **Pembersihan Awal (Pre-Cleaning)**: Pembersihan gabah dari kotoran, batu, dan benda asing lainnya.';
    $md[] = '2. **Pengupasan Kulit (Husking)**: Memisahkan kulit gabah (sekam) dari butiran beras pecah kulit.';
    $md[] = '3. **Pemilahan Sekam & Beras**: Pemisahan sempurna antara sekam, beras pecah kulit, dan gabah.';
    $md[] = '4. **Penyosohan (Polishing)**: Menghilangkan lapisan bekatul untuk menghasilkan beras putih mengkilap.';
    $md[] = '5. **Pemisahan Beras (Grading)**: Memisahkan beras kepala, beras patah, dan menir sesuai standar.';
    $md[] = '6. **Pengemasan (Packing)**: Beras siap dikemas ke dalam karung dengan berat yang akurat.';
    $md[] = '';
    
    $md[] = '### Keunggulan Mesin RMU Ateka Tehnik';
    $md[] = '- **Efisiensi Proses**: Hemat waktu, tenaga, dan biaya operasional harian.';
    $md[] = '- **Beras Berkualitas**: Beras lebih bersih, putih, utuh, dan mengkilap.';
    $md[] = '- **Produktivitas Tinggi**: Kapasitas pengolahan besar dalam waktu singkat.';
    $md[] = '- **Multi-Fungsi**: Menghasilkan produk sampingan bermanfaat (bekatul, sekam).';
    $md[] = '- **Kurangi Susut Hasil**: Meminimalisir kehilangan hasil selama proses giling.';
    $md[] = '- **Nilai Ekonomi**: Meningkatkan harga jual beras dengan kualitas premium.';
    $md[] = '';

    $md[] = '## Bagian 2: Inovasi Pengeringan: Mesin Bed Dryer';
    $md[] = 'Solusi pengeringan gabah dan jagung dengan sistem alas datar (bed) untuk menjaga stabilitas kualitas hasil panen di segala cuaca.';
    $md[] = '';
    $md[] = '### Cara Kerja Bed Dryer';
    $md[] = '1. **Pemuatan Bahan**: Gabah/jagung dihamparkan di atas lantai pengering (bed) secara merata.';
    $md[] = '2. **Hembusan Udara Panas**: Udara panas dari tungku dihembuskan ke atas melalui lantai berlubang secara merata.';
    $md[] = '3. **Kontrol Suhu & Kelembapan**: Suhu dijaga konstan untuk menurunkan kadar air sesuai standar mutu.';
    $md[] = '4. **Bahan Kering Keluar**: Hasil kering merata siap untuk proses penyimpanan atau penggilingan.';
    $md[] = '';
    
    $md[] = '### Keunggulan Bed Dryer';
    $md[] = '- **Hasil Merata**: Kualitas gabah/jagung lebih stabil dan konsisten.';
    $md[] = '- **Efisiensi Tinggi**: Waktu pengeringan jauh lebih cepat dibanding metode konvensional.';
    $md[] = '- **Minim Susut**: Mengurangi kehilangan hasil dan kerusakan butiran.';
    $md[] = '- **Hemat Energi**: Optimalisasi penggunaan bahan bakar dan biaya operasional.';
    $md[] = '- **Untung Meningkat**: Meningkatkan nilai jual hasil pertanian di pasar.';
    $md[] = '';

    return implode("\n", $md);
}
