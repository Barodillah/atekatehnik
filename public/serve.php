<?php
/**
 * serve.php
 * Dynamic Open Graph Metadata Injector for Ateka Tehnik
 * 
 * Intercepts SPA routes and injects dynamic SEO data
 * for sharing products and posts to social media.
 */

$requestUri = $_SERVER['REQUEST_URI'];
$html = @file_get_contents('index.html');

// Validate if index.html exists
if ($html === false) {
    http_response_code(404);
    die('Frontend not ready. Please run build or check index.html');
}

// Default meta values
$title = "ATEKA TEHNIK | Supplier Penggilingan Padi Terbaik di Indonesia";
$description = "ATEKA TEHNIK menyediakan solusi modernisasi penggilingan padi dengan teknologi terbaru untuk meningkatkan efisiensi, kualitas beras, dan hasil produksi.";
$image = "https://atekatehnik.com/preview.jpg";

$isPost = preg_match('/^\/post\/([^\/?]+)/', $requestUri, $postMatches);
$isProduct = preg_match('/^\/product\/([^\/?]+)/', $requestUri, $productMatches);

if ($isPost || $isProduct) {
    $slug = $isPost ? $postMatches[1] : $productMatches[1];

    // Direct DB query for fast execution
    $dbFile = __DIR__ . '/api/db.php';
    if (file_exists($dbFile)) {
        require_once $dbFile;
        $db = getDB();

        try {
            if ($isPost) {
                $stmt = $db->prepare("SELECT title, subtitle, cover_image FROM posts WHERE slug = :slug");
                $stmt->execute([':slug' => $slug]);
                $item = $stmt->fetch();

                if ($item) {
                    $title = $item['title'] . " | ATEKA TEHNIK";
                    $descriptionRaw = $item['subtitle'];
                    $imageRaw = $item['cover_image'];
                }
            } else {
                $stmt = $db->prepare("SELECT nama, description, gambar FROM products WHERE slug = :slug");
                $stmt->execute([':slug' => $slug]);
                $item = $stmt->fetch();

                if ($item) {
                    $title = $item['nama'] . " | ATEKA TEHNIK";
                    $descriptionRaw = $item['description'];
                    $imageRaw = $item['gambar'];
                }
            }

            if (!empty($item)) {
                $description = trim(strip_tags($descriptionRaw));
                if (strlen($description) > 160) {
                    $description = substr($description, 0, 157) . "...";
                }

                if (!empty($imageRaw)) {
                    // If it's a relative path, make it absolute using hostname
                    // Otherwise keep it as is
                    if (strpos($imageRaw, 'http') === 0) {
                        $image = $imageRaw;
                    } else {
                        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'atekatehnik.com';
                        $image = "https://" . $host . (strpos($imageRaw, '/') === 0 ? '' : '/') . $imageRaw;
                    }
                }
            }

        } catch (\Exception $e) {
            // Ignore DB errors and fallback to default tags silently
        }
    }
}

// Ensure proper Host
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'atekatehnik.com';
$url = "https://" . $host . explode('?', $requestUri)[0];

// Inject Title and Description Meta
$html = preg_replace('/<title>.*?<\/title>/is', "<title>" . htmlspecialchars($title) . "</title>", $html);
$html = preg_replace('/<meta[^>]*name="description"[^>]*>/i', '<meta name="description" content="' . htmlspecialchars($description) . '" />', $html);

// Inject Open Graph (Facebook, WhatsApp)
$html = preg_replace('/<meta[^>]*property="og:title"[^>]*>/i', '<meta property="og:title" content="' . htmlspecialchars($title) . '" />', $html);
$html = preg_replace('/<meta[^>]*property="og:description"[^>]*>/i', '<meta property="og:description" content="' . htmlspecialchars($description) . '" />', $html);
$html = preg_replace('/<meta[^>]*property="og:image"[^>]*>/i', '<meta property="og:image" content="' . htmlspecialchars($image) . '" />', $html);
$html = preg_replace('/<meta[^>]*property="og:url"[^>]*>/i', '<meta property="og:url" content="' . htmlspecialchars($url) . '" />', $html);

// Inject Twitter Cards
$html = preg_replace('/<meta[^>]*name="twitter:title"[^>]*>/i', '<meta name="twitter:title" content="' . htmlspecialchars($title) . '" />', $html);
$html = preg_replace('/<meta[^>]*name="twitter:description"[^>]*>/i', '<meta name="twitter:description" content="' . htmlspecialchars($description) . '" />', $html);
$html = preg_replace('/<meta[^>]*name="twitter:image"[^>]*>/i', '<meta name="twitter:image" content="' . htmlspecialchars($image) . '" />', $html);

echo $html;
