#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

//WIFI Casa

// WiFi CEFET
const char* ssid = "*****";
const char* password = "*******";

// Broker MQTT
const char* mqtt_server = "******.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "usuariofc";
const char* mqtt_pass = "******";
const char* mqtt_topic = "sensorfc28";
char mqtt_client_id[32];

// Sensor
#define SENSOR_PIN A0
WiFiClientSecure espClientSecure;
PubSubClient client(espClientSecure);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", -3 * 3600, 60000); // GMT-3

//TENTA CONECTAR AO WIFI
void setup_wifi() {
  delay(10);
  Serial.println("Conectando ao WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWIFI conectado");

}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao Broker MQTT");

    if (client.connect(mqtt_client_id, mqtt_user, mqtt_pass)) {
      Serial.println("Conectado ao Broker!");
    } else {
      Serial.print("Falhou, rc=");
      Serial.print(client.state());
      Serial.println(". Tentando novamente em 20s...");
      delay(20000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(SENSOR_PIN, INPUT);

  snprintf(mqtt_client_id, sizeof(mqtt_client_id), "esp8266-client-%04X", random(0xffff));

  setup_wifi();

  espClientSecure.setInsecure();  

  client.setServer(mqtt_server, mqtt_port);

  timeClient.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  timeClient.update();
  int sensorValue = analogRead(SENSOR_PIN);
  float umidadePercentual = map(sensorValue, 0, 1023, 100, 0);
  String estado, intensidade;
  if (umidadePercentual >= 90) {
    estado = "Molhado";
    intensidade = "Muito Alta";
  } else if (umidadePercentual >= 60) {
    estado = "Molhado";
    intensidade = "Alta";
  } else if (umidadePercentual >= 40) {
    estado = "Levemente molhado";
    intensidade = "Média";
  } else if (umidadePercentual >= 10) {
    estado = "Úmido";
    intensidade = "Baixa";
  } else {
    estado = "Seco";
    intensidade = "Baixa";
  }

  String horaAtual = timeClient.getFormattedTime();
  Serial.println("========== Leitura ==========");
  Serial.print("Hora: "); Serial.println(horaAtual);
  Serial.print("Valor bruto do sensor: "); Serial.println(sensorValue);
  Serial.print("Umidade: "); Serial.print(umidadePercentual); Serial.println("%");
  Serial.print("Estado: "); Serial.println(estado);
  Serial.print("Intensidade: "); Serial.println(intensidade);
  Serial.println("=============================");

  String payload = "{";
  payload += "\"hora\": \"" + horaAtual + "\",";
  payload += "\"valor\": " + String(sensorValue) + ",";
  payload += "\"umidade\": " + String(umidadePercentual) + ",";
  payload += "\"estado\": \"" + estado + "\",";
  payload += "\"intensidade\": \"" + intensidade + "\"";
  payload += "}";

  client.publish(mqtt_topic, payload.c_str());

  delay(13000);
}
