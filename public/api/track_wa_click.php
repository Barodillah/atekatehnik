<?php
/**
 * Track WA Click API — Ateka Tehnik
 *
 * GET  /api/track_wa_click.php?action=get_next
 * POST /api/track_wa_click.php
 * Body: { "source_page": "product-detail", "source_label": "RMU 2 Ton", "target_number": "...", "wa_number": "...", "target_label": "..." }
 *
 * Records a WhatsApp CTA click with full analytics:
 * IP, User-Agent parsing, Geo-location via ip-api.com, target CS resolution.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$csList = [
    'rani' => [
        'id'      => 'rani',
        'name'    => 'Rani',
        'number'  => '62881080634612',
        'display' => '+62 881-0806-34612'
    ],
    'barron' => [
        'id'      => 'barron',
        'name'    => 'Barron',
        'number'  => '62882005144907',
        'display' => '+62 882-0051-44907'
    ]
];

/**
 * Resolves the next CS to receive a WhatsApp click based on the last recorded click in wa_cta_clicks.
 * Intelligently checks whichever columns exist (target_number, wa_number, target_label)
 * and safely sorts by clicked_at / id without SQL errors.
 */
function resolveNextCs(PDO $db, array $csList): array {
    try {
        $colStmt = $db->query("SHOW COLUMNS FROM wa_cta_clicks");
        $cols = $colStmt ? array_map('strtolower', $colStmt->fetchAll(PDO::FETCH_COLUMN)) : [];

        $hasClickedAt   = in_array('clicked_at', $cols);
        $hasId          = in_array('id', $cols);
        $hasTargetLabel = in_array('target_label', $cols);
        $hasTargetNumber= in_array('target_number', $cols);
        $hasWaNumber    = in_array('wa_number', $cols);

        // Build safe ORDER BY clause
        $orderClause = "";
        if ($hasClickedAt && $hasId) {
            $orderClause = "ORDER BY clicked_at DESC, id DESC";
        } elseif ($hasClickedAt) {
            $orderClause = "ORDER BY clicked_at DESC";
        } elseif ($hasId) {
            $orderClause = "ORDER BY id DESC";
        }

        // Build SELECT columns
        $selectFields = [];
        if ($hasTargetLabel)  $selectFields[] = "target_label";
        if ($hasTargetNumber) $selectFields[] = "target_number";
        if ($hasWaNumber)     $selectFields[] = "wa_number";

        if (empty($selectFields)) {
            return ['next' => $csList['rani'], 'last_label' => null];
        }

        $selectStr = implode(', ', $selectFields);

        // Build WHERE clause to find last known click
        $whereList = [];
        if ($hasTargetLabel) {
            $whereList[] = "(target_label IS NOT NULL AND target_label != '')";
        }
        if ($hasTargetNumber) {
            $whereList[] = "(target_number IS NOT NULL AND target_number != '')";
        }
        if ($hasWaNumber) {
            $whereList[] = "(wa_number IS NOT NULL AND wa_number != '')";
        }

        $whereClause = !empty($whereList) ? "WHERE " . implode(' OR ', $whereList) : "";

        $sql = "SELECT {$selectStr} FROM wa_cta_clicks {$whereClause} {$orderClause} LIMIT 1";
        $stmt = $db->query($sql);
        $lastRow = $stmt ? $stmt->fetch() : null;

        if ($lastRow) {
            $label = strtolower(trim($lastRow['target_label'] ?? ''));
            $num1  = trim($lastRow['target_number'] ?? '');
            $num2  = trim($lastRow['wa_number'] ?? '');
            $info  = $label . ' ' . $num1 . ' ' . $num2;

            $isRani   = (strpos($info, 'rani') !== false)   || (strpos($info, '881080634612') !== false);
            $isBarron = (strpos($info, 'barron') !== false) || (strpos($info, '882005144907') !== false);

            if ($isRani) {
                // Last click went to Rani -> Next goes to Barron!
                return ['next' => $csList['barron'], 'last_label' => 'Rani'];
            } elseif ($isBarron) {
                // Last click went to Barron -> Next goes to Rani!
                return ['next' => $csList['rani'], 'last_label' => 'Barron'];
            }
        }
    } catch (\Throwable $e) {
        error_log("Resolve next CS error: " . $e->getMessage());
    }

    // Default fallback: Rani
    return ['next' => $csList['rani'], 'last_label' => null];
}

