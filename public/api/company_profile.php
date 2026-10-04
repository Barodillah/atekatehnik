<?php
/**
 * Company Profile API — Ateka Tehnik
 *
 * GET /api/company_profile.php
 * Fetch the single company profile configuration.
 * 
 * POST /api/company_profile.php
 * Update or insert the single company profile.
 */

require_once __DIR__ . '/helpers.php';

setCorsHeaders();

// Allow preflight for CORS if needed
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ensure the user is authenticated (using existing helper)
$user = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM company_profiles ORDER BY id ASC LIMIT 1");
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($profile) {
            jsonSuccess(['data' => $profile]);
        } else {
            // Return empty/default if no record
            jsonSuccess(['data' => null]);
        }
    } catch (Exception $e) {
        jsonError(500, 'Database error: ' . $e->getMessage());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = getJsonInput();
        
        // Validate minimally required fields (adjust as necessary based on UI)
        $companyName = trim($data['company_name'] ?? 'CV. ATEKA TEHNIK');
        $tagline = trim($data['tagline'] ?? '');
        $services = trim($data['services'] ?? '');
        $address = trim($data['address'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $email = trim($data['email'] ?? '');
        $logoUrl = trim($data['logo_url'] ?? '');
        $sigUrl = trim($data['signature_image_url'] ?? '');
        $stampUrl = trim($data['stamp_image_url'] ?? '');
        $sigName = trim($data['signatory_name'] ?? 'WARSITO');
        $sigTitle = trim($data['signatory_title'] ?? 'Pimpinan');
        
        // Check if a record exists
        $stmt = $db->query("SELECT id FROM company_profiles ORDER BY id ASC LIMIT 1");
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // Update
            $sql = "UPDATE company_profiles SET 
                    company_name = :cname, 
                    tagline = :tagline, 
                    services = :services,
                    address = :address, 
                    phone = :phone, 
                    email = :email, 
                    logo_url = :logo, 
                    signature_image_url = :sigurl, 
                    stamp_image_url = :stampurl, 
                    signatory_name = :signame, 
                    signatory_title = :sigtitle 
                    WHERE id = :id";
            $updateStmt = $db->prepare($sql);
            $updateStmt->execute([
                ':cname' => $companyName,
                ':tagline' => $tagline,
                ':services' => $services,
                ':address' => $address,
                ':phone' => $phone,
                ':email' => $email,
                ':logo' => $logoUrl,
                ':sigurl' => $sigUrl,
                ':stampurl' => $stampUrl,
                ':signame' => $sigName,
                ':sigtitle' => $sigTitle,
                ':id' => $existing['id']
            ]);
        } else {
            // Insert
            $sql = "INSERT INTO company_profiles 
                    (company_name, tagline, services, address, phone, email, logo_url, signature_image_url, stamp_image_url, signatory_name, signatory_title) 
                    VALUES 
                    (:cname, :tagline, :services, :address, :phone, :email, :logo, :sigurl, :stampurl, :signame, :sigtitle)";
            $insertStmt = $db->prepare($sql);
            $insertStmt->execute([
                ':cname' => $companyName,
                ':tagline' => $tagline,
                ':services' => $services,
                ':address' => $address,
                ':phone' => $phone,
                ':email' => $email,
                ':logo' => $logoUrl,
                ':sigurl' => $sigUrl,
                ':stampurl' => $stampUrl,
                ':signame' => $sigName,
                ':sigtitle' => $sigTitle
            ]);
        }
        
        jsonSuccess([], 'Profil perusahaan berhasil disimpan!');
        
    } catch (Exception $e) {
        jsonError(500, 'Gagal menyimpan data: ' . $e->getMessage());
    }
} else {
    jsonError(405, 'Method not allowed');
}
