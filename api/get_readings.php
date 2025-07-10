<?php
require_once 'db.php';

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 500;

$stmt = $pdo->prepare("SELECT * FROM readings ORDER BY id DESC LIMIT ?");
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();
$readings = $stmt->fetchAll();

echo json_encode(array_reverse($readings)); 
?>