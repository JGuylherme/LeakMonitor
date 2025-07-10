# LeakMonitor - Sistema de Detecção de Vazamento de Água — Dashboard IoT

Este projeto é um **Dashboard IoT para Monitoramento e Alerta de Vazamentos de Água**, desenvolvido como um **projeto acadêmico** para ambientes residenciais, comerciais ou institucionais. Ele utiliza sensores de umidade (ex: YL-83 ou FC-28), microcontrolador ESP8266/ESP32, comunicação MQTT e uma interface web moderna para visualização, análise e exportação dos dados.

Inspirado pelo alto índice de desperdício de água no Brasil (cerca de 40% da água tratada é perdida, principalmente por vazamentos não detectados), o sistema oferece uma solução prática, acessível e de baixo custo para minimizar perdas e aumentar a segurança hídrica.

---

## Funcionalidades

- **Monitoramento em tempo real:** Leituras instantâneas do sensor de umidade via MQTT.
- **Alertas automáticos:** Notificações por SMS, WhatsApp ou e-mail em caso de vazamento ou umidade anormal.
- **Histórico e análise gráfica:** Gráficos interativos (Chart.js), estatísticas (mínimo, máximo, média, tendência) e heatmap de calendário.
- **Cadastro de contatos:** Gerencie quem recebe os alertas.
- **Exportação de dados:** Baixe histórico ou leitura atual em CSV ou JSON.
- **Modo escuro e interface responsiva:** Visualização adaptada para qualquer dispositivo.
- **Confirmação para ações destrutivas:** Modal de confirmação para limpeza de dados históricos.
- **Simulação e testes:** Scripts para popular o banco com dados de teste.

---

## Arquitetura

- **Sensor de Umidade (YL-83, FC-28, etc):** Detecta presença de água ou umidade excessiva.
- **ESP8266/ESP32:** Microcontrolador responsável pela leitura do sensor e envio dos dados via MQTT.
- **Broker MQTT (HiveMQ Cloud, Mosquitto, etc):** Centraliza a comunicação entre o sensor e a aplicação web.
- **Backend PHP/MySQL:** Armazena leituras históricas, contatos e gerencia integrações (Twilio, etc).
- **Frontend HTML/CSS/JS:** Interface web moderna, responsiva e acessível.
- **APIs REST:** Para integração entre frontend, backend e serviços externos.

---

## Instalação e Execução

1. **Pré-requisitos**
   - PHP 7.1+ e MySQL/MariaDB
   - Composer (para dependências PHP)
   - Conta gratuita no [Twilio](https://www.twilio.com/) (para SMS/WhatsApp)
   - Conta gratuita no [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/) ou outro broker MQTT
   - XAMPP, WAMP ou similar (para ambiente local)

2. **Configuração**
   - Clone ou copie o projeto para a pasta `htdocs` do XAMPP (`C:\xampp\htdocs\LeakMonitor`).
   - Instale as dependências PHP:
     ```sh
     composer install
     ```
   - Crie o banco de dados `humidity` no phpMyAdmin.
   - Edite o arquivo [.env](http://_vscodecontentref_/0) com suas credenciais do banco, MQTT e Twilio.
   - Execute o script de criação de tabelas:
     - Pelo navegador: `http://localhost/LeakMonitor/api/start_db.php`
     - Ou pelo terminal:
       ```sh
       php api/start_db.php
       ```

3. **Execução**
   - Inicie Apache e MySQL pelo XAMPP.
   - Acesse `http://localhost/LeakMonitor/` no navegador.

---

## Estrutura dos Arquivos

- [index.html](http://_vscodecontentref_/1) — Interface web principal.
- [style.css](http://_vscodecontentref_/2) — Estilos da interface.
- [script.js](http://_vscodecontentref_/3) — Lógica de frontend (gráficos, simulação, exportação, heatmap, etc).
- `db.php` — Conexão PDO com o banco de dados MySQL.
- `faker.php` — Script para criar tabelas e popular com dados de teste.
- [api](http://_vscodecontentref_/4) — Endpoints PHP para integração frontend/backend.

---

## Uso

- O painel mostra as leituras do sensor em tempo real.
- Cadastre contatos para receber alertas por SMS, WhatsApp ou e-mail.
- Exporte dados ou visualize o histórico e análises.
- Ao detectar intensidade **Alta**, alertas são enviados automaticamente para todos os contatos cadastrados.

---

## Segurança

- O arquivo [.env](http://_vscodecontentref_/5) **NÃO** deve ser versionado (veja [.gitignore](http://_vscodecontentref_/6)).
- Nunca exponha suas credenciais do Twilio ou do banco de dados publicamente.

---

## Limitações e Melhorias Futuras

- **Sensor:** Substituir o YL-83 por modelos mais resistentes à oxidação.
- **Notificações:** Integrar com Telegram, WhatsApp ou e-mail para maior confiabilidade.
- **Banco de Dados:** Permitir múltiplos sensores e ambientes.
- **IA/ML:** Explorar algoritmos para detecção preditiva de vazamentos.
- **Aprimorar interface:** Mais opções de personalização e acessibilidade.

---

## Autores

Brenno Oliveira Lima, João Guylherme A.
