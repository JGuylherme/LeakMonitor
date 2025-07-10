<?php
require_once 'db.php';
$contacts = $pdo->query("SELECT * FROM contacts ORDER BY id DESC")->fetchAll();
header('Content-Type: application/json');
echo json_encode($contacts);
?>