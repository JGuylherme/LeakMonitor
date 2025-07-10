<?php
require_once 'db.php';
$env = parse_ini_file(__DIR__ . '/.env');
require_once __DIR__ . '/../vendor/autoload.php';

use Twilio\Rest\Client;

$twilioSid   = $env['TWILIO_SID'];
$twilioToken = $env['TWILIO_TOKEN'];
$twilioFrom  = $env['TWILIO_FROM'];
$client = new Client($twilioSid, $twilioToken);

$data = json_decode(file_get_contents('php://input'), true);
$msg = $data['msg'] ?? "⚠️ Alerta: Vazamento detectado!";

$umaHoraAtras = date('Y-m-d H:i:s', strtotime('-1 hour'));
$checkSMS = $pdo->prepare("SELECT COUNT(*) FROM alert_log WHERE tipo = 'sms_umidade_alta' AND enviado_em >= ?");
$checkSMS->execute([$umaHoraAtras]);
$smsEnviado = $checkSMS->fetchColumn();

if ($smsEnviado > 0) {
    echo "Já enviado";
    exit;
}

try {
    $contatos = $pdo->query("SELECT * FROM contacts WHERE tipo='telefone'")->fetchAll();
    foreach ($contatos as $c) {
        $client->messages->create($c['contato'], [
            'from' => $twilioFrom,
            'body' => $msg
        ]);
    }
    $pdo->prepare("INSERT INTO alert_log (tipo, enviado_em) VALUES (?, NOW())")
        ->execute(['sms_umidade_alta']);
    echo "SMS enviado com sucesso!";
} catch (Exception $e) {
    echo "Erro ao enviar SMS: " . $e->getMessage();
}
