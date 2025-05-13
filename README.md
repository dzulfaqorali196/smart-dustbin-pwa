# Smart Dustbin PWA

Aplikasi Progressive Web App (PWA) untuk sistem monitoring tempat sampah pintar secara real-time.

## Fitur

- Monitoring tempat sampah secara real-time
- Visualisasi lokasi tempat sampah pada peta
- Notifikasi kapasitas tempat sampah
- Pengguna dan pengelolaan akun
- Dapat diakses offline (PWA)
- Dapat diinstal di perangkat mobile dan desktop

## Teknologi

- Next.js 15.3
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Leaflet (Maps)
- Zustand (State Management)
- PWA (Progressive Web App)

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

3. Jalankan dalam mode development
   ```bash
   npm run dev
   ```

4. Build untuk production
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

## Lisensi

MIT
