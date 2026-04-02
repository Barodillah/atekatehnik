<?php
/**
 * Posts API — Ateka Tehnik Admin Backend
 * 
 * Endpoints:
 *   GET    /api/posts.php                        — List all posts
 *   GET    /api/posts.php?id=X                   — Get single post with all relations
 *   POST   /api/posts.php                        — Create new post
 *   PUT    /api/posts.php?id=X                   — Update post
 *   DELETE /api/posts.php?id=X                   — Delete post
 *   GET    /api/posts.php?action=translate&id=X   — SSE: AI translate to English
 */

require_once __DIR__ . '/helpers.php';

/**
 * Generate a URL-friendly slug from a title.
 * Ensures uniqueness by appending -2, -3, etc. if needed.
 */
function generateSlug(PDO $db, string $title, ?int $excludeId = null): string
{
    // Transliterate & slugify
    $slug = mb_strtolower($title, 'UTF-8');
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    $slug = trim($slug, '-');
    if (empty($slug))
        $slug = 'post';

    // Ensure uniqueness
    $baseSlug = $slug;
    $counter = 1;
    while (true) {
        $sql = "SELECT id FROM posts WHERE slug = :slug";
        $params = [':slug' => $slug];
        if ($excludeId) {
            $sql .= " AND id != :eid";
            $params[':eid'] = $excludeId;
        }
        $check = $db->prepare($sql);
        $check->execute($params);
        if (!$check->fetch())
            break;
        $counter++;
        $slug = $baseSlug . '-' . $counter;
    }
    return $slug;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$action = $_GET['action'] ?? '';
$db = getDB();

// ── Translate Preview Endpoint ─────────────────────────────────────────
if ($action === 'translate_preview' && $method === 'POST') {
    $user = requireAuth();
    $input = getJsonInput();

    // The $input is the exact draft JSON from the frontend, containing title, content, phases, deliverables, spec, impact, etc.
    $prompt = "Translate the following Indonesian rice milling industry article content to professional English. Keep technical terms accurate. Return ONLY a valid JSON object with the exact same keys and structure.\n\n";
    $prompt .= json_encode($input, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    $OPENROUTER_API_KEY = 'sk';
    $payload = json_encode([
        'model' => 'google/gemini-2.5-flash-lite',
        'messages' => [
            ['role' => 'system', 'content' => 'You are a professional translator for industrial engineering content. Always return valid JSON only, no markdown or code blocks.'],
            ['role' => 'user', 'content' => $prompt],
        ],
        'max_tokens' => 4096,
        'temperature' => 0.3,
    ]);

    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $OPENROUTER_API_KEY,
            'Content-Type: application/json',
            'HTTP-Referer: https://atekatehnik.com',
            'X-Title: Ateka Tehnik Post Translator',
        ],
        CURLOPT_TIMEOUT => 60,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError || $httpCode !== 200) {
        jsonError(500, 'AI service error: ' . ($curlError ?: "HTTP $httpCode"));
    }

    $aiResponse = json_decode($response, true);
    $aiContent = $aiResponse['choices'][0]['message']['content'] ?? '';

    // Clean markdown code blocks if present
    $aiContent = preg_replace('/^```(?:json)?\s*/m', '', $aiContent);
    $aiContent = preg_replace('/\s*```$/m', '', $aiContent);
    $aiContent = trim($aiContent);

    $translated = json_decode($aiContent, true);
    if (!$translated) {
        jsonError(500, 'Failed to parse AI translation result. Raw: ' . substr($aiContent, 0, 200));
    }

    jsonSuccess(['translated' => $translated], 'Translation preview generated successfully');
}

// ── Standard REST Endpoints ──────────────────────────────────────────
setCorsHeaders();

