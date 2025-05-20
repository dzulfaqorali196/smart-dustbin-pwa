'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

// Definisikan tipe untuk data tempat sampah
interface Bin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  current_capacity: number;
  status: string;
  last_updated: string;
  user_id: string | null;
  location: string | null;
}

// Komponen Map diimpor secara dinamis untuk mencegah rendering di server
const MapComponent = dynamic(
  () => import('./map-component'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ),
    ssr: false // Pastikan komponen tidak dirender di server
  }
);

// Komponen utama peta
export default function MapView() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([-6.175367, 106.864779]); // Default: Jakarta
  const [mapKey, setMapKey] = useState(Date.now()); // Key unik untuk memaksa re-render

  // Ambil data tempat sampah dari Supabase
  useEffect(() => {
    const fetchBins = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('bins')
          .select('*')
          .eq('status', 'active');

        if (error) {
          throw error;
        }

        if (data) {
          setBins(data as Bin[]);
          // Jika ada data, setel pusat peta ke rata-rata koordinat
          if (data.length > 0) {
            const latSum = data.reduce((sum, bin) => sum + Number(bin.latitude), 0);
            const lngSum = data.reduce((sum, bin) => sum + Number(bin.longitude), 0);
            setCenter([latSum / data.length, lngSum / data.length]);
          }
        }
      } catch (err: Error | unknown) {
        console.error('Error fetching bins:', err);
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data tempat sampah';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBins();

    // Subscribe ke perubahan data
    const subscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bins' }, (payload) => {
        console.log('Perubahan terdeteksi:', payload);
        fetchBins();
        // Update map key untuk memaksa re-render
        setMapKey(Date.now());
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Render komponen
  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <MapComponent 
          bins={bins} 
          center={center} 
          mapKey={mapKey}
        />
      )}
    </div>
  );
} 