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
const char *ssid = "ITB Hotspot";
const char *password = "";
const char *apiKey = "smart-dustbin-secret-key";
const char *binId = "1";
const char *serverUrl = "http://192.168.8.244:3000/api/bins/update";
const char *ap_ssid = "SmartDustbin_AP";
const char *ap_password = "dustbin123";

// Use a smaller buffer size for the web server
ESP8266WebServer server(80);

// LCD Configuration
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pin Configuration
const int trigPin = D6;
const int echoPin = D5;
long duration;
int distance;
float fillLevel;

// GPS Configuration
static const int RXPin = D7, TXPin = D8;
static const uint32_t GPSBaud = 9600;
SoftwareSerial gpsSerial(RXPin, TXPin);
TinyGPSPlus gps;

// GPS variables
float gpsLat = 0.0;
float gpsLng = 0.0;
bool gpsValid = false;
unsigned long lastGPSUpdate = 0;
const unsigned long GPS_UPDATE_INTERVAL = 10000;

// Timing variables
unsigned long lastUpdateTime = 0;
const long updateInterval = 60000;

// Connection status
bool wifiConnected = false;

// 4. REDUCE ARRAY SIZE
#define HISTORY_SIZE 5  // Reduced from 10 to 5
float levelHistory[HISTORY_SIZE];
int historyIndex = 0;

const int maxDistance = 30;

// Pre-allocate JsonDocument to a fixed size
StaticJsonDocument<200> jsonDoc;

void setup() {
  Wire.begin(D2, D1);
  Serial.begin(115200);
  
  // Print startup message
  Serial.println(F("Smart Dustbin IoT System"));  // F() macro stores string in flash memory
  
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F(" Smart Dustbin"));  // Use F() macro
  lcd.setCursor(0, 1);
  lcd.print(F("  Starting..."));
  delay(1000);  // Reduced from 2000ms
  
  memset(levelHistory, 0, sizeof(levelHistory));
  
  // Initialize GPS
  gpsSerial.begin(GPSBaud);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Initializing"));
  lcd.setCursor(0, 1);
  lcd.print(F("GPS Module..."));
  
  // Test GPS with shorter timeout
  testGPS();
  
  // Setup WiFi and WebServer
  setupWifi();
  setupWebServer();
  
  // Display IP address
  displayIP();
}

void testGPS() {
  unsigned long startTime = millis();
  while (millis() - startTime < 3000) {  // Reduced from 5000ms
    while (gpsSerial.available() > 0) {
      if (gps.encode(gpsSerial.read())) {
        if (gps.location.isValid()) {
          gpsLat = gps.location.lat();
          gpsLng = gps.location.lng();
          gpsValid = true;
          
          lcd.setCursor(0, 1);
          lcd.print(F("GPS OK!        "));
          delay(1000);  // Reduced from 2000ms
          return;
        }
      }
    }
    delay(50);  // Reduced from 100ms
  }
  
  lcd.setCursor(0, 1);
  lcd.print(F("No GPS Signal  "));
  delay(1000);  // Reduced from 2000ms
}

void readGPS() {
  if (millis() - lastGPSUpdate < GPS_UPDATE_INTERVAL) {
    return;
  }
  
  lastGPSUpdate = millis();
  bool newData = false;
  
  // Shorter read time
  unsigned long startTime = millis();
  while (millis() - startTime < 500) {  // Reduced from 1000ms
    while (gpsSerial.available() > 0) {
      if (gps.encode(gpsSerial.read())) {
        newData = true;
      }
    }
  }
  
  if (newData && gps.location.isValid()) {
    gpsLat = gps.location.lat();
    gpsLng = gps.location.lng();
    gpsValid = true;
  }
}

void setupWifi() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Connecting WiFi"));
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {  // Reduced from 20
    delay(500);
    lcd.setCursor(attempts % 16, 1);
    lcd.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    
    // Setup mDNS with shorter name
    MDNS.begin("sdustbin");  // Shorter name
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("WiFi Connected!"));
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
  } else {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("AP Mode Active"));
    lcd.setCursor(0, 1);
    lcd.print(ap_ssid);
  }
  
  delay(1000);  // Reduced from 2000ms
  lcd.clear();
  updateLCD();
}

void displayIP() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("IP Address:"));
  lcd.setCursor(0, 1);
  
  if (wifiConnected) {
    lcd.print(WiFi.localIP().toString());
  } else {
    lcd.print(WiFi.softAPIP().toString());
  }
  
  delay(2000);  // Reduced from 3000ms
  lcd.clear();
  updateLCD();
}

