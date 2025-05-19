
'use client';

import BinList from '@/components/bins/bin-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

// Contoh data bins
const mockBins = [
  {
    id: '1',
    name: 'Bin #DT-001',
    location: 'Jl. Gatot Subroto No. 12',
    fillLevel: 75,
    isActive: true,
    lastUpdated: new Date().toISOString(),
    latitude: -6.2088,
    longitude: 106.8456
  },
  {
    id: '2',
    name: 'Bin #DT-002',
    location: 'Jl. Sudirman No. 45',
    fillLevel: 30,
    isActive: true,
    lastUpdated: new Date().toISOString(),
    latitude: -6.2150,
    longitude: 106.8316
  },
  {
    id: '3',
    name: 'Bin #DT-003',
    location: 'Taman Menteng',
    fillLevel: 90,
    isActive: true,
    lastUpdated: new Date().toISOString(),
    latitude: -6.1957,
    longitude: 106.8322
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulasi loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Fungsi untuk mengambil waktu sekarang dan menentukan salam
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {userName}!</h1>
        <p className="text-muted-foreground">
          Pantau semua tempat sampah Anda dan lihat statistik terbaru di sini.
        </p>
      </div>

      {/* Statistik ringkasan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tempat Sampah</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-600">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +2 dibandingkan bulan lalu
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hampir Penuh</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-600">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +1 dalam 24 jam terakhir
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membutuhkan Perhatian</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-600">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground mt-1">
                  -1 dibandingkan kemarin
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efisiensi Pengumpulan</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-600">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">86%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +2.5% dibandingkan minggu lalu
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tempat sampah yang perlu diperhatikan */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tempat Sampah Terdekat</h2>
          <Button size="sm" variant="outline">Lihat Semua</Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <BinList bins={mockBins} />
        )}
      </div>

      {/* Aktivitas terbaru */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Riwayat pengumpulan sampah dalam 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                <li className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">Bin #DT-001 dikosongkan</p>
                    <p className="text-sm text-muted-foreground">2 jam yang lalu</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Petugas: Ahmad S.</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="size-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">Bin #DT-003 mendekati kapasitas penuh</p>
                    <p className="text-sm text-muted-foreground">6 jam yang lalu</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>90% kapasitas</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">Bin #DT-007 dikosongkan</p>
                    <p className="text-sm text-muted-foreground">Kemarin, 16:30</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Petugas: Budi W.</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="size-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">Bin #DT-005 terdeteksi tidak aktif</p>
                    <p className="text-sm text-muted-foreground">2 hari yang lalu</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Membutuhkan pemeriksaan</span>
                  </div>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}