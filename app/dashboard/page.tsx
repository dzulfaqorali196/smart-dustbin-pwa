'use client';

import BinList from '@/components/bins/bin-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { FormattedBin, getAllBins, subscribeToBinsUpdates } from '@/lib/api/bins';
import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

// Data bins sekarang menggunakan API

function DashboardContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [allBins, setAllBins] = useState<FormattedBin[]>([]);
  
  useEffect(() => {
    setMounted(true);
    
    // Mengambil data bin dari Supabase
    const fetchBins = async () => {
      try {
        setIsLoading(true);
        const bins = await getAllBins();
        setAllBins(bins);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bins:', error);
        setIsLoading(false);
      }
    };
    
    fetchBins();
    
    // Subscribe ke perubahan data
    const unsubscribe = subscribeToBinsUpdates((updatedBins) => {
      setAllBins(updatedBins);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  if (!mounted) return null;

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Fungsi untuk mengambil waktu sekarang dan menentukan salam
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };
  
  // Menghitung statistik dari data bin
  const getTotalBins = () => allBins.length;
  
  const getAlmostFullBins = () => {
    return allBins.filter(bin => bin.fillLevel >= 70 && bin.fillLevel < 90).length;
  };
  
  const getNeedsAttentionBins = () => {
    return allBins.filter(bin => bin.fillLevel >= 90).length;
  };
  
  const getCollectionEfficiency = () => {
    if (allBins.length === 0) return 0;
    
    // Hitung efisiensi berdasarkan persentase bin yang tidak penuh
    const nonFullBins = allBins.filter(bin => bin.fillLevel < 80).length;
    return Math.round((nonFullBins / allBins.length) * 100);
  };

  return (
    <div className="space-y-4 p-4 sm:p-8 bg-gray-50 min-h-screen">
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 bg-green-500 rounded-full"></div>
          <span className="text-green-600 text-sm font-medium uppercase tracking-wider">Dashboard</span>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">{getGreeting()}, {userName}!</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Pantau semua tempat sampah Anda dan lihat statistik terbaru di sini.
        </p>
      </motion.div>

      {/* Statistik ringkasan */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-black">Total Tempat Sampah</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 sm:h-4 sm:w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-black">{getTotalBins()}</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {getTotalBins() > 0 ? `${getTotalBins()} tempat sampah aktif` : 'Tidak ada tempat sampah'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-black">Hampir Penuh</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 sm:h-4 sm:w-4">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-black">{getAlmostFullBins()}</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {getAlmostFullBins() > 0 ? `${getAlmostFullBins()} tempat sampah hampir penuh` : 'Semua tempat sampah dalam kondisi baik'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-black">Perlu Perhatian</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 sm:h-4 sm:w-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-black">{getNeedsAttentionBins()}</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {getNeedsAttentionBins() > 0 ? `${getNeedsAttentionBins()} perlu dikosongkan` : 'Tidak ada yang perlu perhatian'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-black">Efisiensi</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 sm:h-4 sm:w-4">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-black">{getCollectionEfficiency()}%</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Efisiensi pengumpulan sampah
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daftar tempat sampah */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Tempat Sampah Terdekat</h2>
            <p className="text-sm text-gray-600">Lihat status tempat sampah di sekitar Anda</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Real-time</Badge>
            <Button asChild variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
              <Link href="/bins">Lihat Semua</Link>
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-black">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-black">
              Riwayat pengumpulan sampah dalam 7 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  24/7 Monitoring
                </Badge>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <BinList bins={allBins.slice(0, 5)} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Komponen utama untuk ekspor
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
