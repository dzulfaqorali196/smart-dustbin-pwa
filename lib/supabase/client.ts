import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Opsi untuk Supabase client
// Catatan: Kredensial Google OAuth (NEXT_PUBLIC_GOOGLE_CLIENTID dan NEXT_PUBLIC_GOOGLE_SECRET)
// harus dikonfigurasi di dashboard Supabase pada bagian Authentication > Providers > Google
// Variabel lingkungan tersebut tidak digunakan langsung di client side,
// tetapi harus dikonfigurasi di server Supabase

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);