import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Tipe untuk collection yang sudah diformat
export type FormattedCollection = {
  id: string;
  binId: string;
  binName: string;
  binLocation: string;
  fillLevelBefore: number;
  notes: string | null;
  collectedAt: string;
  userId: string | null;
};

/**
 * Mendapatkan semua data pengumpulan sampah
 */
export async function getAllCollections(limit: number = 10): Promise<FormattedCollection[]> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
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
    
  if (error) {
    console.error('Error fetching collections:', error);
    throw new Error('Gagal mengambil data pengumpulan sampah');
  }
  
  // Format data untuk digunakan di frontend
  return data.map(collection => ({
    id: collection.id,
    binId: collection.bin_id,
    binName: collection.bins?.name || 'Tempat Sampah Tidak Dikenal',
    binLocation: collection.bins?.location || 'Lokasi Tidak Diketahui',
    fillLevelBefore: collection.fill_level_before,
    notes: collection.notes,
    collectedAt: collection.collected_at,
    userId: collection.user_id
  }));
}

/**
 * Mendapatkan data pengumpulan berdasarkan bin_id
 */
export async function getCollectionsByBin(binId: string, limit: number = 10): Promise<FormattedCollection[]> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      bins (
        id,
        name,
        location
      )
    `)
    .eq('bin_id', binId)
    .order('collected_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error(`Error fetching collections for bin ${binId}:`, error);
    throw new Error('Gagal mengambil data pengumpulan sampah');
  }
  
  // Format data untuk digunakan di frontend
  return data.map(collection => ({
    id: collection.id,
    binId: collection.bin_id,
    binName: collection.bins?.name || 'Tempat Sampah Tidak Dikenal',
    binLocation: collection.bins?.location || 'Lokasi Tidak Diketahui',
    fillLevelBefore: collection.fill_level_before,
    notes: collection.notes,
    collectedAt: collection.collected_at,
    userId: collection.user_id
  }));
}

/**
 * Mencatat pengumpulan sampah baru
 */
export async function createCollection(binId: string, fillLevelBefore: number, notes?: string): Promise<FormattedCollection | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Pertama, pastikan user terautentikasi
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Anda harus login untuk mencatat pengumpulan sampah');
  }
  
  // Buat catatan pengumpulan
  const { data, error } = await supabase
    .from('collections')
    .insert({
      bin_id: binId,
      user_id: user.id,
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
  
  if (error) {
    console.error('Error creating collection:', error);
    throw new Error('Gagal mencatat pengumpulan sampah');
  }
  
  // Update status tempat sampah menjadi kosong
  const { error: updateError } = await supabase
    .from('bins')
    .update({
      current_capacity: 0,
      last_updated: new Date().toISOString()
    })
    .eq('id', binId);
  
  if (updateError) {
    console.error('Error updating bin status:', updateError);
  }
  
  // Format data untuk dikembalikan
  return {
    id: data.id,
    binId: data.bin_id,
    binName: data.bins?.name || 'Tempat Sampah Tidak Dikenal',
    binLocation: data.bins?.location || 'Lokasi Tidak Diketahui',
    fillLevelBefore: data.fill_level_before,
    notes: data.notes,
    collectedAt: data.collected_at,
    userId: data.user_id
  };
} 