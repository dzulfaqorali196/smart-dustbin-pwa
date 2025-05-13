'use client';

import { useEffect, useState } from 'react';
import { Bin } from '@/types/bin';

// Mock data - pada implementasi nyata, data akan diambil dari API/Supabase
const MOCK_BINS: Bin[] = [
  {
    id: '1',
    name: 'Tempat Sampah A',
    location: 'Gedung A, Lantai 1',
    fillLevel: 75,
    isActive: true,
    lastUpdated: new Date().toISOString(),
    latitude: -6.2088,
    longitude: 106.8456
  },
  {
    id: '2',
    name: 'Tempat Sampah B',
    location: 'Taman Utama',
    fillLevel: 30,
    isActive: true,
    lastUpdated: new Date().toISOString(),
    latitude: -6.2090,
    longitude: 106.8460
  },
  {
    id: '3',
    name: 'Tempat Sampah C',
    location: 'Kantin',
    fillLevel: 90,
    isActive: false,
    lastUpdated: new Date().toISOString(),
    latitude: -6.2092,
    longitude: 106.8450
  }
];

export default function DashboardPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  
  useEffect(() => {
    // Simulasi fetch data
    setBins(MOCK_BINS);
  }, []);

  const totalBins = bins.length;
  const activeBins = bins.filter(bin => bin.isActive).length;
  const needsAttention = bins.filter(bin => bin.fillLevel > 80).length;

  return (
    <div>
      <h1 className="mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kartu Total Tempat Sampah */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Total Tempat Sampah</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{totalBins}</p>
          </div>
        </div>

        {/* Kartu Tempat Sampah Aktif */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Tempat Sampah Aktif</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{activeBins}</p>
            <p className="text-sm text-gray-500">{Math.round((activeBins / totalBins) * 100)}% dari total</p>
          </div>
        </div>

        {/* Kartu Butuh Perhatian */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Butuh Perhatian</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{needsAttention}</p>
            <p className="text-sm text-gray-500">Tempat sampah hampir penuh</p>
          </div>
        </div>
      </div>

      {/* Tabel Status Tempat Sampah */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Status Tempat Sampah</h3>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4">Nama</th>
                  <th className="text-left py-3 px-4">Lokasi</th>
                  <th className="text-left py-3 px-4">Kapasitas</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Terakhir Diperbarui</th>
                </tr>
              </thead>
              <tbody>
                {bins.map(bin => (
                  <tr key={bin.id} className="border-b dark:border-gray-700">
                    <td className="py-3 px-4">{bin.name}</td>
                    <td className="py-3 px-4">{bin.location}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            bin.fillLevel < 30 ? 'bg-green-500' : 
                            bin.fillLevel < 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${bin.fillLevel}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bin.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(bin.lastUpdated).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 