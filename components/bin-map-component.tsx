'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { getMarkerColor, calculateFillPercentage } from './bin-detail-map';
import 'leaflet/dist/leaflet.css';

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

// Props untuk komponen peta
interface BinMapComponentProps {
  bin: BinLocation;
  mapKey: number;
}

// Komponen peta untuk detail tempat sampah
export default function BinMapComponent({ bin, mapKey }: BinMapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapId = useRef(`bin-map-${bin.id}-${Date.now()}`);
  const position = useMemo<[number, number]>(() => [Number(bin.latitude), Number(bin.longitude)], [bin.latitude, bin.longitude]);

  // Inisialisasi peta ketika komponen dimount atau data berubah
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Cleanup peta sebelumnya jika ada
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // Buat peta baru jika container ada
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(position, 16);
      
      // Menggunakan peta dengan warna yang lebih kontras
      L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png${process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY ? `?api_key=${process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY}` : ''}`, {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 20
      }).addTo(map);
      
      // Tambahkan marker
      const markerColor = getMarkerColor(bin.current_capacity, bin.max_capacity);
      const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
      
      // Tambahkan lingkaran di lokasi
      L.circle(position, {
        color: markerColor === 'green' ? '#059669' : markerColor === 'orange' ? '#D97706' : '#DC2626',
        fillColor: markerColor === 'green' ? '#10B981' : markerColor === 'orange' ? '#F59E0B' : '#EF4444',
        fillOpacity: 0.3,
        radius: 20
      }).addTo(map);
      
      const binIcon = L.icon({
        iconUrl: `/img/bin-${markerColor}.svg`,
        iconSize: [40, 40], // Ukuran lebih besar untuk visibilitas
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
      
      const marker = L.marker(position, {
        icon: binIcon
      }).addTo(map);
      
      // Buat konten popup dengan kontras lebih tinggi
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 bg-white';
      
      const title = document.createElement('h3');
      title.className = 'font-bold text-lg text-gray-900';
      title.textContent = bin.name;
      popupContent.appendChild(title);
      
      if (bin.location) {
        const location = document.createElement('p');
        location.className = 'text-gray-700 text-sm font-medium';
        location.textContent = bin.location;
        popupContent.appendChild(location);
      }
      
      // Informasi level pengisian dengan kontras yang lebih baik
      const infoDiv = document.createElement('div');
      infoDiv.className = 'mt-3';
      
      const levelDiv = document.createElement('div');
      levelDiv.className = 'flex flex-col';
      
      const levelLabel = document.createElement('span');
      levelLabel.className = 'text-sm font-bold text-gray-800';
      levelLabel.textContent = 'Level Pengisian:';
      levelDiv.appendChild(levelLabel);
      
      const progressContainer = document.createElement('div');
      progressContainer.className = 'w-full mt-1 bg-gray-200 rounded-full h-2.5 shadow-inner';
      
      // Warna dengan kontras lebih tinggi
      let barColor = '';
      if (fillPercentage < 30) {
        barColor = 'bg-emerald-600'; // Hijau tua
      } else if (fillPercentage < 70) {
        barColor = 'bg-amber-600';   // Oranye tua
      } else {
        barColor = 'bg-rose-600';    // Merah tua
      }
      
      const progressBar = document.createElement('div');
      progressBar.className = `h-2.5 rounded-full ${barColor}`;
      progressBar.style.width = `${fillPercentage}%`;
      progressContainer.appendChild(progressBar);
      levelDiv.appendChild(progressContainer);
      
      const percentText = document.createElement('span');
      percentText.className = 'mt-1 text-sm font-bold';
      percentText.textContent = `${fillPercentage}%`;
      levelDiv.appendChild(percentText);
      
      infoDiv.appendChild(levelDiv);
      popupContent.appendChild(infoDiv);
      
      // Tambahkan kotak status dengan warna yang sesuai
      const statusBox = document.createElement('div');
      statusBox.className = `mt-3 p-2 rounded text-white text-center text-sm font-bold ${
        fillPercentage < 30 ? 'bg-emerald-600' : 
        fillPercentage < 70 ? 'bg-amber-600' : 
        'bg-rose-600'
      }`;
      statusBox.textContent = fillPercentage < 30 ? 'Status: Baik' : 
                             fillPercentage < 70 ? 'Status: Perlu Diperhatikan' : 
                             'Status: Perlu Segera Dibuang';
      popupContent.appendChild(statusBox);
      
      marker.bindPopup(L.popup({
        maxWidth: 250,
        className: 'custom-popup'
      }).setContent(popupContent));
      
      mapRef.current = map;
    }
    
    // Cleanup function - hapus peta ketika komponen unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bin, mapKey, position]);
  
  return (
    <div 
      id={mapId.current} 
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%' }} 
      className="rounded-lg shadow-md"
    />
  );
} 