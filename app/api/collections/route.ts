import { Database } from '@/types/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Handler untuk OPTIONS request (CORS pre-flight)
export async function OPTIONS() {
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

// Handler untuk GET request (testing only)
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint aktif! Gunakan metode POST untuk mengirim data dari ESP8266.'
  });
}

// Handler untuk POST request (main functionality)
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
    
    console.log("Received data:", { bin_id, fill_level, latitude, longitude });
    
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
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
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
      return NextResponse.json({ error: 'Gagal memperbarui data' }, { 
        status: 500,
        headers: responseHeaders
      });
    }
    
    // Buat alert jika level tinggi
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
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Data berhasil diperbarui' 
    }, { 
      status: 200,
      headers: responseHeaders
    });
    
  } catch (error: unknown) {
    console.error('Error in bin update:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server', 
      details: errorMessage 
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