switch ($method) {

    // ── GET: List or Single ──────────────────────────────────────────
    case 'GET':
        $postSlug = $_GET['slug'] ?? null;
        if ($id || $postSlug) {
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
                $stmt->execute([':id' => $id]);
            } else {
                $stmt = $db->prepare("SELECT * FROM posts WHERE slug = :slug");
                $stmt->execute([':slug' => $postSlug]);
            }
            $post = $stmt->fetch();
            if (!$post)
                jsonError(404, 'Post not found.');

            $id = $post['id']; // Ensure we have the actual ID for relations

            // Deliverables
            $d = $db->prepare("SELECT item FROM post_deliverables WHERE post_id = :pid ORDER BY id");
            $d->execute([':pid' => $id]);
            $post['deliverables'] = $d->fetchAll(PDO::FETCH_COLUMN, 0);

            // Tech specs
            $s = $db->prepare("SELECT header, spec_value, unit, description FROM post_tech_specs WHERE post_id = :pid ORDER BY id");
            $s->execute([':pid' => $id]);
            $post['techSpecs'] = $s->fetchAll();

            // Phases
            $p = $db->prepare("SELECT title, image_url, phase_order FROM post_phases WHERE post_id = :pid ORDER BY phase_order");
            $p->execute([':pid' => $id]);
            $post['phases'] = $p->fetchAll();

            // Impact
            $i = $db->prepare("SELECT * FROM post_impacts WHERE post_id = :pid");
            $i->execute([':pid' => $id]);
            $impact = $i->fetch();
            if ($impact) {
                $is = $db->prepare("SELECT stat_value, stat_label FROM post_impact_stats WHERE impact_id = :iid ORDER BY id");
                $is->execute([':iid' => $impact['id']]);
                $impact['stats'] = $is->fetchAll();
            }
            $post['impact'] = $impact ?: null;

            // Related Products
            $rp = $db->prepare("SELECT r.product_slug, p.nama FROM post_product_relations r LEFT JOIN products p ON r.product_slug = p.slug WHERE r.post_slug = :slug");
            $rp->execute([':slug' => $post['slug']]);
            $relatedProductsData = $rp->fetchAll();
            $post['related_product_slug'] = !empty($relatedProductsData) ? $relatedProductsData[0]['product_slug'] : null;
            $post['related_products'] = $relatedProductsData; // array of {product_slug, nama}

            jsonSuccess(['post' => $post]);
        } else {
            $search = trim($_GET['search'] ?? '');
            $language = $_GET['lang'] ?? '';
            $category = $_GET['category'] ?? '';
            $page = max(1, (int) ($_GET['page'] ?? 1));
            $limit = min(50, max(1, (int) ($_GET['limit'] ?? 10)));
            $offset = ($page - 1) * $limit;

            $conditions = [];
            $params = [];

            if ($search) {
                $conditions[] = "(title LIKE :search OR subtitle LIKE :search2 OR content LIKE :search3)";
                $params[':search'] = "%$search%";
                $params[':search2'] = "%$search%";
                $params[':search3'] = "%$search%";
            }
            if ($language) {
                $conditions[] = "language = :lang";
                $params[':lang'] = $language;
            }
            if ($category) {
                $conditions[] = "category = :cat";
                $params[':cat'] = $category;
            }

            $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

            $countStmt = $db->prepare("SELECT COUNT(*) FROM posts $where");
            $countStmt->execute($params);
            $total = (int) $countStmt->fetchColumn();

            $sort = $_GET['sort'] ?? '';
            $orderBy = "created_at DESC";
            if ($sort === 'views_asc') {
                $orderBy = "(SELECT COUNT(*) FROM page_views WHERE page_slug = posts.slug AND page_type = 'post') ASC";
            }
            
            $sql = "SELECT id, title, subtitle, category, publish_date, cover_image, language, location, slug, created_at FROM posts $where ORDER BY $orderBy LIMIT :limit OFFSET :offset";
            $stmt = $db->prepare($sql);
            foreach ($params as $k => $v)
                $stmt->bindValue($k, $v);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $posts = $stmt->fetchAll();

            jsonSuccess([
                'posts' => $posts,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit),
            ]);
        }
        break;

    // ── POST: Create ─────────────────────────────────────────────────
    case 'POST':
        $user = requireAuth();
        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        $subtitle = trim($input['subtitle'] ?? '');
        $category = trim($input['category'] ?? '');
        $publishDate = trim($input['date'] ?? '');
        $coverImage = trim($input['coverImage'] ?? '');
        $content = trim($input['content'] ?? '');
        $location = trim($input['location'] ?? '');

        if (empty($title) || empty($category) || empty($publishDate) || empty($content)) {
            jsonError(400, 'title, category, date, and content are required.');
        }

        $deliverables = $input['deliverables'] ?? [];
        $techSpecs = $input['techSpecs'] ?? [];
        $phases = $input['phases'] ?? [];
        $impactInput = $input['impact'] ?? null;

        $db->beginTransaction();
        try {
            // Generate slug from title
            $slug = generateSlug($db, $title);

            // Insert main post
            $postLanguage = $input['language'] ?? 'id';
            $stmt = $db->prepare("
                INSERT INTO posts (title, subtitle, category, publish_date, cover_image, content, language, location, slug)
                VALUES (:title, :subtitle, :cat, :pdate, :cover, :content, :lang, :loc, :slug)
            ");
            $stmt->execute([
                ':title' => $title,
                ':subtitle' => $subtitle,
                ':cat' => $category,
                ':pdate' => $publishDate,
                ':cover' => $coverImage,
                ':content' => $content,
                ':lang' => $postLanguage,
                ':loc' => $location,
                ':slug' => $slug,
            ]);
            $postId = (int) $db->lastInsertId();

            // Deliverables
            if (!empty($deliverables)) {
                $dStmt = $db->prepare("INSERT INTO post_deliverables (post_id, item) VALUES (:pid, :item)");
                foreach ($deliverables as $d) {
                    $d = trim($d);
                    if ($d !== '')
                        $dStmt->execute([':pid' => $postId, ':item' => $d]);
                }
            }

            // Tech Specs
            if (!empty($techSpecs)) {
                $sStmt = $db->prepare("INSERT INTO post_tech_specs (post_id, header, spec_value, unit, description) VALUES (:pid, :h, :v, :u, :d)");
                foreach ($techSpecs as $s) {
                    $header = trim($s['header'] ?? '');
                    if ($header !== '') {
                        $sStmt->execute([
                            ':pid' => $postId,
                            ':h' => $header,
                            ':v' => trim($s['value'] ?? ''),
                            ':u' => trim($s['unit'] ?? ''),
                            ':d' => trim($s['description'] ?? ''),
                        ]);
                    }
                }
            }

            // Phases
            if (!empty($phases)) {
                $pStmt = $db->prepare("INSERT INTO post_phases (post_id, title, image_url, phase_order) VALUES (:pid, :t, :img, :ord)");
                foreach ($phases as $i => $p) {
                    $pTitle = trim($p['title'] ?? '');
                    if ($pTitle !== '') {
                        $pStmt->execute([
                            ':pid' => $postId,
                            ':t' => $pTitle,
                            ':img' => trim($p['image'] ?? ''),
                            ':ord' => $i + 1,
                        ]);
                    }
                }
            }

            // Impact section
            if ($impactInput && !empty(trim($impactInput['title'] ?? ''))) {
                $iStmt = $db->prepare("
                    INSERT INTO post_impacts (post_id, title, description, image_url)
                    VALUES (:pid, :t, :d, :img)
                ");
                $iStmt->execute([
                    ':pid' => $postId,
                    ':t' => trim($impactInput['title']),
                    ':d' => trim($impactInput['description'] ?? ''),
                    ':img' => trim($impactInput['image'] ?? ''),
                ]);
                $impactId = (int) $db->lastInsertId();

                $impactStatsInput = $impactInput['stats'] ?? [];
                if (!empty($impactStatsInput)) {
                    $isStmt = $db->prepare("INSERT INTO post_impact_stats (impact_id, stat_value, stat_label) VALUES (:iid, :v, :l)");
                    foreach ($impactStatsInput as $st) {
                        $val = trim($st['value'] ?? '');
                        $lbl = trim($st['label'] ?? '');
                        if ($val !== '' || $lbl !== '') {
                            $isStmt->execute([':iid' => $impactId, ':v' => $val, ':l' => $lbl]);
                        }
                    }
                }
            }

            $db->commit();

            logActivity('create_post', 'post', $postId, "Created post: $title", $user['user_id']);

            jsonSuccess([
                'post_id' => $postId,
                'generateEnglish' => (bool) ($input['generateEnglish'] ?? false),
            ], 'Post created successfully.');

        } catch (\Exception $e) {
            $db->rollBack();
            jsonError(500, 'Failed to create post: ' . $e->getMessage());
        }
        break;

    // ── PUT: Update ──────────────────────────────────────────────────
    case 'PUT':
        $user = requireAuth();
        if (!$id)
            jsonError(400, 'Post ID required for update.');

        $exists = $db->prepare("SELECT id FROM posts WHERE id = :id");
        $exists->execute([':id' => $id]);
        if (!$exists->fetch())
            jsonError(404, 'Post not found.');

        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        $subtitle = trim($input['subtitle'] ?? '');
        $category = trim($input['category'] ?? '');
        $publishDate = trim($input['date'] ?? '');
        $coverImage = trim($input['coverImage'] ?? '');
        $content = trim($input['content'] ?? '');
        $location = trim($input['location'] ?? '');

        if (empty($title) || empty($category)) {
            jsonError(400, 'title and category are required.');
        }

        $db->beginTransaction();
        try {
            // Regenerate slug from updated title
            $slug = generateSlug($db, $title, $id);

            $stmt = $db->prepare("
                UPDATE posts SET title = :title, subtitle = :subtitle, category = :cat,
                publish_date = :pdate, cover_image = :cover, content = :content, location = :loc, slug = :slug
                WHERE id = :id
            ");
            $stmt->execute([
                ':title' => $title,
                ':subtitle' => $subtitle,
                ':cat' => $category,
                ':pdate' => $publishDate,
                ':cover' => $coverImage,
                ':content' => $content,
                ':loc' => $location,
                ':slug' => $slug,
                ':id' => $id,
            ]);

            // Replace relations
            $db->prepare("DELETE FROM post_deliverables WHERE post_id = :pid")->execute([':pid' => $id]);
            $db->prepare("DELETE FROM post_tech_specs WHERE post_id = :pid")->execute([':pid' => $id]);
            $db->prepare("DELETE FROM post_phases WHERE post_id = :pid")->execute([':pid' => $id]);

            // Clean impact
            $impCheck = $db->prepare("SELECT id FROM post_impacts WHERE post_id = :pid");
            $impCheck->execute([':pid' => $id]);
            $oldImpact = $impCheck->fetch();
            if ($oldImpact) {
                $db->prepare("DELETE FROM post_impact_stats WHERE impact_id = :iid")->execute([':iid' => $oldImpact['id']]);
                $db->prepare("DELETE FROM post_impacts WHERE id = :iid")->execute([':iid' => $oldImpact['id']]);
            }

            // Re-insert with same logic as POST
            $deliverables = $input['deliverables'] ?? [];
            if (!empty($deliverables)) {
                $dStmt = $db->prepare("INSERT INTO post_deliverables (post_id, item) VALUES (:pid, :item)");
                foreach ($deliverables as $d) {
                    $d = trim($d);
                    if ($d !== '')
                        $dStmt->execute([':pid' => $id, ':item' => $d]);
                }
            }

            $techSpecs = $input['techSpecs'] ?? [];
            if (!empty($techSpecs)) {
                $sStmt = $db->prepare("INSERT INTO post_tech_specs (post_id, header, spec_value, unit, description) VALUES (:pid, :h, :v, :u, :d)");
                foreach ($techSpecs as $s) {
                    $header = trim($s['header'] ?? '');
                    if ($header !== '') {
                        $sStmt->execute([':pid' => $id, ':h' => $header, ':v' => trim($s['value'] ?? ''), ':u' => trim($s['unit'] ?? ''), ':d' => trim($s['description'] ?? '')]);
                    }
                }
            }

            $phases = $input['phases'] ?? [];
            if (!empty($phases)) {
                $pStmt = $db->prepare("INSERT INTO post_phases (post_id, title, image_url, phase_order) VALUES (:pid, :t, :img, :ord)");
                foreach ($phases as $i => $p) {
                    $pTitle = trim($p['title'] ?? '');
                    if ($pTitle !== '')
                        $pStmt->execute([':pid' => $id, ':t' => $pTitle, ':img' => trim($p['image'] ?? ''), ':ord' => $i + 1]);
                }
            }

            $impactInput = $input['impact'] ?? null;
            if ($impactInput && !empty(trim($impactInput['title'] ?? ''))) {
                $iStmt = $db->prepare("INSERT INTO post_impacts (post_id, title, description, image_url) VALUES (:pid, :t, :d, :img)");
                $iStmt->execute([':pid' => $id, ':t' => trim($impactInput['title']), ':d' => trim($impactInput['description'] ?? ''), ':img' => trim($impactInput['image'] ?? '')]);
                $impactId = (int) $db->lastInsertId();
                $impactStatsInput = $impactInput['stats'] ?? [];
                if (!empty($impactStatsInput)) {
                    $isStmt = $db->prepare("INSERT INTO post_impact_stats (impact_id, stat_value, stat_label) VALUES (:iid, :v, :l)");
                    foreach ($impactStatsInput as $st) {
                        $val = trim($st['value'] ?? '');
                        $lbl = trim($st['label'] ?? '');
                        if ($val !== '' || $lbl !== '')
                            $isStmt->execute([':iid' => $impactId, ':v' => $val, ':l' => $lbl]);
                    }
                }
            }

            $db->commit();
            logActivity('update_post', 'post', $id, "Updated post: $title", $user['user_id']);
            jsonSuccess([
                'post_id' => $id,
                'generateEnglish' => (bool) ($input['generateEnglish'] ?? false)
            ], 'Post updated successfully.');
        } catch (\Exception $e) {
            $db->rollBack();
            jsonError(500, 'Failed to update post: ' . $e->getMessage());
        }
        break;

    // ── DELETE ────────────────────────────────────────────────────────
    case 'DELETE':
        $user = requireAuth();
        if (!$id)
            jsonError(400, 'Post ID required for deletion.');

        $exists = $db->prepare("SELECT title FROM posts WHERE id = :id");
        $exists->execute([':id' => $id]);
        $post = $exists->fetch();
        if (!$post)
            jsonError(404, 'Post not found.');

        // CASCADE handles all related tables
        $db->prepare("DELETE FROM posts WHERE id = :id")->execute([':id' => $id]);

        logActivity('delete_post', 'post', $id, "Deleted post: " . $post['title'], $user['user_id']);
        jsonSuccess([], 'Post deleted successfully.');
        break;

    default:
        jsonError(405, 'Method not allowed.');
}
