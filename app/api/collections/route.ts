import { Database } from '@/types/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Common constants
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper to create Supabase client
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, any>) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, any>) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// Helper for error responses
function createErrorResponse(message: string, details: any, status = 500) {
  return NextResponse.json(
    { error: message, details },
    { status, headers: CORS_HEADERS }
  );
}

// Helper for success responses
function createSuccessResponse(data: any, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status, headers: CORS_HEADERS }
  );
}

// OPTIONS handler for CORS pre-flight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// GET handler to fetch collections
export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const binId = searchParams.get('bin_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Build query
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

    // Apply bin_id filter
    if (binId) {
      query = query.eq('bin_id', binId);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching collections:', error);
      return createErrorResponse('Gagal mengambil data pengumpulan', error, 500);
    }

    // Format data for response
    const formattedCollections = data.map(collection => ({
      id: collection.id,
      binId: collection.bin_id,
      binName: collection.bins?.name || 'Tempat Sampah Tidak Dikenal',
      binLocation: collection.bins?.location || 'Lokasi Tidak Diketahui',
      fillLevelBefore: collection.fill_level_before,
      notes: collection.notes,
      collectedAt: collection.collected_at,
      userId: collection.user_id
    }));

    return createSuccessResponse(formattedCollections);
  } catch (error: unknown) {
    console.error('Error in get collections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Terjadi kesalahan server', errorMessage, 500);
  }
}

// POST handler to create new collection
export async function POST(req: NextRequest) {
  try {
    // Parse request data
    const { bin_id, notes, api_key } = await req.json();
    
    // Validate input
    if (!bin_id) {
      return createErrorResponse('Parameter bin_id tidak boleh kosong', null, 400);
    }
    
    // Validate API key if provided
    if (api_key) {
      const API_KEY = process.env.IOT_API_KEY || 'smart-dustbin-secret-key';
      if (api_key !== API_KEY) {
        return createErrorResponse('API key tidak valid', null, 401);
      }
    }
    
    const supabase = await getSupabaseClient();
    
    // Get user from session if available
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Check if bin exists and get current capacity
    const { data: existingBin, error: findError } = await supabase
      .from('bins')
      .select('id, name, current_capacity')
      .eq('id', bin_id)
      .single();
    
    if (findError) {
      return createErrorResponse('Tempat sampah tidak ditemukan', findError, 404);
    }
    
    const fillLevelBefore = existingBin.current_capacity;
    
    // Create collection record
    const { data: collection, error: insertError } = await supabase
      .from('collections')
      .insert({
        bin_id,
        user_id: userId || null,
        fill_level_before: fillLevelBefore,
        notes: notes || null,
        collected_at: new Date().toISOString()
      })
      .select(`
        *,
        bins (
          id,
          name,
          location
        )
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating collection record:', insertError);
      return createErrorResponse('Gagal mencatat pengumpulan sampah', insertError, 500);
    }
    
    // Update bin capacity to 0
    const { error: updateError } = await supabase
      .from('bins')
      .update({
        current_capacity: 0,
        last_updated: new Date().toISOString()
      })
      .eq('id', bin_id);
    
    if (updateError) {
      console.error('Error updating bin status:', updateError);
    }
    
    // Resolve active alerts for this bin
    const currentTime = new Date().toISOString();
    const { error: alertUpdateError } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: currentTime
      })
      .eq('bin_id', bin_id)
      .in('status', ['pending', 'acknowledged']);
    
    if (alertUpdateError) {
      console.error('Error updating alerts:', alertUpdateError);
    }
    
    // Format response data
    const formattedCollection = {
      id: collection.id,
      binId: collection.bin_id,
      binName: collection.bins?.name || 'Tempat Sampah Tidak Dikenal',
      binLocation: collection.bins?.location || 'Lokasi Tidak Diketahui',
      fillLevelBefore: collection.fill_level_before,
      notes: collection.notes,
      collectedAt: collection.collected_at,
      userId: collection.user_id
    };
    
    return createSuccessResponse(
      formattedCollection, 
      'Pengumpulan sampah berhasil dicatat',
      201
    );
    
  } catch (error: unknown) {
    console.error('Error in create collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Terjadi kesalahan server', errorMessage, 500);
  }
}