// ── GET Method: Query Next Rotated Contact ──────────────────────────
if ($method === 'GET') {
    $db = getDB();
    $result = resolveNextCs($db, $csList);
    jsonSuccess([
        'next'       => $result['next'],
        'last_label' => $result['last_label'],
        'contacts'   => array_values($csList),
    ], 'Current rotation status retrieved.');
}

// ── POST Method: Record WhatsApp Click ──────────────────────────────
requireMethod('POST');

$input = getJsonInput();

$sourcePage   = trim($input['source_page'] ?? '');
$sourceLabel  = trim($input['source_label'] ?? '');
// Support both target_number and wa_number in payload
$targetNumber = trim($input['target_number'] ?? ($input['wa_number'] ?? ''));
$targetLabel  = trim($input['target_label'] ?? '');

if (empty($sourcePage)) {
    jsonError(400, 'source_page is required.');
}

$db = getDB();

// ── Normalize CS Target ─────────────────────────────────────────────
if (!empty($targetNumber)) {
    // If phone number explicitly indicates CS, enforce accurate label & clean format
    if (strpos($targetNumber, '882005144907') !== false || strtolower($targetLabel) === 'barron') {
        $targetNumber = '62882005144907';
        $targetLabel  = 'Barron';
    } elseif (strpos($targetNumber, '881080634612') !== false || strtolower($targetLabel) === 'rani') {
        $targetNumber = '62881080634612';
        $targetLabel  = 'Rani';
    }
} elseif (empty($targetLabel) || $targetLabel === 'auto') {
    // If not supplied, resolve alternating CS from database
    $rotation = resolveNextCs($db, $csList);
    $targetNumber = $rotation['next']['number'];
    $targetLabel  = $rotation['next']['name'];
}

// ── Gather Analytics Data ────────────────────────────────────────────

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$referrer = $_SERVER['HTTP_REFERER'] ?? '';

// ── Parse User-Agent ─────────────────────────────────────────────────

function parseWaClickUserAgent(string $ua): array {
    $browser = 'Unknown';
    $os = 'Unknown';
    $deviceType = 'Desktop';

    // Browser detection
    if (preg_match('/Edg\//i', $ua))          $browser = 'Edge';
    elseif (preg_match('/OPR|Opera/i', $ua))  $browser = 'Opera';
    elseif (preg_match('/Chrome/i', $ua))     $browser = 'Chrome';
    elseif (preg_match('/Firefox/i', $ua))    $browser = 'Firefox';
    elseif (preg_match('/Safari/i', $ua) && !preg_match('/Chrome/i', $ua)) $browser = 'Safari';
    elseif (preg_match('/MSIE|Trident/i', $ua)) $browser = 'Internet Explorer';

    // OS detection
    if (preg_match('/Windows/i', $ua))        $os = 'Windows';
    elseif (preg_match('/Macintosh/i', $ua))  $os = 'macOS';
    elseif (preg_match('/Linux/i', $ua))      $os = 'Linux';
    elseif (preg_match('/Android/i', $ua))    $os = 'Android';
    elseif (preg_match('/iPhone|iPad/i', $ua)) $os = 'iOS';

    // Device type detection
    if (preg_match('/Mobi|Android.*Mobile/i', $ua)) {
        $deviceType = 'Mobile';
    } elseif (preg_match('/Tablet|iPad/i', $ua)) {
        $deviceType = 'Tablet';
    }

    return compact('browser', 'os', 'deviceType');
}

