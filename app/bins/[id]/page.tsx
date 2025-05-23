'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Edit,
  MapPin,
  RefreshCw,
  Trash2,
  TrendingUp
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Dynamic import untuk komponen peta (agar tidak ada error SSR)
const BinDetailMap = dynamic(() => import('@/components/bin-detail-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        <p className="text-sm text-gray-500">Memuat peta...</p>
      </div>
    </div>
  )
});

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
  created_at: string;
  user_id: string | null;
  location: string | null;
}

export default function BinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [bin, setBin] = useState<Bin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fungsi untuk mengambil data tempat sampah
  const fetchBin = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      if (!showToast) setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setBin(data as Bin);
        
        // Cek apakah pengguna saat ini adalah pemilik
        if (user) {
          setIsUserOwner(user.id === data.user_id);
        }
        
        if (showToast) {
          toast.success('Data berhasil diperbarui');
        }
      }
    } catch (error: Error | unknown) {
      console.error('Error fetching bin details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data tempat sampah';
      setError(errorMessage);
      if (showToast) {
        toast.error('Gagal memperbarui data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, user]);

  // Efek untuk memuat data saat komponen dimuat
  useEffect(() => {
    if (id) {
      fetchBin();
    }
    
    // Subscribe ke perubahan data
    const subscription = supabase
      .channel(`bin-${id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bins', filter: `id=eq.${id}` },
        (payload) => {
          console.log('Bin data changed:', payload);
          fetchBin();
        })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [id, user, fetchBin]);

  // Fungsi untuk menghapus tempat sampah
  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus tempat sampah ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bins')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Tempat sampah berhasil dihapus');
      router.push('/dashboard/map');
    } catch (error: Error | unknown) {
      console.error('Error deleting bin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus tempat sampah';
      setError(errorMessage);
      toast.error('Gagal menghapus tempat sampah');
    }
  };

  // Menentukan warna berdasarkan level pengisian
  const getFillLevelColor = (currentCapacity: number, maxCapacity: number) => {
    const fillPercentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
    if (fillPercentage < 30) return 'bg-emerald-500';
    if (fillPercentage < 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Menentukan warna badge berdasarkan level pengisian
  const getFillBadgeColor = (currentCapacity: number, maxCapacity: number) => {
    const fillPercentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
    if (fillPercentage < 30) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (fillPercentage < 70) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  // Hitung persentase pengisian
  const calculateFillPercentage = (currentCapacity: number, maxCapacity: number) => {
    return maxCapacity > 0 ? Math.round((currentCapacity / maxCapacity) * 100) : 0;
  };

  // Mengonversi waktu terakhir diperbarui ke format yang lebih mudah dibaca
  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Menentukan status icon berdasarkan level pengisian
  const getStatusIcon = (fillPercentage: number) => {
    if (fillPercentage > 80) {
      return <AlertTriangle className="w-5 h-5 text-rose-600" />;
    }
    return <CheckCircle className="w-5 h-5 text-emerald-600" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
          <p className="text-gray-600 font-medium">Memuat detail tempat sampah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Breadcrumb dan Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-white/80 backdrop-blur-sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            
            {bin && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">ID:</span>
                <span className="text-sm text-black font-mono bg-gray-100 px-2 pt-1.4 rounded">
                  {bin.id}
                </span>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-rose-800">Terjadi Kesalahan</h3>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                  <Button
                    onClick={() => fetchBin(true)}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-rose-300 text-rose-700 hover:bg-rose-100"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Coba Lagi
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {bin ? (
            <>
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Archive className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{bin.name}</CardTitle>
                            {bin.location && (
                              <p className="text-gray-600 flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {bin.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {(() => {
                          const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                          return (
                            <Badge className={`${getFillBadgeColor(bin.current_capacity, bin.max_capacity)} border px-3 py-1.5 font-medium`}>
                              {getStatusIcon(fillPercentage)}
                              <span className="ml-2">{fillPercentage}% Penuh</span>
                            </Badge>
                          );
                        })()}
                        
                        <Badge className={`${bin.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'} border px-3 py-1.5`}>
                          {bin.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                        
                        {isUserOwner && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                              onClick={() => router.push(`/bins/${id}/edit`)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                              onClick={handleDelete}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Status dan Informasi Detail */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Status Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Level Pengisian Card */}
                    <Card className="border-0 shadow-md bg-white overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-gray-800">
                          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                          Level Pengisian
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                          return (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-3xl font-bold text-gray-900">{fillPercentage}%</span>
                                <span className="text-sm text-gray-500">dari kapasitas</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-3 rounded-full transition-all duration-500 ${getFillLevelColor(bin.current_capacity, bin.max_capacity)}`}
                                  style={{ width: `${fillPercentage}%` }}
                                ></div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {bin.current_capacity} / {bin.max_capacity} liter
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Status dan Alert Card */}
                    <Card className="border-0 shadow-md bg-white overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-gray-800">
                          <Clock className="w-5 h-5 mr-2 text-purple-600" />
                          Status Sistem
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Kondisi</span>
                            {(() => {
                              const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                              if (fillPercentage > 80) {
                                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Perlu Perhatian</Badge>;
                              } else if (fillPercentage > 50) {
                                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Normal</Badge>;
                              }
                              return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Baik</Badge>;
                            })()}
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="text-sm text-gray-600 mb-1">Terakhir Diperbarui</div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatLastUpdated(bin.last_updated)}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => fetchBin(true)}
                            disabled={isRefreshing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Memperbarui...' : 'Perbarui Data'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Informasi Detail */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-0 shadow-md bg-white">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800">Informasi Detail</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <MapPin className="w-5 h-5 text-green-600 mt-1" />
                              <div>
                                <h4 className="font-medium text-gray-900">Koordinat Lokasi</h4>
                                <p className="text-sm text-gray-600 font-mono">
                                  {Number(bin.latitude).toFixed(6)}, {Number(bin.longitude).toFixed(6)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <Archive className="w-5 h-5 text-blue-600 mt-1" />
                              <div>
                                <h4 className="font-medium text-gray-900">Kapasitas Maksimum</h4>
                                <p className="text-sm text-gray-600">
                                  {bin.max_capacity} liter
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                              <div>
                                <h4 className="font-medium text-gray-900">Tanggal Dibuat</h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(bin.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <TrendingUp className="w-5 h-5 text-orange-600 mt-1" />
                              <div>
                                <h4 className="font-medium text-gray-900">ID Sistem</h4>
                                <p className="text-sm text-gray-600 font-mono">
                                  {bin.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Alert untuk level tinggi */}
                        {(() => {
                          const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                          if (fillPercentage > 80) {
                            return (
                              <div className="mt-6 bg-rose-50 border border-rose-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-rose-800">Perhatian Diperlukan</h4>
                                    <p className="text-sm text-rose-700 mt-1">
                                      Tempat sampah hampir penuh ({fillPercentage}%). Disarankan untuk segera melakukan pengumpulan sampah.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                
                {/* Peta dan Action Panel */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Peta */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-0 shadow-md bg-white overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-gray-800">
                          <MapPin className="w-5 h-5 mr-2 text-green-600" />
                          Lokasi pada Peta
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-[350px] relative">
                          <BinDetailMap bin={bin} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <Link href="/dashboard/map" className="block">
                      <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        Lihat di Peta Lengkap
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/bins" className="block">
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3">
                        <Archive className="w-4 h-4 mr-2" />
                        Lihat Semua Tempat Sampah
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="text-6xl text-gray-300 mb-6">🗑️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Tempat Sampah Tidak Ditemukan</h3>
                <p className="text-gray-600 mb-8">
                  Tempat sampah dengan ID tersebut tidak ditemukan atau mungkin telah dihapus.
                </p>
                <div className="space-y-3">
                  <Link href="/dashboard/map">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      Kembali ke Peta
                    </Button>
                  </Link>
                  <br />
                  <Link href="/dashboard/bins">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3">
                      <Archive className="w-4 h-4 mr-2" />
                      Lihat Semua Tempat Sampah
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}