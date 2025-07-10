<?php
require_once 'db.php';

function createTable($pdo, $sql)
{
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        echo "Erro ao criar tabela: " . $e->getMessage() . "<br>";
    }
}

function alterContactsEnum($pdo)
{
    $sql = "ALTER TABLE contacts MODIFY tipo ENUM('telefone','email','whatsapp') NOT NULL;";
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'check that column') === false) {
            echo "Erro ao atualizar ENUM da tabela 'contacts': " . $e->getMessage() . "<br>";
        }
    }
}

$sqlReadings = "CREATE TABLE IF NOT EXISTS readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hora TIME NOT NULL,
    data DATE NOT NULL,
    valor INT NOT NULL,
    umidade INT NOT NULL,
    estado VARCHAR(32) NOT NULL,
    intensidade VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$sqlContacts = "CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('telefone','email','whatsapp') NOT NULL,
    contato VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$sqlAlertLog = "CREATE TABLE IF NOT EXISTS alert_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50),
  enviado_em DATETIME
);";

try {
    createTable($pdo, $sqlReadings);
    createTable($pdo, $sqlContacts);
    createTable($pdo, $sqlAlertLog);
    alterContactsEnum($pdo);
    echo "Banco de dados inicializado.";
} catch (Throwable $e) {
    echo "Erro geral: " . $e->getMessage();
}
