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

## Konfigurasi Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat proyek baru
3. Dapatkan URL Supabase dan Anon Key dari pengaturan proyek Anda
4. Buat file `.env.local` di root proyek dengan konten berikut:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Aktifkan Authentication di Supabase dashboard
6. Konfigurasi Email Authentication di Supabase

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
