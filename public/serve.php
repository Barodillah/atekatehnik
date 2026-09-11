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

$title = "ATEKA TEHNIK | Supplier Penggilingan Padi Terbaik di Indonesia";
$description = "ATEKA TEHNIK menyediakan solusi modernisasi penggilingan padi dengan teknologi terbaru untuk meningkatkan efisiensi, kualitas beras, dan hasil produksi.";
$image = "https://atekatehnik.com/preview.jpg";

$baseUri = parse_url($requestUri, PHP_URL_PATH);
$baseUri = rtrim($baseUri, '/');
if (empty($baseUri)) $baseUri = '/';

$pageSchemaType = 'WebPage'; // Default fallback

switch ($baseUri) {
    case '/':
        $title = "ATEKA TEHNIK | Supplier Penggilingan Padi Terbaik di Indonesia";
        $pageSchemaType = 'WebSite';
        break;
    case '/products':
        $title = "Produk | ATEKA TEHNIK";
        $pageSchemaType = 'CollectionPage';
        break;
    case '/about':
        $title = "Tentang Kami | ATEKA TEHNIK";
        $pageSchemaType = 'AboutPage';
        break;
    case '/contact':
        $title = "Hubungi Kami | ATEKA TEHNIK";
        $pageSchemaType = 'ContactPage';
        break;
    case '/portfolio':
        $title = "Portofolio | ATEKA TEHNIK";
        $pageSchemaType = 'CollectionPage';
        break;
    case '/gallery':
        $title = "Galeri | ATEKA TEHNIK";
        $pageSchemaType = 'ImageGallery';
        break;
    case '/news':
        $title = "Berita Terbaru | ATEKA TEHNIK";
        $pageSchemaType = 'CollectionPage';
        break;
    case '/edukasi':
        $title = "Edukasi Pasca Panen | ATEKA TEHNIK";
        $pageSchemaType = 'CollectionPage';
        break;
    case '/search':
        $title = "Hasil Pencarian | ATEKA TEHNIK";
        $pageSchemaType = 'SearchResultsPage';
        break;
    case '/official-channels':
        $title = "Official Channels | ATEKA TEHNIK";
        $pageSchemaType = 'WebPage';
        break;
    case '/privacy-policy':
        $title = "Kebijakan Privasi | ATEKA TEHNIK";
        $pageSchemaType = 'WebPage';
        break;
    case '/terms-of-service':
        $title = "Syarat Ketentuan | ATEKA TEHNIK";
        $pageSchemaType = 'WebPage';
        break;
    case '/faq':
        $title = "FAQ & Bantuan | ATEKA TEHNIK";
        $pageSchemaType = 'FAQPage';
        break;
}

$isPost = preg_match('/^\/(?:post|portfolio|news)\/([^\/?]+)/', $requestUri, $postMatches);
$isProduct = preg_match('/^\/product\/([^\/?]+)/', $requestUri, $productMatches);

$jsonLdGraph = [
    [
        '@type' => 'Organization',
        '@id' => 'https://atekatehnik.com/#organization',
        'name' => 'CV Ateka Tehnik',
        'url' => 'https://atekatehnik.com',
        'logo' => [
            '@type' => 'ImageObject',
            '@id' => 'https://atekatehnik.com/#logo',
            'url' => 'https://atekatehnik.com/favicon.png',
            'caption' => 'CV Ateka Tehnik'
        ],
        'description' => 'Spesialis Supplier Penggilingan Padi Terbaik di Indonesia.',
        'sameAs' => [
            'https://www.instagram.com/toko.ateka.tehnik',
            'https://www.tiktok.com/@toko.ateka.tehnik'
        ]
    ]
]; // Base JSON-LD structured data graph

