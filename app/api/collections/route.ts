import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// GET: Mendapatkan daftar pengumpulan sampah
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const bin_id = searchParams.get('bin_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    let query = supabase
      .from('collections')
      .select(`
        *,
        bins (
          id,
          name,
          location
        )
      `)
      .order('collected_at', { ascending: false })
      .limit(limit);
    
    // Filter berdasarkan bin_id jika diberikan
    if (bin_id) {
      query = query.eq('bin_id', bin_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching collections:', error);
      return NextResponse.json({ error: 'Gagal mengambil data pengumpulan' }, { status: 500 });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in collections API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST: Mencatat pengumpulan sampah baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bin_id, fill_level_before, notes } = body;
    
    // Validasi input
    if (!bin_id) {
      return NextResponse.json({ error: 'ID tempat sampah diperlukan' }, { status: 400 });
    }
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Dapatkan user saat ini
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Autentikasi diperlukan' }, { status: 401 });
    }
    
    // Catat pengumpulan
    const { data, error } = await supabase
      .from('collections')
      .insert({
        bin_id,
        user_id: user.id,
        fill_level_before: fill_level_before || 0,
        notes,
        collected_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error creating collection:', error);
      return NextResponse.json({ error: 'Gagal mencatat pengumpulan' }, { status: 500 });
    }
    
    // Update level tempat sampah menjadi kosong
    const { error: updateError } = await supabase
      .from('bins')
      .update({
        current_capacity: 0,
        last_updated: new Date().toISOString()
      })
      .eq('id', bin_id);
    
    if (updateError) {
      console.error('Error updating bin level:', updateError);
    }
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Error in collections API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
} 