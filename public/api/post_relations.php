<?php
/**
 * Post-Product Relations API — Ateka Tehnik
 *
 * GET    /api/post_relations.php?post_slug=X     — Get related products for a post
 * POST   /api/post_relations.php                 — Set relations (replaces all)
 *         Body: { "post_slug": "...", "product_slugs": ["slug1", "slug2"] }
 * DELETE /api/post_relations.php?post_slug=X&product_slug=Y  — Remove single relation
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {

    case 'GET':
        $postSlug = trim($_GET['post_slug'] ?? '');
        $productSlug = trim($_GET['product_slug'] ?? '');

        // Inverse lookup: given a product_slug, find all related posts
        if (!empty($productSlug)) {
            $lang = trim($_GET['lang'] ?? '');
            $langCondition = '';
            $params = [':slug' => $productSlug];
            if (!empty($lang)) {
                $langCondition = ' AND ps.language = :lang';
                $params[':lang'] = $lang;
            }
            $stmt = $db->prepare("
                SELECT ps.slug, ps.title, ps.subtitle, ps.cover_image, ps.category, ps.publish_date, ps.created_at
                FROM post_product_relations ppr
                LEFT JOIN posts ps ON ps.slug = ppr.post_slug
                WHERE ppr.product_slug = :slug AND ps.slug IS NOT NULL{$langCondition}
                ORDER BY ps.publish_date DESC
            ");
            $stmt->execute($params);
            $posts = $stmt->fetchAll();

            jsonSuccess(['posts' => $posts]);
            break;
        }

        if (empty($postSlug)) jsonError(400, 'post_slug or product_slug is required.');

        $stmt = $db->prepare("
            SELECT ppr.product_slug, p.nama as product_name
            FROM post_product_relations ppr
            LEFT JOIN products p ON p.slug = ppr.product_slug
            WHERE ppr.post_slug = :slug
            ORDER BY ppr.created_at
        ");
        $stmt->execute([':slug' => $postSlug]);
        $relations = $stmt->fetchAll();

        jsonSuccess(['relations' => $relations]);
        break;

    case 'POST':
        $user = requireAuth();
        $input = getJsonInput();

        $postSlug = trim($input['post_slug'] ?? '');
        $productSlugs = $input['product_slugs'] ?? [];

        if (empty($postSlug)) jsonError(400, 'post_slug is required.');

        $db->beginTransaction();
        try {
            // Remove all existing relations for this post
            $db->prepare("DELETE FROM post_product_relations WHERE post_slug = :slug")
                ->execute([':slug' => $postSlug]);

            // Insert new relations
            if (!empty($productSlugs)) {
                $ins = $db->prepare("INSERT INTO post_product_relations (post_slug, product_slug) VALUES (:ps, :prs)");
                foreach ($productSlugs as $pSlug) {
                    $pSlug = trim($pSlug);
                    if (!empty($pSlug)) {
                        $ins->execute([':ps' => $postSlug, ':prs' => $pSlug]);
                    }
                }
            }

            $db->commit();
            logActivity('update_post_relations', 'post', null, "Updated product relations for post: $postSlug", $user['user_id']);
            jsonSuccess([], 'Product relations updated.');
        } catch (\Exception $e) {
            $db->rollBack();
            jsonError(500, 'Failed to update relations: ' . $e->getMessage());
        }
        break;

    case 'DELETE':
        $user = requireAuth();
        $postSlug = trim($_GET['post_slug'] ?? '');
        $productSlug = trim($_GET['product_slug'] ?? '');
        if (empty($postSlug) || empty($productSlug)) jsonError(400, 'post_slug and product_slug are required.');

        $stmt = $db->prepare("DELETE FROM post_product_relations WHERE post_slug = :ps AND product_slug = :prs");
        $stmt->execute([':ps' => $postSlug, ':prs' => $productSlug]);

        jsonSuccess([], 'Relation removed.');
        break;

    default:
        jsonError(405, 'Method not allowed.');
}
