import { Database } from '@/types/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Menerima data dari ESP8266
    const { bin_id, fill_level, latitude, longitude, api_key } = await req.json();
    
    console.log("Received data:", { bin_id, fill_level, latitude, longitude });
    console.log("Type of bin_id:", typeof bin_id); // Check data type
    
    // Validasi input
    if (!bin_id || fill_level === undefined || !api_key) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }
    
    // Validasi API key
    const API_KEY = process.env.IOT_API_KEY || 'smart-dustbin-secret-key';
    if (api_key !== API_KEY) {
      return NextResponse.json({ error: 'API key tidak valid' }, { status: 401 });
    }
    
    // Koneksi ke Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Tampilkan semua bin yang ada di database (untuk debugging)
    const { data: allBins, error: listError } = await supabase.from('bins').select('id');
    console.log("All bins in database:", allBins);
    
    // Cari bin dengan ID yang diberikan
    const { data: existingBin, error: findError } = await supabase
      .from('bins')
      .select('id')
      .eq('id', bin_id)
      .single();
      
    if (findError) {
      console.error('Error finding bin:', findError);
      return NextResponse.json({ 
        error: 'Tempat sampah tidak ditemukan', 
        details: findError,
        requestedId: bin_id,
        availableIds: allBins?.map(bin => bin.id)
      }, { status: 404 });
    }
    
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
    
    // Jika kapasitas melebihi ambang tertentu, buat alert
    if (fill_level > 80) {
      // Cek apakah sudah ada alert aktif untuk tempat sampah ini
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('bin_id', bin_id)
        .eq('status', 'OPEN')
        .single();
      
      // Jika belum ada alert aktif, buat yang baru
      if (!existingAlert) {
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            bin_id,
            alert_type: 'FULL',
            priority: 'HIGH',
            status: 'OPEN',
            created_at: new Date().toISOString()
          });
          
        if (alertError) {
          console.error('Error creating alert:', alertError);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Data berhasil diperbarui' 
    });
    
  } catch (error: any) {
    console.error('Error in bin update:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server', 
      details: error.message 
    }, { status: 500 });
  }
}

// Test endpoint - GET method hanya untuk verifikasi
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint aktif! Gunakan metode POST untuk mengirim data dari ESP8266.'
  });
}