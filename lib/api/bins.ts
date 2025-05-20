import { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

// Tipe untuk bin yang sudah diformat
export type FormattedBin = {
  id: string;
  name: string;
  location: string;
  fillLevel: number; // Persentase dari kapasitas
  isActive: boolean;
  lastUpdated: string; // ISO string
  latitude: number | null;
  longitude: number | null;
};

// Inisialisasi Supabase Client untuk browser
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Mendapatkan semua data tempat sampah
 */
export async function getAllBins(): Promise<FormattedBin[]> {
  const { data, error } = await supabase
    .from('bins')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching bins:', error);
    throw new Error('Gagal mengambil data tempat sampah');
  }
  
  // Format data untuk digunakan di frontend
  return data.map(bin => ({
    id: bin.id,
    name: bin.name,
    location: bin.location,
    fillLevel: Math.round((bin.current_capacity / bin.max_capacity) * 100), 
    isActive: bin.status === 'ACTIVE',
    lastUpdated: bin.last_updated,
    latitude: bin.latitude,
    longitude: bin.longitude
  }));
}

/**
 * Mendapatkan data tempat sampah berdasarkan ID
 */
export async function getBinById(id: string): Promise<FormattedBin | null> {
  const { data, error } = await supabase
    .from('bins')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching bin ${id}:`, error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    fillLevel: Math.round((data.current_capacity / data.max_capacity) * 100),
    isActive: data.status === 'ACTIVE',
    lastUpdated: data.last_updated,
    latitude: data.latitude,
    longitude: data.longitude
  };
}

/**
 * Mendapatkan data real-time dengan subscription Supabase
 * @param callback Fungsi yang dipanggil ketika ada pembaruan data
 */
export function subscribeToBinsUpdates(callback: (bins: FormattedBin[]) => void) {
  // Subscribe ke perubahan tabel bins
  const subscription = supabase
    .channel('bins-channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'bins' }, 
      async () => {
        // Ketika ada perubahan, ambil data terbaru
        const bins = await getAllBins();
        callback(bins);
      }
    )
    .subscribe();
    
  // Kembalikan fungsi untuk berhenti subscribe
  return () => {
    subscription.unsubscribe();
  };
}