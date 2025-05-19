import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware untuk autentikasi dengan Supabase.
 * Dijalankan pada setiap permintaan untuk memperbaharui dan memvalidasi sesi pengguna.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Inisialisasi Supabase client dengan cookies dari permintaan
  const supabase = createMiddlewareClient({ req, res });
  
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