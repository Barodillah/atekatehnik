<?php
/**
 * Products API — Ateka Tehnik Admin Backend
 * 
 * Endpoints:
 *   GET    /api/products.php              — List all products (with specs)
 *   GET    /api/products.php?id=X         — Get single product
 *   POST   /api/products.php              — Create new product
 *   PUT    /api/products.php?id=X         — Update product
 *   DELETE /api/products.php?id=X         — Delete product
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$slugParam = $_GET['slug'] ?? null;
$db     = getDB();

function generateSlug(PDO $db, string $title, ?int $excludeId = null): string {
    $slug = mb_strtolower($title, 'UTF-8');
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    $slug = trim($slug, '-');
    if (empty($slug)) $slug = 'product';

    $baseSlug = $slug;
    $counter = 1;
    while (true) {
        $sql = "SELECT id FROM products WHERE slug = :slug";
        $params = [':slug' => $slug];
        if ($excludeId) {
            $sql .= " AND id != :eid";
            $params[':eid'] = $excludeId;
        }
        $check = $db->prepare($sql);
        $check->execute($params);
        if (!$check->fetch()) break;
        $counter++;
        $slug = $baseSlug . '-' . $counter;
    }
    return $slug;
}

switch ($method) {

    // ── GET: List or Single ──────────────────────────────────────────
    case 'GET':
        if ($id || $slugParam) {
            // Single product with specs
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM products WHERE id = :id");
                $stmt->execute([':id' => $id]);
            } else {
                $stmt = $db->prepare("SELECT * FROM products WHERE slug = :slug");
                $stmt->execute([':slug' => $slugParam]);
            }
            $product = $stmt->fetch();

            if (!$product) {
                jsonError(404, 'Product not found.');
            }

            $actualId = $product['id'];
            $specs = $db->prepare("SELECT id, spesifikasi FROM product_specs WHERE product_id = :pid ORDER BY id");
            $specs->execute([':pid' => $actualId]);
            $product['spesifikasi'] = $specs->fetchAll(PDO::FETCH_COLUMN, 1);

            jsonSuccess(['product' => $product]);
        } else {
            // List all with optional search, kategori filter & pagination
            $search   = trim($_GET['search'] ?? '');
            $kategori = trim($_GET['kategori'] ?? '');
            $page     = max(1, (int)($_GET['page'] ?? 1));
            $limit    = min(50, max(1, (int)($_GET['limit'] ?? 12)));
            $offset   = ($page - 1) * $limit;

            $conditions = [];
            $params = [];
            if ($search) {
                $conditions[] = "(p.nama LIKE :search OR p.kategori LIKE :search2)";
                $params[':search']  = "%$search%";
                $params[':search2'] = "%$search%";
            }
            if ($kategori) {
                $conditions[] = "p.kategori = :kategori";
                $params[':kategori'] = $kategori;
            }
            $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

            // Total count
            $countSql = "SELECT COUNT(*) FROM products p $where";
            $countStmt = $db->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            // Fetch products
            $sql = "SELECT p.* FROM products p $where ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset";
            $stmt = $db->prepare($sql);
            foreach ($params as $k => $v) {
                $stmt->bindValue($k, $v);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll();

            // Attach specs to each product
            foreach ($products as &$p) {
                $specStmt = $db->prepare("SELECT spesifikasi FROM product_specs WHERE product_id = :pid ORDER BY id");
                $specStmt->execute([':pid' => $p['id']]);
                $p['spesifikasi'] = $specStmt->fetchAll(PDO::FETCH_COLUMN, 0);
            }
            unset($p);

            jsonSuccess([
                'products'   => $products,
                'total'      => $total,
                'page'       => $page,
                'limit'      => $limit,
                'totalPages' => ceil($total / $limit),
            ]);
        }
        break;

    // ── POST: Create ─────────────────────────────────────────────────
    case 'POST':
        $user  = requireAuth();
        $input = getJsonInput();

        $nama       = trim($input['nama'] ?? '');
        $description = trim($input['description'] ?? '');
        $gambar     = trim($input['gambar'] ?? '');
        $kategori   = trim($input['kategori'] ?? '');
        $shopeeLink = trim($input['shopeeLink'] ?? '');
        $spesifikasi = $input['spesifikasi'] ?? [];

        if (empty($nama) || empty($kategori)) {
            jsonError(400, 'nama and kategori are required.');
        }

        $db->beginTransaction();
        try {
            $slug = generateSlug($db, $nama);
            $stmt = $db->prepare("
                INSERT INTO products (nama, slug, description, gambar, kategori, shopee_link)
                VALUES (:nama, :slug, :description, :gambar, :kategori, :shopee)
            ");
            $stmt->execute([
                ':nama'        => $nama,
                ':slug'        => $slug,
                ':description' => $description,
                ':gambar'      => $gambar,
                ':kategori'    => $kategori,
                ':shopee'      => $shopeeLink,
            ]);
            $productId = (int)$db->lastInsertId();

            // Insert specs
            if (!empty($spesifikasi)) {
                $specStmt = $db->prepare("INSERT INTO product_specs (product_id, spesifikasi) VALUES (:pid, :spec)");
                foreach ($spesifikasi as $spec) {
                    $spec = trim($spec);
                    if ($spec !== '') {
                        $specStmt->execute([':pid' => $productId, ':spec' => $spec]);
                    }
                }
            }

            $db->commit();

            logActivity('create_product', 'product', $productId, "Created product: $nama", $user['user_id']);

            jsonSuccess(['product_id' => $productId], 'Product created successfully.');
        } catch (\Exception $e) {
            $db->rollBack();
            jsonError(500, 'Failed to create product: ' . $e->getMessage());
        }
        break;

    // ── PUT: Update ──────────────────────────────────────────────────
    case 'PUT':
        $user = requireAuth();
        if (!$id) jsonError(400, 'Product ID required for update.');

        $input = getJsonInput();

        // Check exists
        $exists = $db->prepare("SELECT id FROM products WHERE id = :id");
        $exists->execute([':id' => $id]);
        if (!$exists->fetch()) jsonError(404, 'Product not found.');

        $nama       = trim($input['nama'] ?? '');
        $description = trim($input['description'] ?? '');
        $gambar     = trim($input['gambar'] ?? '');
        $kategori   = trim($input['kategori'] ?? '');
        $shopeeLink = trim($input['shopeeLink'] ?? '');
        $spesifikasi = $input['spesifikasi'] ?? [];

        if (empty($nama) || empty($kategori)) {
            jsonError(400, 'nama and kategori are required.');
        }

        $db->beginTransaction();
        try {
            $slug = generateSlug($db, $nama, $id);
            $stmt = $db->prepare("
                UPDATE products SET nama = :nama, slug = :slug, description = :description, gambar = :gambar, kategori = :kategori, shopee_link = :shopee
                WHERE id = :id
            ");
            $stmt->execute([
                ':nama'        => $nama,
                ':slug'        => $slug,
                ':description' => $description,
                ':gambar'      => $gambar,
                ':kategori'    => $kategori,
                ':shopee'      => $shopeeLink,
                ':id'          => $id,
            ]);

            // Replace specs: delete old, insert new
            $db->prepare("DELETE FROM product_specs WHERE product_id = :pid")->execute([':pid' => $id]);
            if (!empty($spesifikasi)) {
                $specStmt = $db->prepare("INSERT INTO product_specs (product_id, spesifikasi) VALUES (:pid, :spec)");
                foreach ($spesifikasi as $spec) {
                    $spec = trim($spec);
                    if ($spec !== '') {
                        $specStmt->execute([':pid' => $id, ':spec' => $spec]);
                    }
                }
            }

            $db->commit();

            logActivity('update_product', 'product', $id, "Updated product: $nama", $user['user_id']);

            jsonSuccess([], 'Product updated successfully.');
        } catch (\Exception $e) {
            $db->rollBack();
            jsonError(500, 'Failed to update product: ' . $e->getMessage());
        }
        break;

    // ── DELETE ────────────────────────────────────────────────────────
    case 'DELETE':
        $user = requireAuth();
        if (!$id) jsonError(400, 'Product ID required for deletion.');

        $exists = $db->prepare("SELECT nama FROM products WHERE id = :id");
        $exists->execute([':id' => $id]);
        $product = $exists->fetch();
        if (!$product) jsonError(404, 'Product not found.');

        // CASCADE will handle product_specs
        $db->prepare("DELETE FROM products WHERE id = :id")->execute([':id' => $id]);

        logActivity('delete_product', 'product', $id, "Deleted product: " . $product['nama'], $user['user_id']);

        jsonSuccess([], 'Product deleted successfully.');
        break;

    default:
        jsonError(405, 'Method not allowed.');
}
