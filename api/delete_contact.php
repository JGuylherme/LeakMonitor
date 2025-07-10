<?php
require_once 'db.php';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id) {
    $stmt = $pdo->prepare("DELETE FROM contacts WHERE id=?");
    $stmt->execute([$id]);
}
echo "OK";
?>