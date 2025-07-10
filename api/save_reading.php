<?php
require_once 'db.php';

date_default_timezone_set('America/Sao_Paulo');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo "Dados inválidos";
    exit;
}

$stmt = $pdo->prepare("INSERT INTO readings (hora, data, valor, umidade, estado, intensidade) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $data['hora'],
    date('Y-m-d'),
    $data['valor'],
    $data['umidade'],
    $data['estado'],
    $data['intensidade']
]);

echo "OK";
