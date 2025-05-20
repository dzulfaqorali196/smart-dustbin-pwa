//IoT-Based Smart Garbage Dustbin Monitoring System With GPS Location | SMS Alert

#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <TinyGPS++.h>
#include <Wire.h>

// WiFiManager mungkin memerlukan instalasi tambahan, jadi kita komen jika belum diinstal
// #include <WiFiManager.h>

// Inisialisasi software serial untuk GSM (D3, D4)
SoftwareSerial gsmSerial(D3, D4); // RX, TX untuk GSM Module

// Inisialisasi software serial untuk GPS (D7, D8)
SoftwareSerial gpsSerial(D7, D8); // RX, TX untuk GPS Module
TinyGPSPlus gps; // Objek TinyGPS++

// Konfigurasi Pin untuk LCD I2C:
// SDA: D2
// SCL: D1
// Alamat I2C LCD: 0x27 (standar)
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pin untuk sensor ultrasonik
const int trigPin = D6;
const int echoPin = D5;
long duration;
int distance;
float level;

// Data WiFi yang sudah ada
const char *ssid = "Harry";
const char *password = "harry123";

// Tambahan untuk mode AP jika koneksi gagal
const char* ap_ssid = "SmartDustbin_AP";
const char* ap_password = "dustbin123";

void send_event(const char *event);
const char *host = "maker.ifttt.com";
const char *privateKey = "hUAAAz0AVvc6-NW1UmqWXXv6VQWmpiGFxx3sV5rnaM9";

// Ganti server dengan ESP8266WebServer untuk fungsi yang lebih lengkap
ESP8266WebServer server(80);

// Variabel untuk status koneksi
bool wifiConnected = false;

// Tambahkan array untuk menyimpan riwayat level
#define HISTORY_SIZE 10
float levelHistory[HISTORY_SIZE];
int historyIndex = 0;

// Tambahan variabel untuk pengelolaan pengiriman notifikasi
unsigned long lastNotificationTime = 0;
const unsigned long notificationInterval = 300000; // 5 menit

// Debug flag untuk GSM
#define DEBUG_GSM true

// Variabel untuk GPS
float gpsLat = -6.889852; // Nilai default (ITB Bandung)
float gpsLng = 107.609968; // Nilai default
bool gpsValid = false;
unsigned long lastGPSUpdate = 0;
const unsigned long GPS_UPDATE_INTERVAL = 10000; // Cek GPS setiap 10 detik

void setup() {
  // Inisialisasi I2C untuk LCD
  Wire.begin(D2, D1); // SDA=D2, SCL=D1
  
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  Serial.begin(9600); // Untuk debugging
  gsmSerial.begin(9600); // Inisialisasi komunikasi serial untuk GSM
  gpsSerial.begin(9600); // Inisialisasi komunikasi serial untuk GPS
  
  Serial.println("IoT-Based Smart Garbage Dustbin Monitoring System");
  
  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.clear(); // Bersihkan LCD di awal
  
  lcd.setCursor(0, 0);
  lcd.print(" Smart ");
  lcd.setCursor(0, 1);
  lcd.print("      Dustbin");
  delay(2000);
  
  // Inisialisasi riwayat level
  for (int i = 0; i < HISTORY_SIZE; i++) {
    levelHistory[i] = 0;
  }
  
  // Test GPS Module
  testGPS();
  
  // Test GSM Module
  testGSM();
  
  // Setup WiFi dengan pengaturan lebih baik
  setupWifi();
  
  // Konfigurasi server web
  setupWebServer();
  
  Serial.println("Server started");
  
  // Tampilkan IP address di LCD
  displayIP();
}

// Fungsi untuk menguji modul GPS
void testGPS() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Testing GPS...");
  
  Serial.println("Testing GPS module...");
  
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
          lcd.print("GPS OK!");
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
  lcd.print("Using Default Loc");
  Serial.println("GPS not detected, using default location");
  delay(2000);
  lcd.clear();
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
}

