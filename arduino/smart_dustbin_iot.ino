#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SoftwareSerial.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Konfigurasi WiFi
const char *ssid = "testarduino";
const char *password = "dzulganteng";

// API Key (harus sama dengan yang di server)
const char *apiKey = "smart-dustbin-secret-key";

// ID tempat sampah (sesuaikan dengan ID di database)
const char *binId = "1"; 

// URL API untuk update data - sesuaikan dengan URL aplikasi Anda
const char *serverUrl = "https://smart-dustbin-pwa.vercel.app/api/bins/update";

// Tambahan untuk mode AP jika koneksi gagal
const char* ap_ssid = "SmartDustbin_AP";
const char* ap_password = "dustbin123";

// Konfigurasi Pin untuk LCD I2C
// SDA: D2, SCL: D1
LiquidCrystal_I2C lcd(0x27, 16, 2); // Alamat I2C: 0x27, 16 karakter, 2 baris

// Pin untuk sensor ultrasonik
const int trigPin = D6;
const int echoPin = D5;
long duration;
int distance;
float fillLevel;

// Konfigurasi pin GPS (RX, TX)
static const int RXPin = D7, TXPin = D8; // RX, TX untuk GPS Module
static const uint32_t GPSBaud = 9600;

// Inisialisasi software serial untuk GPS
SoftwareSerial gpsSerial(RXPin, TXPin);
TinyGPSPlus gps; // Objek TinyGPS++

// Variabel untuk GPS
float gpsLat = 0.0;
float gpsLng = 0.0;
bool gpsValid = false;
unsigned long lastGPSUpdate = 0;
const unsigned long GPS_UPDATE_INTERVAL = 10000; // Cek GPS setiap 10 detik

// Variabel untuk waktu
unsigned long lastUpdateTime = 0;
const long updateInterval = 60000; // 60 detik antara pengiriman data

// Variabel untuk status koneksi
bool wifiConnected = false;

// Web server untuk melihat status
ESP8266WebServer server(80);

// Tambahkan array untuk menyimpan riwayat level
#define HISTORY_SIZE 10
float levelHistory[HISTORY_SIZE];
int historyIndex = 0;

// Variabel untuk tinggi maksimum tempat sampah (dalam cm)
const int maxDistance = 30; // Sesuaikan dengan tinggi tempat sampah Anda

void setup() {
  // Inisialisasi I2C untuk LCD
  Wire.begin(D2, D1); // SDA=D2, SCL=D1
  
  // Inisialisasi Serial untuk debugging
  Serial.begin(115200);
  
  Serial.println("Smart Dustbin IoT System");
  
  // Inisialisasi pin sensor ultrasonik
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(" Smart Dustbin");
  lcd.setCursor(0, 1);
  lcd.print("  Starting...");
  delay(2000);
  
  // Inisialisasi riwayat level
  for (int i = 0; i < HISTORY_SIZE; i++) {
    levelHistory[i] = 0;
  }
  
  // Inisialisasi GPS
  gpsSerial.begin(GPSBaud);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Initializing");
  lcd.setCursor(0, 1);
  lcd.print("GPS Module...");
  Serial.println("Initializing GPS module...");
  
  // Test GPS selama 5 detik
  testGPS();
  
  // Setup WiFi
  setupWifi();
  
  // Konfigurasi server web
  setupWebServer();
  
  Serial.println("Server started");
  
  // Tampilkan IP address di LCD
  displayIP();
}

// Fungsi untuk menguji modul GPS
void testGPS() {
  // Coba mendapatkan data GPS selama 5 detik
  unsigned long startTime = millis();
  while (millis() - startTime < 5000) {
    while (gpsSerial.available() > 0) {
      if (gps.encode(gpsSerial.read())) {
        if (gps.location.isValid()) {
          gpsLat = gps.location.lat();
          gpsLng = gps.location.lng();
          gpsValid = true;
          
          lcd.setCursor(0, 1);
          lcd.print("GPS OK!        ");
          Serial.println("GPS Module OK!");
          Serial.print("Lat: ");
          Serial.print(gpsLat, 6);
          Serial.print(", Lng: ");
          Serial.println(gpsLng, 6);
          delay(2000);
          return;
        }
      }
    }
    delay(100);
  }
  
  lcd.setCursor(0, 1);
  lcd.print("No GPS Signal  ");
  Serial.println("GPS not detected, using default location");
  delay(2000);
}

