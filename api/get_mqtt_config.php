<?php
header('Content-Type: application/json');
$env = parse_ini_file(__DIR__ . '/.env');
echo json_encode([
    'MQTT_BROKER' => $env['MQTT_BROKER'],
    'MQTT_USER'   => $env['MQTT_USER'],
    'MQTT_PASS'   => $env['MQTT_PASS']
]);
?>