if ($isPost || $isProduct) {
    $slug = $isPost ? $postMatches[1] : $productMatches[1];

    // Direct DB query for fast execution
    $dbFile = __DIR__ . '/api/db.php';
    if (file_exists($dbFile)) {
        require_once $dbFile;
        $db = getDB();

        try {
            if ($isPost) {
                $stmt = $db->prepare("SELECT title, subtitle, cover_image, category, publish_date FROM posts WHERE slug = :slug");
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
                    $title = "Jual " . $item['nama'] . " | ATEKA TEHNIK";
                    $descriptionRaw = $item['description'];
                    $imageRaw = $item['gambar'];
                }
            }

            if (!empty($item)) {
                $description = trim(strip_tags($descriptionRaw));
                if (strlen($description) > 160) {
                    $description = substr($description, 0, 157) . "...";
                }

                // Process image(s)
                $imageUrls = [];
                if (!empty($imageRaw)) {
                    $imageParts = explode(',', $imageRaw);
                    foreach ($imageParts as $imgPart) {
                        $imgTrimmed = trim($imgPart);
                        if (empty($imgTrimmed)) continue;
                        if (strpos($imgTrimmed, 'http') === 0) {
                            $imageUrls[] = $imgTrimmed;
                        } else {
                            $hostForImg = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'atekatehnik.com';
                            $imageUrls[] = "https://" . $hostForImg . (strpos($imgTrimmed, '/') === 0 ? '' : '/') . $imgTrimmed;
                        }
                    }
                    // Use first image for OG tags
                    $image = $imageUrls[0] ?? $image;
                }

                // Build JSON-LD Structured Data
                if ($isPost && !empty($item)) {
                    $schemaType = ($item['category'] === 'Industrial Installations') ? 'Article' : 'NewsArticle';
                    $publishDate = !empty($item['publish_date']) ? date('c', strtotime($item['publish_date'])) : date('c');

                    $postLd = [
                        '@type' => $schemaType,
                        '@id' => 'https://atekatehnik.com' . $requestUri . '#article',
                        'headline' => $item['title'],
                        'image' => !empty($imageUrls) ? $imageUrls : ['https://atekatehnik.com/preview.jpg'],
                        'datePublished' => $publishDate,
                        'dateModified' => $publishDate,
                        'author' => [
                            '@id' => 'https://atekatehnik.com/#organization'
                        ],
                        'publisher' => [
                            '@id' => 'https://atekatehnik.com/#organization'
                        ],
                        'description' => $description
                    ];
                    $jsonLdGraph[] = $postLd;
                } elseif ($isProduct && !empty($item)) {
                    $productDesc = trim(strip_tags($item['description'] ?? ''));
                    if (strlen($productDesc) > 300) {
                        $productDesc = substr($productDesc, 0, 297) . "...";
                    }

                    $productLd = [
                        '@type' => 'Product',
                        '@id' => 'https://atekatehnik.com' . $requestUri . '#product',
                        'name' => $item['nama'],
                        'image' => !empty($imageUrls) ? $imageUrls : ['https://atekatehnik.com/preview.jpg'],
                        'description' => !empty($productDesc) ? $productDesc : 'Mesin penggilingan padi berkualitas tinggi dari CV Ateka Tehnik.',
                        'brand' => [
                            '@type' => 'Brand',
                            'name' => 'CV Ateka Tehnik'
                        ],
                        'aggregateRating' => [
                            '@type' => 'AggregateRating',
                            'ratingValue' => '5',
                            'reviewCount' => '1'
                        ],
                        'review' => [
                            [
                                '@type' => 'Review',
                                'reviewRating' => [
                                    '@type' => 'Rating',
                                    'ratingValue' => '5',
                                    'bestRating' => '5'
                                ],
                                'author' => [
                                    '@type' => 'Person',
                                    'name' => 'Pelanggan Ateka Tehnik'
                                ]
                            ]
                        ],
                        'offers' => [
                            '@type' => 'Offer',
                            'priceCurrency' => 'IDR',
                            'price' => '0',
                            'availability' => 'https://schema.org/InStock',
                            'description' => 'Harga Bersaing — Hubungi kami untuk penawaran terbaik',
                            'hasMerchantReturnPolicy' => [
                                '@type' => 'MerchantReturnPolicy',
                                'applicableCountry' => 'ID',
                                'returnPolicyCategory' => 'https://schema.org/MerchantReturnNotPermitted'
                            ],
                            'shippingDetails' => [
                                '@type' => 'OfferShippingDetails',
                                'shippingRate' => [
                                    '@type' => 'MonetaryAmount',
                                    'value' => 0,
                                    'currency' => 'IDR'
                                ],
                                'shippingDestination' => [
                                    '@type' => 'DefinedRegion',
                                    'addressCountry' => 'ID'
                                ],
                                'deliveryTime' => [
                                    '@type' => 'ShippingDeliveryTime',
                                    'handlingTime' => [
                                        '@type' => 'QuantitativeValue',
                                        'minValue' => 0,
                                        'maxValue' => 7,
                                        'unitCode' => 'd'
                                    ],
                                    'transitTime' => [
                                        '@type' => 'QuantitativeValue',
                                        'minValue' => 1,
                                        'maxValue' => 14,
                                        'unitCode' => 'd'
                                    ]
                                ]
                            ]
                        ]
                    ];
                    $jsonLdGraph[] = $productLd;
                }
            }

        } catch (\Exception $e) {
            // Ignore DB errors and fallback to default tags silently
        }
    }
} else {
    // Inject schema for static pages
    $jsonLdGraph[] = [
        '@type' => $pageSchemaType,
        '@id' => 'https://atekatehnik.com' . $requestUri . '#webpage',
        'url' => 'https://atekatehnik.com' . $requestUri,
        'name' => $title,
        'description' => $description,
        'publisher' => [
            '@id' => 'https://atekatehnik.com/#organization'
        ]
    ];
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

// Inject JSON-LD Structured Data (Schema Markup)
$jsonLd = [
    '@context' => 'https://schema.org',
    '@graph' => $jsonLdGraph
];
$jsonLdScript = '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . '</script>';
$html = str_replace('</head>', $jsonLdScript . "\n</head>", $html);

echo $html;