// Fungsi untuk membaca data GPS
void readGPS() {
  // Hanya update GPS pada interval yang ditentukan untuk menghemat resources
  if (millis() - lastGPSUpdate < GPS_UPDATE_INTERVAL) {
    return;
  }
  
  lastGPSUpdate = millis();
  bool newData = false;
  
  // Coba baca data GPS selama 1 detik
  unsigned long startTime = millis();
  while (millis() - startTime < 1000) {
    while (gpsSerial.available() > 0) {
      char c = gpsSerial.read();
      if (gps.encode(c)) {
        newData = true;
      }
    }
  }
  
  if (newData && gps.location.isValid()) {
    gpsLat = gps.location.lat();
    gpsLng = gps.location.lng();
    gpsValid = true;
    
    Serial.print("Updated GPS Location: ");
    Serial.print(gpsLat, 6);
    Serial.print(", ");
    Serial.println(gpsLng, 6);
  }
}

void setupWifi() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  // Tunggu koneksi dengan timeout
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(attempts % 16, 1);
    lcd.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("");
    Serial.println("Successfully connected to WiFi.");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    // Setup mDNS responder
    if (MDNS.begin("smartdustbin")) {
      Serial.println("MDNS responder started");
      Serial.println("You can now access at http://smartdustbin.local");
    }
    
    // Tampilkan IP di LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
  } else {
    // Jika gagal terhubung, buat Access Point
    Serial.println("Failed to connect to WiFi. Starting AP Mode...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("AP Mode Active");
    lcd.setCursor(0, 1);
    lcd.print(ap_ssid);
    
    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());
  }
  
  delay(2000); // Tampilkan info koneksi
  lcd.clear();
  updateLCD();
}

// Fungsi untuk menampilkan IP di LCD
void displayIP() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("IP Address:");
  lcd.setCursor(0, 1);
  
  if (wifiConnected) {
    String ipStr = WiFi.localIP().toString();
    lcd.print(ipStr);
  } else {
    lcd.print(WiFi.softAPIP().toString());
  }
  
  delay(3000);
  lcd.clear();
  updateLCD();
}

void setupWebServer() {
  // Tentukan handler untuk rute yang berbeda
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.on("/reset", handleReset);
  server.onNotFound(handleNotFound);
  
  // Mulai server
  server.begin();
}

