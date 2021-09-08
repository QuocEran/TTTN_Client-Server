#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h> //https://github.com/Links2004/arduinoWebSockets



WebSocketsClient webSocket;
const char* ssid = "Phong 202 CYBERHOME"; //Đổi thành wifi của bạn
const char* password = "445566202"; //Đổi pass luôn
const char* ip_host = "192.168.202.106"; //Đổi luôn IP host của PC nha
const uint16_t port = 8080; //Port thích đổi thì phải đổi ở server nữa
const int LED1 = 16;
const int LED2 = 5;
const int LED3 = 4;
const int BTN = 0;




void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED:
      {
        Serial.printf("[WSc] Connected to url: %s", payload);
      }
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);
      if (strcmp((char*)payload, "LED1_ON") == 0) {
        digitalWrite(LED1, 0); // Khi client phát sự kiện "LED_ON" thì server sẽ bật LED
        
      } else if (strcmp((char*)payload, "LED1_OFF") == 0) {
        digitalWrite(LED1, 1); // Khi client phát sự kiện "LED_OFF" thì server sẽ tắt LED
      } if (strcmp((char*)payload, "LED2_ON") == 0) {
        digitalWrite(LED2, 0); // Khi client phát sự kiện "LED_ON" thì server sẽ bật LED
        
      } else if (strcmp((char*)payload, "LED2_OFF") == 0) {
        digitalWrite(LED2, 1); // Khi client phát sự kiện "LED_OFF" thì server sẽ tắt LED
      } if (strcmp((char*)payload, "LED3_ON") == 0) {
        digitalWrite(LED3, 0); // Khi client phát sự kiện "LED_ON" thì server sẽ bật LED
        
      } else if (strcmp((char*)payload, "LED3_OFF") == 0) {
        digitalWrite(LED3, 1); // Khi client phát sự kiện "LED_OFF" thì server sẽ tắt LED
      }
      break;
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      break;
  }
}
void setup() {
    pinMode(LED1, OUTPUT);
    pinMode(LED2, OUTPUT);
    pinMode(LED3, OUTPUT);
    pinMode(BTN, INPUT);
    Serial.begin(115200);
    Serial.print("ESP8266 Websocket Client - Connecting to: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("");
    Serial.println("Wifi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    webSocket.begin(ip_host, port);
    webSocket.onEvent(webSocketEvent);

}
void loop() {
    webSocket.loop();
    static bool isPressed = false;
    if (!isPressed && digitalRead(BTN) == 0) { //Nhấn nút nhấn GPIO0
      isPressed = true;
      webSocket.sendTXT("BTN_PRESSED");
    } else if (isPressed && digitalRead(BTN)) { //Nhả nút nhấn GPIO0
      isPressed = false;
      webSocket.sendTXT("BTN_RELEASE");
    }
}
