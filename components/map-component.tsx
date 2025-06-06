'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

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

interface MapComponentProps {
  bins: Bin[];
  center: [number, number];
  mapKey: number;
}

// Warna marker berdasarkan level pengisian dengan kontras lebih tinggi
const getMarkerColor = (currentCapacity: number, maxCapacity: number) => {
  const fillPercentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
  if (fillPercentage < 30) return 'green';  // Tetap hijau untuk level rendah
  if (fillPercentage < 70) return 'orange'; // Tetap oranye untuk level sedang
  return 'red';  // Tetap merah untuk level tinggi
};

// Hitung persentase pengisian
const calculateFillPercentage = (currentCapacity: number, maxCapacity: number) => {
  return maxCapacity > 0 ? Math.round((currentCapacity / maxCapacity) * 100) : 0;
};

// Komponen peta
export default function MapComponent({ bins, center, mapKey }: MapComponentProps) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapId = useRef(`map-${Date.now()}`);
  
  // Inisialisasi peta ketika komponen dimount atau data berubah
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('Initializing map with bins:', bins); // Debug log
    
    // Cleanup peta sebelumnya jika ada
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // Buat peta baru jika container ada
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, 15);
      
      // Menggunakan peta dengan warna yang lebih kontras dari Stamen
      L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png${process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY ? `?api_key=${process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY}` : ''}`, {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 20
      }).addTo(map);
      
      // Tambahkan marker untuk setiap tempat sampah
      bins.forEach((bin, index) => {
        console.log(`Adding marker ${index + 1} for bin:`, bin); // Debug log
        
        // Validasi koordinat
        if (!bin.latitude || !bin.longitude || isNaN(bin.latitude) || isNaN(bin.longitude)) {
          console.warn(`Invalid coordinates for bin ${bin.id}:`, { lat: bin.latitude, lng: bin.longitude });
          return;
        }
        
        const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
        const markerColor = getMarkerColor(bin.current_capacity, bin.max_capacity);
        
        // Gunakan circle marker dengan warna yang sesuai
        const circleColor = markerColor === 'green' ? '#059669' : markerColor === 'orange' ? '#D97706' : '#DC2626';
        const fillColor = markerColor === 'green' ? '#10B981' : markerColor === 'orange' ? '#F59E0B' : '#EF4444';
        
        const marker = L.circleMarker([Number(bin.latitude), Number(bin.longitude)], {
          radius: 12,
          fillColor: fillColor,
          color: circleColor,
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
        
        // Tambahkan label di tengah circle
        const divIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            width: 24px; 
            height: 24px; 
            background-color: ${fillColor}; 
            border: 3px solid ${circleColor}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            font-size: 10px; 
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${fillPercentage}%</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        const percentageMarker = L.marker([Number(bin.latitude), Number(bin.longitude)], {
          icon: divIcon
        }).addTo(map);
        
        console.log(`Marker added at coordinates:`, [Number(bin.latitude), Number(bin.longitude)]);
        
        // Buat konten popup dengan kontras tinggi
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 bg-white';
        
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
        
        // Informasi level pengisian
        const infoDiv = document.createElement('div');
        infoDiv.className = 'mt-3 space-y-2';
        
        // Level bar
        const levelDiv = document.createElement('div');
        levelDiv.className = 'flex flex-col';
        
        const levelLabel = document.createElement('span');
        levelLabel.className = 'text-sm font-bold text-gray-900 mb-1';
        levelLabel.textContent = 'Level Pengisian:';
        levelDiv.appendChild(levelLabel);
        
        const progressOuterDiv = document.createElement('div');
        progressOuterDiv.className = 'flex items-center';
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'w-full bg-gray-200 rounded-full h-3 shadow-inner';
        
        const progressBar = document.createElement('div');
        
        // Warna dengan kontras tinggi berdasarkan level
        let barColor = '';
        if (fillPercentage < 30) {
          barColor = 'bg-emerald-600';  // Hijau lebih gelap
        } else if (fillPercentage < 70) {
          barColor = 'bg-amber-600';    // Oranye lebih gelap
        } else {
          barColor = 'bg-rose-600';     // Merah lebih gelap
        }
        
        progressBar.className = `h-3 rounded-full ${barColor}`;
        progressBar.style.width = `${fillPercentage}%`;
        progressContainer.appendChild(progressBar);
        progressOuterDiv.appendChild(progressContainer);
        
        const percentText = document.createElement('span');
        percentText.className = 'ml-2 text-sm font-bold text-gray-900';
        percentText.textContent = `${fillPercentage}%`;
        progressOuterDiv.appendChild(percentText);
        
        levelDiv.appendChild(progressOuterDiv);
        infoDiv.appendChild(levelDiv);
        
        // Kapasitas
        const capacityDiv = document.createElement('div');
        capacityDiv.className = 'flex items-center';
        
        const capacityLabel = document.createElement('span');
        capacityLabel.className = 'text-sm font-bold text-gray-900 mr-2';
        capacityLabel.textContent = 'Kapasitas:';
        capacityDiv.appendChild(capacityLabel);
        
        const capacityText = document.createElement('span');
        capacityText.className = 'text-sm font-medium text-gray-800';
        capacityText.textContent = `${bin.current_capacity}/${bin.max_capacity}`;
        capacityDiv.appendChild(capacityText);
        
        infoDiv.appendChild(capacityDiv);
        popupContent.appendChild(infoDiv);
        
        // Terakhir diperbarui
        const lastUpdated = document.createElement('div');
        lastUpdated.className = 'mt-2 text-xs font-medium text-gray-700';
        lastUpdated.textContent = `Terakhir diperbarui: ${new Date(bin.last_updated).toLocaleString('id-ID')}`;
        popupContent.appendChild(lastUpdated);
        
        // Tombol detail
        const detailButton = document.createElement('button');
        detailButton.className = 'mt-3 text-white bg-green-700 hover:bg-green-800 font-bold py-1.5 px-3 rounded text-sm w-full';
        detailButton.textContent = 'Lihat Detail →';
        detailButton.onclick = () => {
          router.push(`/bins/${bin.id}`);
        };
        popupContent.appendChild(detailButton);
        
        percentageMarker.bindPopup(L.popup({
          maxWidth: 300,
          className: 'custom-popup',
        }).setContent(popupContent));
      });
      
      // Set bounds untuk menampilkan semua marker jika ada lebih dari satu
      if (bins.length > 1) {
        const group = new L.FeatureGroup(
          bins.map(bin => L.marker([Number(bin.latitude), Number(bin.longitude)]))
        );
        map.fitBounds(group.getBounds().pad(0.1));
      }
      
      mapRef.current = map;
      console.log('Map initialized with', bins.length, 'markers');
    }
    
    // Cleanup function - hapus peta ketika komponen unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bins, center, mapKey, router]);
  
  return (
    <div 
      id={mapId.current} 
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', minHeight: '500px' }} 
      className="rounded-lg shadow-md"
    />
  );
}