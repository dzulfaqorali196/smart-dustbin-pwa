import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware untuk autentikasi dengan Supabase.
 * Dijalankan pada setiap permintaan untuk memperbaharui dan memvalidasi sesi pengguna.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Inisialisasi Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, any>) {
          // Ini digunakan untuk menyetel cookies dari server ke klien
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, any>) {
          // Ini digunakan untuk menghapus cookies dari server
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  );
  
  // Perbarui sesi pengguna jika ada
  await supabase.auth.getSession();
  
  return res;
}

// Konfigurasi middleware untuk dijalankan pada semua rute
export const config = {
  matcher: [
    /*
     * Jalankan middleware pada semua route kecuali:
     * - _next (file internal Next.js)
     * - assets statis (favicon, images, dll)
     * - API routes yang tidak memerlukan autentikasi
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/public).*)',
  ],
};