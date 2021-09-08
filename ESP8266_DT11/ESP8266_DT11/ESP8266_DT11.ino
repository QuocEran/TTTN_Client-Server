#include <DHT.h>            // Khai báo sử dụng thư viện DHT
#include <ESP8266WiFi.h>    // Khai báo sử dụng thư viện ESP8266WiFi.h để thiết lập chế độ HTTP client cho ESP8266
#define DHTPIN 4            // Chân dữ liệu của DHT11 kết nối với GPIO4 của ESP8266
#define DHTTYPE DHT11       // Loại DHT được sử dụng

DHT dht(DHTPIN, DHTTYPE);
WiFiClient client;
const char* ssid = "Phong 202 CYBERHOME";      // Tên mạng Wifi được chỉ định sẽ kết nối (SSID)
const char* password = "445566202";  // Password của mạng Wifi được chỉ định sẽ kết nối
const char* server = "192.168.202.106";     // Địa chỉ IP của máy khi truy cập cùng mạng WiFi
const int port = 8080;                    // Port của server đã mở
const int sendingInternval = 2000;    // Biến cập nhật dữ liệu sau mỗi 2s


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  dht.begin();                            // Khởi tạo DHT1 11 để truyền nhận dữ liệu
  Serial.println("Connecting");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  Serial.print("\r\nWiFi connected, IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // put your main code here, to run repeatedly:
// Đọc gía trị nhiệt độ (độ C), độ ẩm. Xuất ra thông báo lỗi và thoát ra nếu dữ liệu không phải là số
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
 if (isnan(temp) || isnan(humi)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  if (client.connect(server, port)) {       // Khởi tạo kết nối đến server thông qua IP và PORT đã mở
  //---------------------------------------------------------------------------------------
    String req_uri = "/update?temp=" + String(temp, 1) + "&humd=" + String(humi, 1);
    client.print("GET " + req_uri + " HTTP/1.1\n" + "Host: "+ server + ":8080" +"\n" + "Connection: close\n" + "Content-Length: 0\n" +"\n\n");   
  //---------------------------------------------------------------------------------------
  // temp, humi chuyển từ định dạng float sang định dạng string và in ra màn hình serial      
  // terminal trên Arduino.
    Serial.printf("Nhiet do %s - Do am %s\r\n", String(temp, 1).c_str(), String(humi, 1).c_str());
  }
  client.stop();                          // Ngắt kết nối đến server
  delay(sendingInternval);
}
