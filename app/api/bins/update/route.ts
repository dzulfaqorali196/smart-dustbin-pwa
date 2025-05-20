import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  try {
    // Menerima data dari ESP8266
    const { bin_id, fill_level, latitude, longitude, api_key } = await req.json();
    
    // Validasi input
    if (!bin_id || fill_level === undefined || !api_key) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }
    
    // Validasi API key (gunakan API key yang sama di ESP8266)
    // Dalam produksi, sebaiknya simpan API_KEY di .env.local
    const API_KEY = process.env.IOT_API_KEY || 'smart-dustbin-secret-key';
    if (api_key !== API_KEY) {
      return NextResponse.json({ error: 'API key tidak valid' }, { status: 401 });
    }
    
    // Koneksi ke Supabase
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Perbarui data tempat sampah
    const { data, error } = await supabase
      .from('bins')
      .update({
        current_capacity: fill_level,
        latitude: latitude || null,
        longitude: longitude || null,
        last_updated: new Date().toISOString()
      })
      .eq('id', bin_id)
      .select();
      
    if (error) {
      console.error('Error updating bin:', error);
      return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
    }
    
    // Buat alert jika kapasitas hampir penuh (opsional)
    if (fill_level > 80) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          bin_id,
          alert_type: 'FULL',
          priority: 'HIGH',
          status: 'OPEN',
          created_at: new Date().toISOString()
        })
        .select();
        
      if (alertError) {
        console.error('Error creating alert:', alertError);
      }
    }
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Error in bin update:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// Endpoint Testing GET (hanya untuk development)
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint aktif! Gunakan metode POST untuk mengirim data dari ESP8266.'
  });
} 