// Fungsi untuk menguji modul GSM
void testGSM() {
  if (!DEBUG_GSM) return;
  
  // Simpan nilai level LCD saat ini
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Testing GSM...");
  
  Serial.println("Testing GSM module...");
  
  // Kirim perintah AT dasar untuk memeriksa GSM
  gsmSerial.println("AT");
  delay(1000);
  String response = "";
  
  while (gsmSerial.available()) {
    char c = gsmSerial.read();
    response += c;
  }
  
  lcd.setCursor(0, 1);
  if (response.indexOf("OK") != -1) {
    lcd.print("GSM Module OK!");
    Serial.println("GSM Module OK!");
  } else {
    lcd.print("GSM Not Found!");
    Serial.println("GSM Module Not Responding!");
  }
  
  delay(2000);
  lcd.clear();
  // Setelah pengujian GSM, kembalikan ke tampilan level
  updateLCD();
}

void setupWifi() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  
  // Opsi 1: Menggunakan konfigurasi manual (yang sudah ada)
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
  // Setelah setup WiFi, kembalikan ke tampilan level
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
  html += "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'>";
  html += "<style>";
  html += "html { font-family: Arial; display: block; margin: 0px auto; text-align: center; color: #333333; background-color: #f3f3ee; }";
  html += "body { margin-top: 50px; }";
  html += "h1 { margin: 30px auto 30px; font-size: 28px; text-align: center; }";
  html += ".container { display: flex; flex-direction: column; align-items: center; padding: 20px; }";
  html += ".card { background-color: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 90%; max-width: 500px; margin-bottom: 20px; padding: 20px; }";
  html += ".level-display { font-size: 60px; font-weight: bold; color: #3498db; }";
  html += ".progress-bar { background-color: #ecf0f1; border-radius: 13px; height: 26px; padding: 3px; width: 100%; margin: 15px 0; }";
  html += ".progress { background-color: #3498db; width: " + String(level) + "%; height: 20px; border-radius: 10px; }";
  html += ".status { margin: 10px 0; font-size: 18px; }";
  html += ".action-btn { background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px; }";
  html += ".info { color: #7f8c8d; font-size: 14px; margin-top: 5px; }";
  html += ".footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; }";
  html += ".map-container { width: 100%; height: 300px; margin-top: 10px; border-radius: 8px; overflow: hidden; }";
  html += "</style>";
  
  // Tambahkan auto-refresh
  html += "<meta http-equiv='refresh' content='5'>";
  
  // Tambahkan CSS untuk ikon status
  html += "<style>";
  html += ".status-icon { font-size: 100px; margin: 20px 0; }";
  html += ".status-ok { color: #2ecc71; }";
  html += ".status-warning { color: #f39c12; }";
  html += ".status-danger { color: #e74c3c; }";
  html += "</style>";

  // Ganti bagian Google Maps API dengan OpenStreetMap menggunakan Leaflet.js
  html += "<link rel='stylesheet' href='https://unpkg.com/leaflet@1.7.1/dist/leaflet.css' />";
  html += "<script src='https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'></script>";
  html += "<script>";
  html += "function initMap() {";
  html += "  var map = L.map('map').setView([" + String(gpsLat, 6) + ", " + String(gpsLng, 6) + "], 15);";
  html += "  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {";
  html += "    attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'";
  html += "  }).addTo(map);";
  html += "  var marker = L.marker([" + String(gpsLat, 6) + ", " + String(gpsLng, 6) + "]).addTo(map);";
  html += "  marker.bindPopup('Smart Dustbin Location').openPopup();";
  html += "}";
  html += "window.onload = function() {";
  html += "  initMap();";
  html += "};";
  html += "</script>";
  
  html += "</head>";
  html += "<body>";
  html += "<div class='container'>";
  
  html += "<h1><i class='fas fa-trash'></i> Smart Dustbin Monitor</h1>";
  
  // Card untuk level
  html += "<div class='card'>";
  
  // Status ikon berdasarkan level
  html += "<div class='status-icon ";
  if (level < 50) {
    html += "status-ok'><i class='fas fa-check-circle'></i>";
  } else if (level < 80) {
    html += "status-warning'><i class='fas fa-exclamation-triangle'></i>";
  } else {
    html += "status-danger'><i class='fas fa-exclamation-circle'></i>";
  }
  html += "</div>";
  
  html += "<div class='level-display'>" + String((int)level) + "<span style='font-size: 30px;'>%</span></div>";
  html += "<div class='progress-bar'><div class='progress'></div></div>";
  
  // Status berdasarkan level
  html += "<div class='status'>";
  if (level < 50) {
    html += "Status: <span style='color: #2ecc71;'>Good</span>";
  } else if (level < 80) {
    html += "Status: <span style='color: #f39c12;'>Warning</span>";
  } else {
    html += "Status: <span style='color: #e74c3c;'>Full - Please Empty</span>";
  }
  html += "</div>";
  
  // Tambahkan jarak mentah
  html += "<div class='info'>Distance: " + String(distance) + " cm</div>";
  
  html += "</div>";
  
  // Card untuk lokasi dengan peta
  html += "<div class='card'>";
  html += "<h2><i class='fas fa-map-marker-alt'></i> Location</h2>";
  html += "<div id='map' class='map-container'></div>";
  html += "<div class='info'>Coordinates: " + String(gpsLat, 6) + ", " + String(gpsLng, 6) + "</div>";
  html += "<div class='info'>GPS Status: " + String(gpsValid ? "Valid GPS Signal" : "Using Default Location") + "</div>";
  html += "<a href='https://www.google.com/maps?q=" + String(gpsLat, 6) + "," + String(gpsLng, 6) + "&z=17&hl=en' target='_blank' class='action-btn'>";
  html += "<i class='fas fa-external-link-alt'></i> Open in Google Maps";
  html += "</a>";
  html += "</div>";
  
  // Card untuk pemeliharaan
  html += "<div class='card'>";
  html += "<h2>Maintenance</h2>";
  html += "<button class='action-btn' onclick=\"window.location.href='/reset'\">Reset System</button>";
  
  // Display last notification time
  String lastNotifTime = "Never";
  if (lastNotificationTime > 0) {
    unsigned long elapsed = (millis() - lastNotificationTime) / 1000; // seconds
    if (elapsed < 60) {
      lastNotifTime = String(elapsed) + " seconds ago";
    } else if (elapsed < 3600) {
      lastNotifTime = String(elapsed / 60) + " minutes ago";
    } else {
      lastNotifTime = String(elapsed / 3600) + " hours ago";
    }
  }
  html += "<div class='info'>Last Notification: <span id='lastNotif'>" + lastNotifTime + "</span></div>";
  html += "</div>";
  
  // Card untuk informasi koneksi
  html += "<div class='card'>";
  html += "<h2>Connection Info</h2>";
  html += "<div class='info'>WiFi SSID: " + String(WiFi.SSID()) + "</div>";
  html += "<div class='info'>Signal Strength: " + String(WiFi.RSSI()) + " dBm</div>";
  html += "<div class='info'>IP Address: " + WiFi.localIP().toString() + "</div>";
  html += "</div>";
  
  // Footer
  html += "<div class='footer'>";
  html += "Smart Dustbin IoT System | Refresh every 5 seconds";
  html += "</div>";
  
  html += "</div>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleData() {
  // Endpoint untuk mendapatkan data sebagai JSON (untuk aplikasi)
  String json = "{";
  json += "\"level\":" + String(level) + ",";
  json += "\"distance\":" + String(distance) + ",";
  json += "\"status\":\"" + String(level >= 80 ? "full" : (level >= 50 ? "warning" : "ok")) + "\",";
  json += "\"location\":{\"lat\":" + String(gpsLat, 6) + ",\"lng\":" + String(gpsLng, 6) + "},";
  json += "\"gpsValid\":" + String(gpsValid ? "true" : "false") + ",";
  json += "\"last_notification\":" + String(lastNotificationTime > 0 ? (millis() - lastNotificationTime) / 1000 : 0);
  json += "}";
  
  server.send(200, "application/json", json);
}

