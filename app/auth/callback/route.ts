import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Route handler untuk callback otentikasi sosial dari Supabase.
 * Akan dipanggil saat pengguna telah berhasil login melalui Google atau GitHub.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, any>) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: Record<string, any>) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    );
    
    // Exchange code with session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect langsung ke dashboard setelah login berhasil
    const redirectUrl = new URL('/dashboard', request.url);
    
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect ke dashboard setelah login berhasil
  return NextResponse.redirect(new URL('/dashboard', request.url));
}