void handleRoot() {
  String html = "<!DOCTYPE HTML>";
  html += "<html>";
  html += "<head>";
  html += "<title>Smart Dustbin Monitor</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>";
  html += "html { font-family: Arial; display: block; margin: 0px auto; text-align: center; color: #333333; background-color: #f3f3ee; }";
  html += "body { margin-top: 50px; }";
  html += "h1 { margin: 30px auto 30px; font-size: 28px; }";
  html += ".container { display: flex; flex-direction: column; align-items: center; padding: 20px; }";
  html += ".card { background-color: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 90%; max-width: 500px; margin-bottom: 20px; padding: 20px; }";
  html += ".level-display { font-size: 60px; font-weight: bold; color: #3498db; }";
  html += ".progress-bar { background-color: #ecf0f1; border-radius: 13px; height: 26px; padding: 3px; width: 100%; margin: 15px 0; }";
  html += ".progress { background-color: #3498db; width: " + String(fillLevel) + "%; height: 20px; border-radius: 10px; }";
  html += ".status { margin: 10px 0; font-size: 18px; }";
  html += ".action-btn { background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px; }";
  html += ".info { color: #7f8c8d; font-size: 14px; margin-top: 5px; }";
  html += ".footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; }";
  html += "</style>";
  
  // Tambahkan auto-refresh
  html += "<meta http-equiv='refresh' content='5'>";
  
  html += "</head>";
  html += "<body>";
  html += "<div class='container'>";
  
  html += "<h1>Smart Dustbin Monitor</h1>";
  
  // Card untuk level
  html += "<div class='card'>";
  html += "<div class='level-display'>" + String((int)fillLevel) + "<span style='font-size: 30px;'>%</span></div>";
  html += "<div class='progress-bar'><div class='progress'></div></div>";
  
  // Status berdasarkan level
  html += "<div class='status'>";
  if (fillLevel < 50) {
    html += "Status: <span style='color: #2ecc71;'>Good</span>";
  } else if (fillLevel < 80) {
    html += "Status: <span style='color: #f39c12;'>Warning</span>";
  } else {
    html += "Status: <span style='color: #e74c3c;'>Full - Please Empty</span>";
  }
  html += "</div>";
  
  // Tambahkan jarak mentah
  html += "<div class='info'>Distance: " + String(distance) + " cm</div>";
  
  html += "</div>";
  
  // Card untuk lokasi GPS
  html += "<div class='card'>";
  html += "<h2>Location</h2>";
  html += "<div class='info'>Latitude: " + String(gpsLat, 6) + "</div>";
  html += "<div class='info'>Longitude: " + String(gpsLng, 6) + "</div>";
  html += "<div class='info'>GPS Status: " + String(gpsValid ? "Valid GPS Signal" : "No GPS Signal") + "</div>";
  html += "</div>";
  
  // Card untuk informasi koneksi
  html += "<div class='card'>";
  html += "<h2>Connection Info</h2>";
  html += "<div class='info'>WiFi SSID: " + String(WiFi.SSID()) + "</div>";
  html += "<div class='info'>Signal Strength: " + String(WiFi.RSSI()) + " dBm</div>";
  html += "<div class='info'>IP Address: " + WiFi.localIP().toString() + "</div>";
  html += "</div>";
  
  // Card untuk reset
  html += "<div class='card'>";
  html += "<h2>Maintenance</h2>";
  html += "<button class='action-btn' onclick=\"window.location.href='/reset'\">Reset System</button>";
  html += "</div>";
  
  // Footer
  html += "<div class='footer'>";
  html += "Smart Dustbin IoT System | Last Update: " + String(lastUpdateTime > 0 ? (millis() - lastUpdateTime) / 1000 : 0) + " seconds ago";
  html += "</div>";
  
  html += "</div>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleData() {
  // Endpoint untuk mendapatkan data sebagai JSON (untuk aplikasi)
  String json = "{";
  json += "\"fill_level\":" + String(fillLevel) + ",";
  json += "\"distance\":" + String(distance) + ",";
  json += "\"latitude\":" + String(gpsLat, 6) + ",";
  json += "\"longitude\":" + String(gpsLng, 6) + ",";
  json += "\"gps_valid\":" + String(gpsValid ? "true" : "false") + ",";
  json += "\"last_update\":" + String(lastUpdateTime > 0 ? (millis() - lastUpdateTime) / 1000 : 0);
  json += "}";
  
  server.send(200, "application/json", json);
}

void handleReset() {
  // Reset sistem
  fillLevel = 0;
  for (int i = 0; i < HISTORY_SIZE; i++) {
    levelHistory[i] = 0;
  }
  
  server.send(200, "text/plain", "System Reset Complete");
  delay(1000);
  ESP.restart();
}

void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  
  server.send(404, "text/plain", message);
}

// Fungsi untuk memperbarui tampilan LCD
void updateLCD() {
  lcd.setCursor(0, 0);
  lcd.print(" Smart Dustbin  ");
  
  lcd.setCursor(0, 1);
  lcd.print(" Level: ");
  
  // Bersihkan area nilai dengan spasi
  lcd.setCursor(8, 1);
  lcd.print("        ");
  
  // Tulis nilai level yang diformat dengan benar
  lcd.setCursor(8, 1);
  
  // Format level tanpa desimal
  int levelInt = (int)fillLevel;
  
  // Penyesuaian berdasarkan jumlah digit
  if (levelInt < 10) {
    lcd.print(levelInt);
    lcd.print("%   ");
  } else if (levelInt < 100) {
    lcd.print(levelInt);
    lcd.print("%  ");
  } else {
    lcd.print("100%");
  }
}

