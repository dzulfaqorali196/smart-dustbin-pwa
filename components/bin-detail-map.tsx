'use client';

import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

// Definisikan tipe untuk data tempat sampah
interface BinLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  location?: string | null;
  current_capacity: number;
  max_capacity: number;
}

// Warna marker berdasarkan level pengisian
export const getMarkerColor = (currentCapacity: number, maxCapacity: number) => {
  const fillPercentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
  if (fillPercentage < 30) return 'green';
  if (fillPercentage < 70) return 'orange';
  return 'red';
};

// Hitung persentase pengisian
export const calculateFillPercentage = (currentCapacity: number, maxCapacity: number) => {
  return maxCapacity > 0 ? Math.round((currentCapacity / maxCapacity) * 100) : 0;
};

// Props untuk komponen peta
interface BinDetailMapProps {
  bin: BinLocation;
}

// Import BinMapComponent dengan dynamic import dan path yang benar
const BinMapComponent = dynamic(
  () => import('@/components/bin-map-component'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ),
    ssr: false // Pastikan komponen tidak dirender di server
  }
);

// Komponen peta untuk detail tempat sampah
export default function BinDetailMap({ bin }: BinDetailMapProps) {
  const [mapKey, setMapKey] = useState(Date.now()); // Key unik untuk memaksa re-render

  // Reset map jika bin berubah
  useEffect(() => {
    setMapKey(Date.now());
  }, [bin.id, bin.latitude, bin.longitude]);

  return (
    <div className="h-full w-full relative">
      {/* Marker pusat animasi */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="animate-ping h-3 w-3 rounded-full bg-green-500 opacity-75"></div>
      </div>
      
      {/* Peta - memastikan semua props yang dibutuhkan dikirim */}
      <BinMapComponent 
        bin={bin} 
        mapKey={mapKey} 
      />
    </div>
  );
} 