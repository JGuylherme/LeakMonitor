<?php
require_once 'db.php';
$pdo->exec("DELETE FROM readings");
echo "OK";
?>