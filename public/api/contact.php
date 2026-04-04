<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load .env
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $_ENV[trim($name)] = trim($value);
        }
    }
}

// Map Request
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body']);
    exit;
}

// Prepare Data Structure suitable for future MySQL Table implementation
$contactData = [
    'name'       => trim($input['name'] ?? ''),
    'company'    => trim($input['company'] ?? ''),
    'capacity'   => trim($input['capacity'] ?? ''),
    'location'   => trim($input['location'] ?? ''),
    'email'      => trim($input['email'] ?? ''),
    'phone'      => trim($input['phone'] ?? ''),
    'message'    => trim($input['message'] ?? ''),
    'lang'       => trim($input['lang'] ?? 'id'),
    'created_at' => date('Y-m-d H:i:s')
];

// Basic Validation
if (empty($contactData['name']) || empty($contactData['email']) || empty($contactData['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, Email, and Message are required.']);
    exit;
}

if (!filter_var($contactData['email'], FILTER_VALIDATE_EMAIL)) {
     http_response_code(400);
     echo json_encode(['error' => 'Invalid email address.']);
     exit;
}

require_once __DIR__ . '/helpers.php';

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO leads (name, company, capacity_ref, location, email, phone, service_request, status)
        VALUES (:name, :company, :cap, :loc, :email, :phone, :svc, 'New')
    ");
    $stmt->execute([
        ':name'    => $contactData['name'],
        ':company' => $contactData['company'],
        ':cap'     => $contactData['capacity'],
        ':loc'     => $contactData['location'],
        ':email'   => $contactData['email'],
        ':phone'   => $contactData['phone'],
        ':svc'     => $contactData['message'],
    ]);
} catch (Exception $e) {
    // Log db error but don't fail the request completely if we still want to send email
    error_log("Failed to insert lead from contact form: " . $e->getMessage());
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

try {
    // Shared SMTP Configuration
    function createMailerConfig() {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? 'noreply@atekatehnik.com';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? 'Ateka.354';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            
        $mail->Port       = $_ENV['MAIL_PORT'] ?? 465;                                    
        return $mail;
    }

    // ========== EMAIL 1: TO COMPANY ==========
    $mailCompany = createMailerConfig();
    $mailCompany->setFrom($_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@atekatehnik.com', 'Ateka Tehnik Website');
    $mailCompany->addAddress('info@atekatehnik.com');
    $mailCompany->addAddress('cvatekatehnik@gmail.com');
    $mailCompany->addAddress('barodabdillah313@gmail.com');
    $mailCompany->addReplyTo($contactData['email'], $contactData['name']);

    $mailCompany->isHTML(true);
    $mailCompany->Subject = 'Pertanyaan Masuk: ' . $contactData['name'];
    
    // HTML Body for Company
    $bodyCompany = "
    <div style='background-color: #f4f7f6; padding: 40px 20px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
            <div style='background-color: #001f5b; padding: 25px 30px; text-align: center;'>
                <h2 style='color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;'>Pertanyaan Teknis Baru</h2>
            </div>
            <div style='padding: 30px;'>
                <p style='color: #555555; font-size: 15px; margin-bottom: 25px;'>Sebuah pengajuan form kontak baru telah diterima dari website. Berikut detailnya:</p>
                <div style='background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px;'>
                    <table width='100%' cellpadding='0' cellspacing='0' style='font-size: 14px; color: #333333;'>
                        <tr><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee; width: 130px; color: #777777; font-weight: bold;'>Nama Lengkap</td><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'><strong>{$contactData['name']}</strong></td></tr>
                        <tr><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #777777; font-weight: bold;'>Perusahaan</td><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'>{$contactData['company']}</td></tr>
                        <tr><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #777777; font-weight: bold;'>Req. Kapasitas</td><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'><span style='background-color: #e3f2fd; color: #0d47a1; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;'>{$contactData['capacity']}</span></td></tr>
                        <tr><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #777777; font-weight: bold;'>Lokasi</td><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'>{$contactData['location']}</td></tr>
                        <tr><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #777777; font-weight: bold;'>Email</td><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'><a href='mailto:{$contactData['email']}' style='color: #0056b3; text-decoration: none;'>{$contactData['email']}</a></td></tr>
                        <tr><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #777777; font-weight: bold;'>Nomor Telepon</td><td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'><a href='tel:{$contactData['phone']}' style='color: #0056b3; text-decoration: none;'>{$contactData['phone']}</a></td></tr>
                        <tr><td style='padding: 15px 0 5px 0; color: #777777; font-weight: bold;' colspan='2'>Pesan Detail</td></tr>
                        <tr><td colspan='2' style='padding: 15px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 4px; line-height: 1.6;'>" . nl2br(htmlspecialchars($contactData['message'])) . "</td></tr>
                    </table>
                </div>
                <div style='margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px; font-size: 12px; color: #999999; text-align: center;'>
                    Dikirim pada: {$contactData['created_at']} via Website Ateka Tehnik
                </div>
            </div>
        </div>
    </div>
    ";
    
    $mailCompany->Body = $bodyCompany;
    $mailCompany->send();

    // ========== EMAIL 2: TO CUSTOMER (AUTO-REPLY) ==========
    $mailCustomer = createMailerConfig();
    $mailCustomer->setFrom($_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@atekatehnik.com', 'Ateka Tehnik');
    $mailCustomer->addAddress($contactData['email'], $contactData['name']);
    
    $mailCustomer->isHTML(true);
    $lang = $contactData['lang'] ?? 'id';

    if ($lang === 'en') {
        $mailCustomer->Subject = 'Thank You for Your Inquiry - Ateka Tehnik';
        $bodyCustomer = "
        <div style='background-color: #f4f7f6; padding: 40px 20px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);'>
                <div style='background-color: #001f5b; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;'>CV. ATEKA TEHNIK</h1>
                    <p style='color: #a0c1ff; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;'>Engineering The Future of Rice Milling</p>
                </div>
                
                <div style='padding: 40px 30px; color: #333333; line-height: 1.7; font-size: 15px;'>
                    <p style='margin-top: 0;'>Dear Mr/Ms <strong>{$contactData['name']}</strong>,</p>
                    
                    <p>Thank you for contacting <strong>CV. Ateka Tehnik</strong>. We have received your message and greatly appreciate your interest in our industrial engineering products and services.</p>
                    
                    <div style='background-color: #f0f7ff; border-left: 4px solid #0056b3; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;'>
                        <p style='margin: 0; color: #003d82;'><strong>Request Status:</strong> Under Review<br>
                        Our engineering team is currently studying your specifications (<em>Capacity: {$contactData['capacity']}</em>) and will provide a comprehensive response within a maximum of <strong>1x24 working hours</strong>.</p>
                    </div>
                    
                    <p style='color: #666666; font-size: 14px; margin-bottom: 5px;'>Message Summary:</p>
                    <div style='background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px 20px; border-radius: 6px; font-style: italic; color: #555555; margin-bottom: 25px;'>
                        \"" . nl2br(htmlspecialchars($contactData['message'])) . "\"
                    </div>
                    
                    <p>If there are any additional technical specifications or documents you wish to attach, you can simply reply to this email directly.</p>
                    
                    <p style='margin-bottom: 0;'>Sincerely,</p>
                    <p style='margin-top: 5px; font-weight: 600; color: #001f5b;'>Technical Consultation Division</p>
                </div>
                
                <div style='background-color: #f8f9fa; border-top: 1px solid #eeeeee; padding: 25px 30px; text-align: center; font-size: 12px; color: #777777;'>
                    <p style='margin: 0 0 10px 0;'><strong>CV. Ateka Tehnik</strong><br>
                    Jl. Grompol - Jambangan, Mojogedang, Karanganyar, Central Java</p>
                    
                    <div style='margin-top: 15px;'>
                        <a href='mailto:info@atekatehnik.com' style='color: #0056b3; text-decoration: none; margin: 0 10px;'>Email Support</a> &bull; 
                        <a href='https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik,com.%20Halo%20Ateka%20Tehnik%2C%20saya%20butuh%20bantuan.' style='color: #0056b3; text-decoration: none; margin: 0 10px;'>WhatsApp</a> &bull; 
                        <a href='https://www.atekatehnik.com' style='color: #0056b3; text-decoration: none; margin: 0 10px;'>Website</a>
                    </div>
                </div>
            </div>
        </div>
        ";
    } else {
        $mailCustomer->Subject = 'Terima Kasih atas Pesan Anda - Ateka Tehnik';
        $bodyCustomer = "
        <div style='background-color: #f4f7f6; padding: 40px 20px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);'>
                <div style='background-color: #001f5b; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;'>CV. ATEKA TEHNIK</h1>
                    <p style='color: #a0c1ff; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;'>Engineering The Future of Rice Milling</p>
                </div>
                
                <div style='padding: 40px 30px; color: #333333; line-height: 1.7; font-size: 15px;'>
                    <p style='margin-top: 0;'>Yth. Bpk/Ibu <strong>{$contactData['name']}</strong>,</p>
                    
                    <p>Terima kasih telah menghubungi <strong>CV. Ateka Tehnik</strong>. Kami telah menerima pesan Anda dan sangat menghargai ketertarikan Anda terhadap produk dan layanan rekayasa industri kami.</p>
                    
                    <div style='background-color: #f0f7ff; border-left: 4px solid #0056b3; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;'>
                        <p style='margin: 0; color: #003d82;'><strong>Status Permintaan:</strong> Sedang Diulas<br>
                        Tim ahli teknik kami sedang mempelajari spesifikasi Anda (<em>Kapasitas: {$contactData['capacity']}</em>) dan akan memberikan tanggapan komprehensif maksimal dalam waktu <strong>1x24 jam kerja</strong>.</p>
                    </div>
                    
                    <p style='color: #666666; font-size: 14px; margin-bottom: 5px;'>Ringkasan Pesan Anda:</p>
                    <div style='background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px 20px; border-radius: 6px; font-style: italic; color: #555555; margin-bottom: 25px;'>
                        \"" . nl2br(htmlspecialchars($contactData['message'])) . "\"
                    </div>
                    
                    <p>Jika ada penambahan spesifikasi teknis atau dokumen yang ingin Anda sertakan, Anda cukup membalas <em>(reply)</em> email ini secara langsung.</p>
                    
                    <p style='margin-bottom: 0;'>Hormat kami,</p>
                    <p style='margin-top: 5px; font-weight: 600; color: #001f5b;'>Divisi Konsultasi Teknik</p>
                </div>
                
                <div style='background-color: #f8f9fa; border-top: 1px solid #eeeeee; padding: 25px 30px; text-align: center; font-size: 12px; color: #777777;'>
                    <p style='margin: 0 0 10px 0;'><strong>CV. Ateka Tehnik</strong><br>
                    Jl. Grompol - Jambangan, Mojogedang, Karanganyar, Jawa Tengah</p>
                    
                    <div style='margin-top: 15px;'>
                        <a href='mailto:info@atekatehnik.com' style='color: #0056b3; text-decoration: none; margin: 0 10px;'>Email Support</a> &bull; 
                        <a href='https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik,com.%20Halo%20Ateka%20Tehnik%2C%20saya%20butuh%20bantuan.' style='color: #0056b3; text-decoration: none; margin: 0 10px;'>WhatsApp</a> &bull; 
                        <a href='https://www.atekatehnik.com' style='color: #0056b3; text-decoration: none; margin: 0 10px;'>Website</a>
                    </div>
                </div>
            </div>
        </div>
        ";
    }
    $mailCustomer->Body = $bodyCustomer;
    $mailCustomer->send();

    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => 'Your message has been sent successfully.',
        'data' => $contactData // Useful for debugging or frontend confirmation
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => "Message could not be sent. Mailer Error: {$e->getMessage()}"]);
}
