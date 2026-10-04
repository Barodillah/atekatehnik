<?php
require 'public/api/db.php';
$pdo = getDB();
$stmt = $pdo->query('SELECT id, quotation_number, title FROM quotations ORDER BY id DESC LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
