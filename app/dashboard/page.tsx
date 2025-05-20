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
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
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
        
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">{getGreeting()}, {userName}!</h1>
        <p className="text-gray-600">
          Pantau semua tempat sampah Anda dan lihat statistik terbaru di sini.
        </p>
      </motion.div>

      {/* Statistik ringkasan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-black">Total Tempat Sampah</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-black">{getTotalBins()}</div>
                  <p className="text-xs text-gray-500 mt-1">
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-black">Hampir Penuh</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-black">{getAlmostFullBins()}</div>
                  <p className="text-xs text-gray-500 mt-1">
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-black">Membutuhkan Perhatian</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-black">{getNeedsAttentionBins()}</div>
                  <p className="text-xs text-gray-500">
                    {getNeedsAttentionBins() > 0 ? `${getNeedsAttentionBins()} tempat sampah perlu segera dikosongkan` : 'Tidak ada yang perlu perhatian khusus'}
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-black">Efisiensi Pengumpulan</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-black">{getCollectionEfficiency()}%</div>
                  <p className="text-xs text-gray-500">
                    Efisiensi pengumpulan sampah saat ini
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tempat sampah yang perlu diperhatikan */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Tempat Sampah Terdekat</h2>
            <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">Real-time</Badge>
          </div>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
            asChild
          >
            <Link href="/map">Lihat Semua</Link>
          </Button>
        </div>
        
        <BinList limit={3} onSelectBin={(bin) => console.log('Selected bin:', bin)} />
      </motion.div>

      {/* Aktivitas terbaru */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-8"
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-800">Aktivitas Terbaru</CardTitle>
                <CardDescription className="text-gray-500">
                  Riwayat pengumpulan sampah dalam 7 hari terakhir
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-600">24/7 Monitoring</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-gray-500">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {allBins.length > 0 ? (
                  allBins
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 4)
                    .map((bin) => (
                      <motion.li
                        key={bin.id}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="flex items-center gap-4 rounded-lg bg-white shadow-sm border border-gray-100 p-3"
                      >
                        <div className={`w-2 h-10 ${bin.fillLevel > 90 ? 'bg-red-500' : bin.fillLevel > 70 ? 'bg-yellow-500' : 'bg-green-500'} rounded-md`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none">{bin.name}</p>
                          <p className="text-sm text-gray-500">{bin.location} - Level: {bin.fillLevel}%</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                          <span>Terakhir update: {new Date(bin.lastUpdated).toLocaleTimeString()}</span>
                        </div>
                      </motion.li>
                    ))
                ) : (
                  <p className="text-center text-gray-400 py-4">Tidak ada aktivitas terbaru</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
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
