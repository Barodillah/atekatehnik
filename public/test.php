<?php
require_once 'c:\laragon\www\atekatehnik\public\api\helpers.php';
try {
    $pdo = getDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $is_template = 1;
    $template_name = "test 123";
    $lead_id = null;
    $quotation_number = null;
    $title = "";
    $capacity_label = "";
    $quotation_date = date('Y-m-d');
    $valid_until = null;
    $cover_title = "";
    $cover_description = "";
    $cover_advantages = "[]";
    $cover_image_url = "";
    $subtotal = 0;
    $installation_fee = 0;
    $shipping_fee = 0;
    $discount_amount = 0;
    $use_tax = 0;
    $tax_amount = 0;
    $grand_total = 0;
    $terms_conditions = "";
    $status = "draft";
    
    $sql = "INSERT INTO quotations 
            (is_template, template_name, lead_id, quotation_number, title, capacity_label, quotation_date, valid_until, cover_title, cover_description, cover_advantages, cover_image_url, subtotal, installation_fee, shipping_fee, discount_amount, use_tax, tax_amount, grand_total, terms_conditions, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $is_template, $template_name, $lead_id, $quotation_number, $title, $capacity_label, $quotation_date, $valid_until, $cover_title, $cover_description, $cover_advantages, $cover_image_url, $subtotal, $installation_fee, $shipping_fee, $discount_amount, $use_tax, $tax_amount, $grand_total, $terms_conditions, $status
    ]);
    
    echo "SUCCESS: " . $pdo->lastInsertId();
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