$parsed = parseWaClickUserAgent($userAgent);
$browser = $parsed['browser'];
$os = $parsed['os'];
$deviceType = $parsed['deviceType'];

// ── Geo-Location via ip-api.com ──────────────────────────────────────

$country = '';
$city = '';

if (!in_array($ip, ['127.0.0.1', '::1', 'unknown', 'localhost'])) {
    $geoUrl = "http://ip-api.com/json/{$ip}?fields=status,country,city";
    $ctx = stream_context_create(['http' => ['timeout' => 2]]);
    $geoResponse = @file_get_contents($geoUrl, false, $ctx);

    if ($geoResponse) {
        $geoData = json_decode($geoResponse, true);
        if (($geoData['status'] ?? '') === 'success') {
            $country = $geoData['country'] ?? '';
            $city    = $geoData['city'] ?? '';
        }
    }
} else {
    $country = 'Local';
    $city = 'Localhost';
}

// ── Auto-Migration & Insert into Database ───────────────────────────

try {
    $existingCols = [];
    try {
        $colStmt = $db->query("SHOW COLUMNS FROM wa_cta_clicks");
        $existingCols = $colStmt ? array_map('strtolower', $colStmt->fetchAll(PDO::FETCH_COLUMN)) : [];
    } catch (\Throwable $e) {}

    // Auto add target_number if missing
    if (!in_array('target_number', $existingCols)) {
        try {
            $db->exec("ALTER TABLE wa_cta_clicks ADD COLUMN target_number VARCHAR(30) NULL AFTER source_label");
            $existingCols[] = 'target_number';
        } catch (\Throwable $e) {}
    }

    // Auto add target_label if missing
    if (!in_array('target_label', $existingCols)) {
        try {
            $db->exec("ALTER TABLE wa_cta_clicks ADD COLUMN target_label VARCHAR(50) NULL AFTER target_number");
            $existingCols[] = 'target_label';
        } catch (\Throwable $e) {}
    }

    // Dynamic columns for INSERT
    $insertCols = ['source_page', 'source_label', 'ip_address', 'user_agent', 'browser', 'os', 'device_type', 'country', 'city', 'referrer'];
    $insertVals = [
        ':source_page'  => mb_substr($sourcePage, 0, 100),
        ':source_label' => $sourceLabel ? mb_substr($sourceLabel, 0, 255) : null,
        ':ip'           => $ip,
        ':ua'           => mb_substr($userAgent, 0, 500),
        ':browser'      => $browser,
        ':os'           => $os,
        ':device'       => $deviceType,
        ':country'      => $country,
        ':city'         => $city,
        ':referrer'     => mb_substr($referrer, 0, 500),
    ];

    // Populate target_number column if it exists in table
    if (in_array('target_number', $existingCols)) {
        $insertCols[] = 'target_number';
        $insertVals[':target_number'] = $targetNumber ? mb_substr($targetNumber, 0, 30) : null;
    }

    // Populate wa_number column if it exists in table
    if (in_array('wa_number', $existingCols)) {
        $insertCols[] = 'wa_number';
        $insertVals[':wa_number'] = $targetNumber ? mb_substr($targetNumber, 0, 30) : null;
    }

    // Populate target_label column if it exists in table
    if (in_array('target_label', $existingCols)) {
        $insertCols[] = 'target_label';
        $insertVals[':target_label'] = $targetLabel ? mb_substr($targetLabel, 0, 50) : null;
    }

    $colNames = implode(', ', $insertCols);
    $placeholders = implode(', ', array_keys($insertVals));

    $stmt = $db->prepare("INSERT INTO wa_cta_clicks ({$colNames}) VALUES ({$placeholders})");
    $stmt->execute($insertVals);

    jsonSuccess([
        'target_number' => $targetNumber,
        'wa_number'     => $targetNumber,
        'target_label'  => $targetLabel
    ], 'Click tracked successfully.');

} catch (\Exception $e) {
    jsonError(500, 'Failed to track click: ' . $e->getMessage());
}
