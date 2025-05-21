# Smart Dustbin PWA

Aplikasi Progressive Web App (PWA) untuk sistem monitoring tempat sampah pintar secara real-time.

## Fitur

- Monitoring tempat sampah secara real-time
- Visualisasi lokasi tempat sampah pada peta
- Notifikasi kapasitas tempat sampah
- Pengguna dan pengelolaan akun
- Dapat diakses offline (PWA)
- Dapat diinstal di perangkat mobile dan desktop

## Elemen Fungsional

1. **Manajemen Pengguna**
   - Registrasi dan login pengguna
   - Autentikasi menggunakan email dan password
   - Autentikasi menggunakan Google OAuth
   - Manajemen profil pengguna

2. **Monitoring Tempat Sampah**
   - Pemantauan tingkat pengisian tempat sampah secara real-time
   - Visualisasi data pengisian tempat sampah
   - Riwayat tingkat pengisian 
   - Dashboard untuk melihat status semua tempat sampah

3. **Visualisasi Peta**
   - Menampilkan lokasi semua tempat sampah pada peta
   - Navigasi ke lokasi tempat sampah
   - Informasi status tempat sampah pada peta

4. **Notifikasi**
   - Pemberitahuan saat tempat sampah hampir penuh
   - Log riwayat notifikasi
   - Manajemen pengaturan notifikasi

5. **Integrasi IoT**
   - Penerimaan data dari perangkat IoT (ESP8266)
   - Endpoint API untuk pembaruan data tempat sampah
   - Verifikasi keamanan API menggunakan API key
   - Penyimpanan data dari sensor (tingkat pengisian, lokasi GPS)

6. **Fungsionalitas PWA**
   - Kemampuan bekerja offline
   - Instalasi pada perangkat mobile dan desktop
   - Dukungan service worker untuk caching
   - Sinkronisasi data saat kembali online

7. **Manajemen Data**
   - Penyimpanan data di Supabase
   - Pembaruan data secara real-time
   - Kueri dan analisis data tempat sampah

8. **Statistik dan Analitik**
   - Visualisasi data penggunaan tempat sampah
   - Statistik tingkat pengisian rata-rata
   - Laporan dan tren penggunaan

9. **Konfigurasi dan Pengaturan**
   - Pengaturan aplikasi
   - Manajemen preferensi pengguna
   - Konfigurasi notifikasi

10. **Keamanan**
    - Middleware untuk proteksi rute
    - Autentikasi dan otorisasi
    - Validasi API untuk komunikasi dengan perangkat IoT

## Teknologi

- Next.js 15.3
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Leaflet (Maps)
- Zustand (State Management)
- PWA (Progressive Web App)

## Komponen Hardware IoT

Proyek ini menggunakan perangkat IoT berikut:
- ESP8266 (NodeMCU)
- Sensor Ultrasonik HC-SR04
- Modul GPS NEO-6M
- LCD I2C 16x2
- Kabel jumper (male-to-female dan male-to-male)

## Konfigurasi IoT

1. **Perakitan Hardware**
   - Hubungkan ESP8266 dengan sensor ultrasonik:
     - VCC sensor ke 3.3V ESP8266
     - GND sensor ke GND ESP8266
     - Trigger pin ke D1
     - Echo pin ke D2
   - Hubungkan ESP8266 dengan GPS NEO-6M:
     - VCC GPS ke 3.3V ESP8266
     - GND GPS ke GND ESP8266
     - TX GPS ke D5
     - RX GPS ke D6
   - Hubungkan ESP8266 dengan LCD I2C:
     - VCC LCD ke 5V ESP8266
     - GND LCD ke GND ESP8266
     - SDA LCD ke D2
     - SCL LCD ke D1