void handleReset() {
  // Reset sistem
  level = 0;
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

// Fungsi untuk memperbarui tampilan LCD (hanya menampilkan level)
void updateLCD() {
  // Bersihkan baris pertama dan tulis judul
  lcd.setCursor(0, 0);
  lcd.print(" Smart Dustbin  "); // Spasi di akhir untuk membersihkan karakter yang mungkin tersisa
  
  // Bersihkan baris kedua dan tulis level
  lcd.setCursor(0, 1);
  lcd.print(" Level: ");
  
  // Bersihkan area nilai dengan spasi
  lcd.setCursor(8, 1);
  lcd.print("        "); // 8 spasi untuk membersihkan area nilai
  
  // Tulis nilai level yang diformat dengan benar
  lcd.setCursor(8, 1);
  
  // Format level tanpa desimal (cukup sebagai integer)
  int levelInt = (int)level;
  
  // Penyesuaian berdasarkan jumlah digit
  if (levelInt < 10) {
    lcd.print(levelInt);
    lcd.print("%   "); // Tambahan spasi untuk membersihkan
  } else if (levelInt < 100) {
    lcd.print(levelInt);
    lcd.print("%  "); // Tambahan spasi untuk membersihkan
  } else {
    lcd.print("100%"); // Maksimum
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
  updateLCD(); // Kembali ke tampilan level
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
      // Kembalikan tampilan level setelah koneksi
      updateLCD();
    } else {
      wifiConnected = false;
      // Kembalikan tampilan level meskipun koneksi gagal
      updateLCD();
    }
  }
  
  // Pengukuran sensor
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.0340 / 2;
  
  Serial.println("Distance: " + String(distance) + " cm");
  
  // Hitung level dengan batasan yang jelas
  level = ((17 - distance) / 17.0) * 100;
  
  // Batasi nilai level antara 0 dan 100
  if (level < 0) level = 0;
  if (level > 100) level = 100;
  
  Serial.println("Level: " + String(level) + "%");
  
  // Simpan riwayat level
  levelHistory[historyIndex] = level;
  historyIndex = (historyIndex + 1) % HISTORY_SIZE;
  
  // Update LCD dengan format yang benar
  updateLCD();
  
  // Periksa kondisi untuk notifikasi
  static bool dustbinWasFull = false;
  
  if (level >= 80) {
    // Jika belum penuh sebelumnya atau sudah waktunya untuk notifikasi lagi
    if (!dustbinWasFull || (millis() - lastNotificationTime > notificationInterval)) {
      // Tidak perlu mengubah LCD, hanya kirim notifikasi
      
      // Kirim notifikasi
      SendMessage();
      send_event("jar_event");
      
      // Update status dan waktu
      dustbinWasFull = true;
      lastNotificationTime = millis();
    }
  } else if (level < 70) {
    // Reset status penuh jika level turun cukup jauh
    dustbinWasFull = false;
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

void send_event(const char *event) {
  if (!wifiConnected) {
    Serial.println("Cannot send event: WiFi not connected");
    return;
  }
  
  Serial.print("Connecting to ");
  Serial.println(host);
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 80;
  if (!client.connect(host, httpPort)) {
    Serial.println("Connection failed");
    return;
  }
  // We now create a URI for the request
  String url = "/trigger/";
  url += event;
  url += "/with/key/";
  url += privateKey;
  Serial.print("Requesting URL: ");
  Serial.println(url);
  // This will send the request to the server
  client.print(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
  
  while (client.connected()) {
    if (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    } else {
      // No data yet, wait a bit
      delay(50);
    };
  }
  
  Serial.println();
  Serial.println("closing connection");
  client.stop();
}

// Fungsi untuk debug GSM
String readGSMResponse() {
  String response = "";
  long timeout = millis() + 3000; // 3 detik timeout
  
  while (millis() < timeout) {
    if (gsmSerial.available()) {
      char c = gsmSerial.read();
      response += c;
      Serial.write(c); // Echo ke Serial Monitor
    }
  }
  
  return response;
}

void SendMessage() {
  Serial.println("=== SENDING SMS - DUSTBIN FULL ===");
  
  // Tidak lagi mengubah LCD, tampilan level tetap
  
  // Inisialisasi GSM Module dalam mode SMS
  gsmSerial.println("AT+CMGF=1");
  delay(1000);
  if (DEBUG_GSM) readGSMResponse();
  
  // Nomor telepon tujuan
  gsmSerial.println("AT+CMGS=\"+6281275722872\"\r");
  delay(1000);
  if (DEBUG_GSM) readGSMResponse();
  
  // Kirim pesan dengan koordinat GPS aktual
  gsmSerial.print("Dustbin Is Full Plz Remove Dustbin  https://www.google.com/maps?q=" + 
                String(gpsLat, 6) + "," + String(gpsLng, 6) + "&z=17&hl=en");
  delay(100);
  
  // Kirim CTRL+Z untuk mengakhiri pesan
  gsmSerial.write(26); // ASCII karakter untuk CTRL+Z
  delay(2000);        // Tunggu lebih lama untuk respons
  
  if (DEBUG_GSM) {
    String response = readGSMResponse();
    
    // Periksa apakah pesan berhasil terkirim
    if (response.indexOf("+CMGS") > -1) {
      Serial.println("SMS sent successfully!");
      // Tidak perlu mengubah LCD
    } else {
      Serial.println("Failed to send SMS!");
      // Tidak perlu mengubah LCD
    }
  }
}