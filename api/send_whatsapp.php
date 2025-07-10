<?php
require_once 'db.php';
$env = parse_ini_file(__DIR__ . '/.env');
require_once __DIR__ . '/../vendor/autoload.php';

use Twilio\Rest\Client;

$twilioSid   = $env['TWILIO_SID'];
$twilioToken = $env['TWILIO_TOKEN'];
$twilioFrom  = 'whatsapp:' . $env['TWILIO_FROM_WHATSAPP'];
$client = new Client($twilioSid, $twilioToken);

$data = json_decode(file_get_contents('php://input'), true);
$msg = $data['msg'] ?? "Alerta WhatsApp: Vazamento detectado!";

$umaHoraAtras = date('Y-m-d H:i:s', strtotime('-1 hour'));
$checkWA = $pdo->prepare("SELECT COUNT(*) FROM alert_log WHERE tipo = 'whatsapp_umidade_alta' AND enviado_em >= ?");
$checkWA->execute([$umaHoraAtras]);
$waEnviado = $checkWA->fetchColumn();

if ($waEnviado > 0) {
    echo "Já enviado";
    exit;
}

try {
    $contatos = $pdo->query("SELECT * FROM contacts WHERE tipo='whatsapp'")->fetchAll();
    foreach ($contatos as $c) {
        $client->messages->create(
            'whatsapp:' . $c['contato'],
            ['from' => $twilioFrom, 'body' => $msg]
        );
    }
    $pdo->prepare("INSERT INTO alert_log (tipo, enviado_em) VALUES (?, NOW())")
        ->execute(['whatsapp_umidade_alta']);
    echo "WhatsApp enviado com sucesso!";
} catch (Exception $e) {
    echo "Erro ao enviar WhatsApp: " . $e->getMessage();
}