2. **Setup IDE Arduino**
   - Install Arduino IDE
   - Tambahkan dukungan ESP8266: File > Preferences > Additional Board Manager URLs: `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
   - Install board ESP8266: Tools > Board > Boards Manager > Cari "ESP8266" dan install
   - Install library yang dibutuhkan:
     - ArduinoJson
     - TinyGPS++
     - LiquidCrystal_I2C

3. **Upload Program**
   - Buka file `arduino/smart_dustbin_iot.ino`
   - Ubah konfigurasi WiFi dan API key sesuai dengan kebutuhan
   - Pilih board NodeMCU 1.0 di Tools > Board
   - Upload ke ESP8266

## Endpoint API untuk IoT

API tersedia di `/api/bins/update` untuk menerima data dari perangkat IoT:

- **URL**: `/api/bins/update`
- **Method**: POST
- **Body**:
  ```json
  {
    "bin_id": "1", 
    "fill_level": 75,
    "latitude": -6.2088,
    "longitude": 106.8456,
    "api_key": "smart-dustbin-secret-key"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "data": { "id": "1", "name": "Bin #DT-001", ... }
  }
  ```

## Konfigurasi Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat proyek baru
3. Dapatkan URL Supabase dan Anon Key dari pengaturan proyek Anda
4. Buat file `.env.local` di root proyek dengan konten berikut:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   IOT_API_KEY=smart-dustbin-secret-key
   ```
5. Aktifkan Authentication di Supabase dashboard
6. Konfigurasi Email Authentication di Supabase
7. Buat tabel `bins` dan `alerts` dengan struktur yang sesuai dengan tipe data di `types/supabase.ts`

## Google OAuth Setup

Untuk mengaktifkan login dengan Google OAuth pada aplikasi Smart Dustbin PWA, ikuti langkah-langkah berikut:

1. **Buat Credentials di Google Cloud Platform:**
   - Masuk ke [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih project yang sudah ada
   - Aktifkan "Google People API" dan "Google+ API" (jika tersedia)
   - Buat OAuth Client ID:
     - Buka "Credentials" > "Create Credentials" > "OAuth Client ID"
     - Pilih Application Type: "Web Application"
     - Tambahkan Authorized JavaScript Origins: `https://your-app-url.com` dan `http://localhost:3000` (untuk development)
     - Tambahkan Authorized Redirect URIs: 
       - `https://your-app-url.com/auth/callback`
       - `http://localhost:3000/auth/callback` (untuk development)
       - `https://<your-supabase-project>.supabase.co/auth/v1/callback`

2. **Konfigurasi Supabase:**
   - Masuk ke Supabase Dashboard > Authentication > Providers
   - Aktifkan provider "Google"
   - Masukkan Client ID dan Client Secret dari Google Cloud Platform
   - Simpan pengaturan

3. **Konfigurasi Environment Variables:**
   - Buat file `.env.local` di root project
   - Tambahkan variabel berikut:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   
   # Google OAuth Configuration (opsional, sudah diatur di Supabase Dashboard)
   NEXT_PUBLIC_GOOGLE_CLIENTID=<your-google-client-id>
   NEXT_PUBLIC_GOOGLE_SECRET=<your-google-client-secret>
   ```

4. **Restart Development Server:**
   ```bash
   npm run dev
   ```

Google OAuth sekarang seharusnya aktif pada aplikasi Anda. Pengguna dapat login menggunakan akun Google mereka.

## Cara Menjalankan

1. Clone repositori
   ```bash
   git clone https://github.com/username/smart-dustbin-pwa.git
   cd smart-dustbin-pwa
   ```

2. Install dependensi
   ```bash
   npm install
   ```

3. Buat file `.env.local` dengan konfigurasi Supabase Anda

4. Jalankan dalam mode development
   ```bash
   npm run dev
   ```

5. Build untuk production
   ```bash
   npm run build
   npm start
   ```

## PWA Support

Aplikasi ini mendukung PWA dan dapat diinstal di perangkat mobile dan desktop. Fitur PWA hanya aktif pada mode production. Untuk menguji PWA, build aplikasi terlebih dahulu:

```bash
npm run build
npm start
```

## Struktur Folder

- `app/` - Routing dan halaman (Next.js App Router)
  - `(auth)` - Halaman autentikasi (sign in, sign up)
  - `(dashboard)` - Halaman dashboard setelah login
- `components/` - Komponen React yang dapat digunakan kembali
- `store/` - State management dengan Zustand
- `lib/` - Utility, helpers, dan konfigurasi
- `public/` - Aset statis dan file PWA

## Lisensi

MIT
