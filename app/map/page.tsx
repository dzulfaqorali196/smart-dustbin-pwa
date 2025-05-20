'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MapView from '@/components/map-view';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Info, AlertTriangle, Navigation, ChevronLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MapPage = () => {
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
    <div className="bg-green-50 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-3 px-4 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-green-700 hover:text-green-800 flex items-center mr-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <Home className="w-5 h-5 ml-1" />
              <span className="ml-1 font-medium">Dashboard</span>
            </button>
          </div>
          
          {user && (
            <Button
              onClick={() => router.push('/bins/add')}
              className="bg-green-700 hover:bg-green-800 text-white font-bold rounded-full px-4 py-2 flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              <span>Tambah Tempat Sampah</span>
            </Button>
          )}
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-grow p-4 overflow-hidden">
        <div className="container mx-auto h-full grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Map */}
          <div className="lg:col-span-3 h-full flex flex-col">
            <Card className="h-full border shadow-sm overflow-hidden">
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
              <CardContent className="p-0 flex-grow">
                <div className="h-full w-full">
                  <MapView />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-auto pr-1">
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
                
                {!user && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm font-bold mb-2 text-black">Ingin menambahkan tempat sampah?</p>
                    <Button asChild className="w-full bg-green-700 hover:bg-green-800 text-white font-medium rounded">
                      <Link href="/signin">Masuk untuk Menambahkan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Button Back to Dashboard */}
            <div className="mt-2">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-md flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage; 