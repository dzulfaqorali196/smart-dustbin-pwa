import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route handler untuk callback otentikasi sosial dari Supabase.
 * Akan dipanggil saat pengguna telah berhasil login melalui Google atau GitHub.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Inisialisasi Supabase client dan set cookie
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange code with session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect ke halaman utama setelah login berhasil
  return NextResponse.redirect(new URL('/', request.url));
} 