// Fungsi untuk menampilkan koordinat GPS di LCD selama beberapa detik
void displayGPSInfo() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("GPS Location:");
  
  lcd.setCursor(0, 1);
  if (gpsValid) {
    // Format singkat untuk layar 16x2
    lcd.print(String(gpsLat, 4) + "," + String(gpsLng, 4));
  } else {
    lcd.print("No GPS Signal");
  }
  
  delay(3000);
  lcd.clear();
  updateLCD();
}

// Fungsi untuk mengirim data ke server
void sendDataToServer() {
  // Cek apakah WiFi terhubung
  if (!wifiConnected) {
    Serial.println("Cannot send data: WiFi not connected");
    return;
  }
  
  // Buat client HTTP
  WiFiClient client;
  HTTPClient http;
  
  Serial.print("Sending data to server: ");
  Serial.println(serverUrl);
  
  // Memulai koneksi HTTP
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Buat JSON payload dengan ArduinoJson
  StaticJsonDocument<200> doc;
  doc["bin_id"] = binId;
  doc["fill_level"] = (int)fillLevel;
  doc["api_key"] = apiKey;
  
  // Tambahkan koordinat GPS jika valid
  if (gpsValid) {
    doc["latitude"] = gpsLat;
    doc["longitude"] = gpsLng;
  }
  
  // Serialize JSON ke string
  String payload;
  serializeJson(doc, payload);
  
  // Debug: tampilkan payload
  Serial.print("Payload: ");
  Serial.println(payload);
  
  // Kirim permintaan HTTP POST
  int httpResponseCode = http.POST(payload);
  
  // Tampilkan pesan di LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
    
    lcd.print("Data Sent");
    lcd.setCursor(0, 1);
    lcd.print("Code: " + String(httpResponseCode));
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
    
    lcd.print("Send Failed");
    lcd.setCursor(0, 1);
    lcd.print("Error: " + String(httpResponseCode));
  }
  
  http.end();
  delay(2000);
  lcd.clear();
  updateLCD();
}

void loop() {
  // Handle client requests
  server.handleClient();
  
  // Baca data GPS
  readGPS();
  
  // Periksa koneksi WiFi
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    // Koneksi WiFi terputus, coba hubungkan kembali
    Serial.println("WiFi connection lost. Reconnecting...");
    WiFi.begin(ssid, password);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Reconnect");
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
      delay(500);
      Serial.print(".");
      lcd.setCursor(attempts % 16, 1);
      lcd.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
      Serial.println("WiFi reconnected");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("WiFi Connected!");
      delay(1000);
      updateLCD();
    } else {
      wifiConnected = false;
      updateLCD();
    }
  }
  
  // Pengukuran sensor ultrasonik
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.0340 / 2;
  
  Serial.println("Distance: " + String(distance) + " cm");
  
  // Hitung level dengan batasan yang jelas
  fillLevel = ((maxDistance - distance) / (float)maxDistance) * 100;
  
  // Batasi nilai level antara 0 dan 100
  if (fillLevel < 0) fillLevel = 0;
  if (fillLevel > 100) fillLevel = 100;
  
  Serial.println("Fill Level: " + String(fillLevel) + "%");
  
  // Simpan riwayat level
  levelHistory[historyIndex] = fillLevel;
  historyIndex = (historyIndex + 1) % HISTORY_SIZE;
  
  // Update LCD dengan format yang benar
  updateLCD();
  
  // Kirim data ke server secara berkala
  unsigned long currentMillis = millis();
  if (currentMillis - lastUpdateTime >= updateInterval) {
    lastUpdateTime = currentMillis;
    sendDataToServer();
  }
  
  // Setiap 30 detik, tampilkan informasi GPS selama 3 detik
  static unsigned long lastGPSDisplayTime = 0;
  if (millis() - lastGPSDisplayTime > 30000) { // 30 detik
    lastGPSDisplayTime = millis();
    displayGPSInfo();
  }
  
  // Delay untuk stabilitas
  delay(1000);
} 