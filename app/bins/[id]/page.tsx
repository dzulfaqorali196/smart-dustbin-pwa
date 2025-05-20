'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, Edit, RefreshCw, MapPin, Archive, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import untuk komponen peta (agar tidak ada error SSR)
const BinDetailMap = dynamic(() => import('@/components/bin-detail-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
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

  // Fungsi untuk mengambil data tempat sampah
  const fetchBin = async () => {
    try {
      setIsLoading(true);
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
      }
    } catch (error: Error | unknown) {
      console.error('Error fetching bin details:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data tempat sampah');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      router.push('/map');
    } catch (error: Error | unknown) {
      console.error('Error deleting bin:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus tempat sampah');
    }
  };

  // Menentukan warna berdasarkan level pengisian
  const getFillLevelColor = (currentCapacity: number, maxCapacity: number) => {
    const fillPercentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
    if (fillPercentage < 30) return 'bg-green-500';
    if (fillPercentage < 70) return 'bg-orange-500';
    return 'bg-red-500';
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

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-green-700 hover:text-green-800 hover:bg-green-50"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <Button
              onClick={fetchBin}
              className="mt-2 flex items-center text-red-700 hover:text-red-800 bg-white hover:bg-red-50 border border-red-300"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Coba Lagi
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : bin ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Detail Tempat Sampah */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-0 shadow-md bg-white overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl text-gray-800">{bin.name}</CardTitle>
                      {bin.location && (
                        <p className="mt-1 text-gray-600 text-sm">{bin.location}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(() => {
                        const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                        return (
                          <Badge className={`${getFillLevelColor(bin.current_capacity, bin.max_capacity)} text-white`}>
                            {fillPercentage}% Penuh
                          </Badge>
                        );
                      })()}
                      
                      {isUserOwner && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 text-green-700 hover:text-green-800 hover:bg-green-50"
                            onClick={() => router.push(`/bins/${id}/edit`)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-700 hover:text-red-800 hover:bg-red-50"
                            onClick={handleDelete}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Informasi Status</h3>
                      
                      <div className="space-y-4">
                        {(() => {
                          const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                          return (
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Level Pengisian</span>
                                <span className="text-sm font-medium text-gray-700">{fillPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${getFillLevelColor(bin.current_capacity, bin.max_capacity)}`}
                                  style={{ width: `${fillPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })()}
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Kapasitas</span>
                            <span className="text-sm font-medium text-gray-700">{bin.current_capacity} / {bin.max_capacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full bg-blue-500`}
                              style={{ width: `${(bin.current_capacity / bin.max_capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Lokasi</h4>
                            <p className="text-sm text-gray-600">
                              {Number(bin.latitude).toFixed(6)}, {Number(bin.longitude).toFixed(6)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Terakhir Diperbarui</h4>
                            <p className="text-sm text-gray-600">
                              {formatLastUpdated(bin.last_updated)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Archive className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Kapasitas Total</h4>
                            <p className="text-sm text-gray-600">
                              {bin.max_capacity} unit
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Ringkasan</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Status</span>
                          <Badge className={`${bin.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                            {bin.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                        
                        <div className="border-t border-gray-200 my-3"></div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tanggal Dibuat</span>
                            <span className="text-sm font-medium text-gray-700">
                              {new Date(bin.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ID Tempat Sampah</span>
                            <span className="text-sm font-mono text-gray-700">{bin.id.slice(0, 8)}...</span>
                          </div>
                          
                          {(() => {
                            const fillPercentage = calculateFillPercentage(bin.current_capacity, bin.max_capacity);
                            if (fillPercentage > 80) {
                              return (
                                <div className="mt-4 bg-red-50 p-3 rounded-md border border-red-100">
                                  <p className="text-sm text-red-700 font-medium">
                                    Perhatian: Tempat sampah hampir penuh. Segera kosongkan!
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button
                          onClick={fetchBin}
                          className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Perbarui Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Peta */}
            <div className="md:col-span-1">
              <Card className="border-0 shadow-md bg-white h-full overflow-hidden">
                <CardHeader className="border-b border-gray-100 p-4">
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Lokasi Tempat Sampah
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[300px]">
                  {bin && <BinDetailMap bin={bin} />}
                </CardContent>
              </Card>
              
              <div className="mt-4">
                <Link href="/map">
                  <Button className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Lihat di Peta Lengkap
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-3xl text-gray-400 mb-4">¯\_(ツ)_/¯</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Tempat Sampah Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-6">
              Tempat sampah dengan ID tersebut tidak ditemukan atau telah dihapus.
            </p>
            <Link href="/map">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Kembali ke Peta
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
} 