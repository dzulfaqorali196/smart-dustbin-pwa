import { Database } from '@/types/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint aktif! Gunakan metode POST untuk mengirim data dari ESP8266.'
  });
}

export async function POST(req: NextRequest) {
  try {
    // Handle CORS
    const origin = req.headers.get('origin') || '*';
    const responseHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Menerima data dari ESP8266
    const { bin_id, fill_level, latitude, longitude, api_key } = await req.json();
    
    // console.log("Received data from sensor:", { 
    //   bin_id, 
    //   fill_level, 
    //   latitude, 
    //   longitude,
    //   timestamp: new Date().toISOString()
    // });

    // Validasi input
    if (!bin_id || fill_level === undefined || !api_key) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { 
        status: 400,
        headers: responseHeaders
      });
    }
    
    // Validasi API key
    const API_KEY = process.env.IOT_API_KEY || 'smart-dustbin-secret-key';
    if (api_key !== API_KEY) {
      return NextResponse.json({ error: 'API key tidak valid' }, { 
        status: 401,
        headers: responseHeaders
      });
    }
    
    // Koneksi ke Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
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
    
    // Tampilkan semua bin yang ada di database (untuk debugging)
    const { data: allBins, error: listError } = await supabase.from('bins').select('id');
    // console.log("All bins in database:", allBins);
    
    // Cari bin dengan ID yang diberikan
    const { data: existingBin, error: findError } = await supabase
      .from('bins')
      .select('id')
      .eq('id', bin_id)
      .single();
    
    // Jika bin tidak ditemukan, buat baru
    if (findError && findError.code === 'PGRST116') {
      // console.log(`Bin with ID ${bin_id} not found, creating new bin.`);
      const { data: newBin, error: insertError } = await supabase
        .from('bins')
        .insert({
          id: bin_id,
          name: `Bin #${bin_id}`,
          location: 'Auto-created location',
          max_capacity: 100,
          current_capacity: fill_level,
          status: 'ACTIVE',
          latitude: latitude || null,
          longitude: longitude || null,
          last_updated: new Date().toISOString()
        })
        .select();
        
      if (insertError) {
        console.error('Error creating new bin:', insertError);
        return NextResponse.json({ 
          error: 'Gagal membuat tempat sampah baru', 
          details: insertError 
        }, { 
          status: 500,
          headers: responseHeaders
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: newBin,
        message: 'Tempat sampah baru dibuat' 
      }, {
        headers: responseHeaders
      });
    } else if (findError) {
      console.error('Unexpected error finding bin:', findError);
      return NextResponse.json({ 
        error: 'Terjadi kesalahan saat mencari tempat sampah', 
        details: findError,
        requestedId: bin_id,
        availableIds: allBins?.map(bin => bin.id)
      }, { 
        status: 500,
        headers: responseHeaders
      });
    }
    
    // Update bin data
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
      return NextResponse.json({ error: 'Gagal memperbarui data' }, { 
        status: 500,
        headers: responseHeaders
      });
    }
    
    // Create alert if capacity is high
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
    }, { 
      status: 200,
      headers: responseHeaders
    });
    
  } catch (error: any) {
    console.error('Error in bin update:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}