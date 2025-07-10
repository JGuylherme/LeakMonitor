<?php
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['tipo']) || !isset($data['contato'])) {
    http_response_code(400);
    echo "Dados inválidos";
    exit;
}

$stmt = $pdo->prepare("INSERT INTO contacts (tipo, contato) VALUES (?, ?)");
$stmt->execute([
    $data['tipo'],
    $data['contato']
]);

echo "OK";
?>