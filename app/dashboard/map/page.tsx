'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MapView from '@/components/map-view';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Info, AlertTriangle, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DashboardMapPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">Peta Tempat Sampah</h1>
            <p className="text-black">Visualisasi lokasi dan status tempat sampah</p>
          </div>
          <Button 
            asChild
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            <Link href="/bins/add">
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:inline">Tambah Tempat Sampah</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="border shadow-sm overflow-hidden h-[70vh]">
            <CardHeader className="bg-white border-b py-3 px-4">
              <div className="flex flex-col">
                <CardTitle className="text-lg font-bold flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2 text-green-700" />
                  Lokasi Tempat Sampah
                </CardTitle>
                <CardDescription className="text-sm text-black">
                  Peta menampilkan lokasi dan status tempat sampah pintar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div className="h-full w-full">
                <MapView />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Informasi Peta */}
          <Card className="border shadow-sm bg-white text-gray-700">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-md font-bold flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-700" />
                Informasi Peta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold mb-3 text-black">Indikator Status:</h3>
                <div className="flex justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 mb-2"></div>
                    <span className="text-xs text-center text-black">Rendah<br/>(&lt;30%)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500 mb-2"></div>
                    <span className="text-xs text-center text-black">Sedang<br/>(30-70%)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-rose-500 mb-2"></div>
                    <span className="text-xs text-center text-black">Penuh<br/>(&gt;70%)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="flex items-center text-sm text-black">
                  <Navigation className="w-4 h-4 text-gray-700 mr-2" />
                  <span>Klik marker</span>
                </div>
                <div className="flex items-center text-sm text-black">
                  <span>Zoom +/-</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Perhatian */}
          <Card className="border shadow-sm bg-white text-gray-700">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-md font-bold flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-green-700" />
                Perhatian
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-black mb-2">
                Data lokasi dan status tempat sampah diperbarui secara real-time melalui sensor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardMapPage; 