void setupWebServer() {
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.on("/reset", handleReset);
  server.onNotFound(handleNotFound);
  server.begin();
}

void handleRoot() {
  String html;
  
  // Send HTTP headers first
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, F("text/html"), "");
  
  // Send HTML in chunks to reduce memory pressure
  server.sendContent(F("<!DOCTYPE HTML><html><head><title>Smart Dustbin</title>"));
  server.sendContent(F("<meta name='viewport' content='width=device-width, initial-scale=1'>"));
  server.sendContent(F("<style>html{font-family:Arial;text-align:center;color:#333;background:#f3f3ee}"));
  server.sendContent(F("body{margin:20px}h1{margin:20px auto;font-size:24px}"));
  server.sendContent(F(".card{background:white;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);"));
  server.sendContent(F("width:90%;max-width:450px;margin:0 auto 15px;padding:15px}"));
  server.sendContent(F(".level{font-size:50px;font-weight:bold;color:#3498db}"));
  server.sendContent(F(".bar{background:#ecf0f1;border-radius:10px;height:20px;width:100%;margin:10px 0}"));
  
  // Add progress bar with dynamic width
  String progressStyle = F(".progress{background:#3498db;width:");
  progressStyle += String((int)fillLevel);
  progressStyle += F("%;height:20px;border-radius:10px}");
  server.sendContent(progressStyle);
  
  server.sendContent(F(".footer{margin-top:20px;font-size:12px;color:#7f8c8d}</style>"));
  server.sendContent(F("<meta http-equiv='refresh' content='5'></head><body>"));
  
  // Main content
  server.sendContent(F("<h1>Smart Dustbin Monitor</h1>"));
  
  // Level card
  server.sendContent(F("<div class='card'><div class='level'>"));
  server.sendContent(String((int)fillLevel) + F("<span style='font-size:24px;'>%</span></div>"));
  server.sendContent(F("<div class='bar'><div class='progress'></div></div>"));
  
  // Status based on level
  server.sendContent(F("<div>Status: "));
  if (fillLevel < 50) {
    server.sendContent(F("<span style='color:#2ecc71;'>Good</span>"));
  } else if (fillLevel < 80) {
    server.sendContent(F("<span style='color:#f39c12;'>Warning</span>"));
  } else {
    server.sendContent(F("<span style='color:#e74c3c;'>Full</span>"));
  }
  server.sendContent(F("</div>"));
  
  // Level info
  server.sendContent(F("<div style='font-size:14px;color:#7f8c8d;margin-top:5px;'>"));
  server.sendContent(F("Distance: ") + String(distance) + F(" cm</div></div>"));
  
  // GPS card - simplified
  server.sendContent(F("<div class='card'><h2>Location</h2>"));
  if (gpsValid) {
    server.sendContent(F("<div>GPS: ") + String(gpsLat, 6) + F(", ") + String(gpsLng, 6) + F("</div>"));
  } else {
    server.sendContent(F("<div>GPS: No Signal</div>"));
  }
  server.sendContent(F("</div>"));
  
  // Reset button
  server.sendContent(F("<div class='card'><h2>Maintenance</h2>"));
  server.sendContent(F("<a href='/reset' style='display:inline-block;background:#3498db;color:white;"));
  server.sendContent(F("padding:8px 15px;border-radius:5px;text-decoration:none;'>Reset</a></div>"));
  
  // Footer - simplified
  server.sendContent(F("<div class='footer'>Smart Dustbin IoT System</div>"));
  server.sendContent(F("</body></html>"));
}

void handleData() {
  String json = "{";
  json += "\"fill_level\":" + String((int)fillLevel) + ",";  // Use int instead of float
  json += "\"distance\":" + String(distance) + ",";
  
  if (gpsValid) {
    json += "\"latitude\":" + String(gpsLat, 6) + ",";
    json += "\"longitude\":" + String(gpsLng, 6) + ",";
    json += "\"gps_valid\":true";
  } else {
    json += "\"gps_valid\":false";
  }
  
  json += "}";
  
  server.send(200, F("application/json"), json);
}

void handleReset() {
  fillLevel = 0;
  memset(levelHistory, 0, sizeof(levelHistory));
  
  server.send(200, F("text/plain"), F("System Reset Complete"));
  delay(500);  // Reduced from 1000ms
  ESP.restart();
}

void handleNotFound() {
  server.send(404, F("text/plain"), F("Not Found"));
}

