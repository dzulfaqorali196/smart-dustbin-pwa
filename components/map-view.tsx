'use client';

import { supabase } from '@/lib/supabase/client';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Definisikan tipe untuk data tempat sampah
// Definisikan tipe untuk data tempat sampah yang konsisten
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
        setError(null);
        
        const { data, error } = await supabase
          .from('bins')
          .select('*')
          .eq('status', 'ACTIVE');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Konversi data untuk memastikan tipe yang benar
          const formattedBins: Bin[] = data.map(bin => ({
            id: bin.id,
            name: bin.name,
            latitude: Number(bin.latitude),
            longitude: Number(bin.longitude),
            max_capacity: bin.max_capacity,
            current_capacity: bin.current_capacity,
            status: bin.status,
            last_updated: bin.last_updated,
            user_id: bin.user_id,
            location: bin.location
          }));
          
          setBins(formattedBins);
          
          // Hitung rata-rata koordinat untuk pusat peta
          const latSum = formattedBins.reduce((sum, bin) => sum + bin.latitude, 0);
          const lngSum = formattedBins.reduce((sum, bin) => sum + bin.longitude, 0);
          setCenter([latSum / formattedBins.length, lngSum / formattedBins.length]);
          
          console.log('Set center to:', [latSum / formattedBins.length, lngSum / formattedBins.length]);
        } else {
          console.log('No bins found');
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

    // Subscribe ke perubahan data real-time
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
          <p>Error: {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[500px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 font-medium">Memuat peta dan lokasi tempat sampah...</p>
          </div>
        </div>
      ) : bins.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-6xl text-gray-300 mb-4">🗑️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Tempat Sampah</h3>
            <p className="text-gray-500">Tambahkan tempat sampah pertama untuk melihatnya di peta</p>
          </div>
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