void updateLCD() {
  lcd.setCursor(0, 0);
  lcd.print(F(" Smart Dustbin  "));
  
  lcd.setCursor(0, 1);
  lcd.print(F(" Level: "));
  
  // Clear value area
  lcd.setCursor(8, 1);
  lcd.print(F("        "));
  
  // Write formatted level
  lcd.setCursor(8, 1);
  int levelInt = (int)fillLevel;
  
  // More efficient formatting
  if (levelInt < 10) {
    lcd.print(levelInt);
    lcd.print(F("%   "));
  } else if (levelInt < 100) {
    lcd.print(levelInt);
    lcd.print(F("%  "));
  } else {
    lcd.print(F("100%"));
  }
}

void displayGPSInfo() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("GPS Location:"));
  
  lcd.setCursor(0, 1);
  if (gpsValid) {
    lcd.print(String(gpsLat, 4) + F(",") + String(gpsLng, 4));
  } else {
    lcd.print(F("No GPS Signal"));
  }
  
  delay(2000);
  lcd.clear();
  updateLCD();
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // Skip if not connected
  }
  
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, serverUrl);
  http.addHeader(F("Content-Type"), F("application/json"));
  
  // Clear and reuse JsonDocument to avoid memory fragmentation
  jsonDoc.clear();
  jsonDoc["bin_id"] = binId;
  jsonDoc["fill_level"] = (int)fillLevel;  // Use int instead of float
  jsonDoc["api_key"] = apiKey;
  
  if (gpsValid) {
    jsonDoc["latitude"] = gpsLat;
    jsonDoc["longitude"] = gpsLng;
  } else {
    // Use default location
    jsonDoc["latitude"] = -6.914744;
    jsonDoc["longitude"] = 107.609810;
  }
  
  // Use fixed-size buffer for serialization
  char jsonBuffer[256];
  serializeJson(jsonDoc, jsonBuffer, sizeof(jsonBuffer));
  
  // Send data
  int httpResponseCode = http.POST(jsonBuffer);
  
  // Show response on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  
  if (httpResponseCode > 0) {
    lcd.print(F("Data Sent"));
    lcd.setCursor(0, 1);
    lcd.print(F("Code: "));
    lcd.print(httpResponseCode);
  } else {
    lcd.print(F("Send Failed"));
    lcd.setCursor(0, 1);
    lcd.print(F("Error: "));
    lcd.print(httpResponseCode);
  }
  
  http.end();
  delay(1000);  // Reduced from 2000ms
  lcd.clear();
  updateLCD();
}

void loop() {
  // Process web requests
  server.handleClient();
  
  // Handle GPS and WiFi with reduced frequency
  static unsigned long lastCheckTime = 0;
  if (millis() - lastCheckTime > 5000) {  // Check every 5 seconds instead of every loop
    lastCheckTime = millis();
    
    // Read GPS data
    readGPS();
    
    // Check WiFi connection if needed
    if (!wifiConnected && WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
    } else if (wifiConnected && WiFi.status() != WL_CONNECTED) {
      wifiConnected = false;
    }
  }
  
  // Check if it's time to send data
  unsigned long currentMillis = millis();
  if (currentMillis - lastUpdateTime >= updateInterval) {
    lastUpdateTime = currentMillis;
    
    // Read sensor just before sending
    readUltrasonicSensor();
    sendDataToServer();
  }
  
  // Rotate through displaying different information
  static unsigned long lastDisplayChange = 0;
  static byte displayMode = 0;
  
  if (millis() - lastDisplayChange > 10000) {  // Rotate every 10 seconds
    lastDisplayChange = millis();
    displayMode = (displayMode + 1) % 3;
    
    switch (displayMode) {
      case 0:
        updateLCD();  // Show normal display
        break;
      case 1:
        displayGPSInfo();  // Show GPS info
        break;
      case 2:
        readUltrasonicSensor();  // Update readings and show normal display
        updateLCD();
        break;
    }
  }
  
  // Use shorter delay to remain responsive
  delay(100);  // Reduced from 1000ms
}

void readUltrasonicSensor() {
  // Trigger the sensor
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read the echo
  duration = pulseIn(echoPin, HIGH, 26000);  // Add timeout for pulseIn
  
  // Calculate distance (using integer math where possible)
  distance = (duration * 34) / 2000;  // Simplified calculation
  
  // Calculate fill level with constraints
  fillLevel = 100.0 * (1.0 - ((float)distance / maxDistance));
  
  // Ensure values are within bounds
  if (fillLevel < 0) fillLevel = 0;
  if (fillLevel > 100) fillLevel = 100;
  
  // Store in history array
  levelHistory[historyIndex] = fillLevel;
  historyIndex = (historyIndex + 1) % HISTORY_SIZE;
}