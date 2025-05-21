'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Trash, Plus, Search, RefreshCcw, ChevronLeft, Home } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Bin {
  id: string;
  name: string;
  location: string;
  current_capacity: number;
  max_capacity: number;
  status: string;
  last_updated: string;
  latitude: number;
  longitude: number;
}

export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [filteredBins, setFilteredBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();

  // Mengambil data tempat sampah
  const fetchBins = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setBins(data || []);
      setFilteredBins(data || []);
    } catch (error) {
      console.error('Error fetching bins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efek untuk memuat data awal
  useEffect(() => {
    fetchBins();

    // Setup subscription untuk perubahan real-time
    const subscription = supabase
      .channel('bins-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bins' }, 
        () => fetchBins()
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mencari tempat sampah berdasarkan nama atau lokasi
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBins(bins);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = bins.filter(
        bin => 
          bin.name.toLowerCase().includes(query) || 
          bin.location.toLowerCase().includes(query)
      );
      setFilteredBins(filtered);
    }
  }, [searchQuery, bins]);

  // Menentukan status dan warna badge berdasarkan tingkat pengisian
  const getBinStatusAndColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    
    if (percentage < 30) {
      return { status: 'Rendah', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    } else if (percentage < 70) {
      return { status: 'Sedang', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else {
      return { status: 'Penuh', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  // Format tanggal terakhir diperbarui
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-green-700 hover:text-green-800 hover:bg-green-50 -ml-4 mb-2"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <Home className="w-5 h-5 mr-1" />
              <span>Kembali ke Dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold">Tempat Sampah</h1>
            <p className="text-gray-600">Kelola dan pantau status semua tempat sampah</p>
          </div>
          
          {user && (
            <Button
              onClick={() => router.push('/bins/add')}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tempat Sampah
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari tempat sampah..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="border-green-200 text-green-800"
              onClick={fetchBins}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Perbarui
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-md mb-4">
            <TabsTrigger value="all" className="flex-1">Semua</TabsTrigger>
            <TabsTrigger value="low" className="flex-1">Rendah</TabsTrigger>
            <TabsTrigger value="medium" className="flex-1">Sedang</TabsTrigger>
            <TabsTrigger value="full" className="flex-1">Penuh</TabsTrigger>
          </TabsList>

          {/* All Bins Tab */}
          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredBins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBins.map((bin) => {
                  const { status, color } = getBinStatusAndColor(bin.current_capacity, bin.max_capacity);
                  const fillPercentage = Math.round((bin.current_capacity / bin.max_capacity) * 100);
                  
                  return (
                    <Card key={bin.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-black">{bin.name}</CardTitle>
                            <p className="text-sm text-gray-600">{bin.location}</p>
                          </div>
                          <Badge className={`${color}`}>
                            {status} • {fillPercentage}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Kapasitas</span>
                              <span className="font-medium">{bin.current_capacity}/{bin.max_capacity} liter</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${fillPercentage < 30 ? 'bg-emerald-500' : fillPercentage < 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${fillPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Terakhir diperbarui</span>
                            <span>{formatDate(bin.last_updated)}</span>
                          </div>
                          
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              className="w-full border-green-200 text-green-800 hover:bg-green-50"
                              onClick={() => router.push(`/bins/${bin.id}`)}
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <Trash className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Tidak ada tempat sampah ditemukan</h3>
                <p className="mt-2 text-gray-600">
                  {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Belum ada tempat sampah yang ditambahkan'}
                </p>
                {user && !searchQuery && (
                  <Button
                    onClick={() => router.push('/bins/add')}
                    className="mt-4 bg-green-700 hover:bg-green-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Tempat Sampah
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Low Tab */}
          <TabsContent value="low">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBins
                  .filter(bin => (bin.current_capacity / bin.max_capacity) * 100 < 30)
                  .map((bin) => {
                    const fillPercentage = Math.round((bin.current_capacity / bin.max_capacity) * 100);
                    
                    return (
                      <Card key={bin.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                        <CardHeader className="p-4 bg-gray-50 border-b">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-semibold text-black">{bin.name}</CardTitle>
                              <p className="text-sm text-gray-600">{bin.location}</p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                              Rendah • {fillPercentage}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Kapasitas</span>
                                <span className="font-medium">{bin.current_capacity}/{bin.max_capacity} liter</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-emerald-500"
                                  style={{ width: `${fillPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Terakhir diperbarui</span>
                              <span>{formatDate(bin.last_updated)}</span>
                            </div>
                            
                            <div className="pt-2">
                              <Button 
                                variant="outline" 
                                className="w-full border-green-200 text-green-800 hover:bg-green-50"
                                onClick={() => router.push(`/bins/${bin.id}`)}
                              >
                                Lihat Detail
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* Medium Tab */}
          <TabsContent value="medium">
            {/* Konten untuk tab Medium, sama seperti Low dengan filter berbeda */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBins
                .filter(bin => {
                  const percent = (bin.current_capacity / bin.max_capacity) * 100;
                  return percent >= 30 && percent < 70;
                })
                .map((bin) => {
                  const fillPercentage = Math.round((bin.current_capacity / bin.max_capacity) * 100);
                  
                  return (
                    <Card key={bin.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-black">{bin.name}</CardTitle>
                            <p className="text-sm text-gray-600">{bin.location}</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            Sedang • {fillPercentage}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {/* Konten sama seperti tab lain */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Kapasitas</span>
                              <span className="font-medium">{bin.current_capacity}/{bin.max_capacity} liter</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full bg-amber-500"
                                style={{ width: `${fillPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Terakhir diperbarui</span>
                            <span>{formatDate(bin.last_updated)}</span>
                          </div>
                          
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              className="w-full border-green-200 text-green-800 hover:bg-green-50"
                              onClick={() => router.push(`/bins/${bin.id}`)}
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          {/* Full Tab */}
          <TabsContent value="full">
            {/* Konten untuk tab Full, sama seperti Low dengan filter berbeda */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBins
                .filter(bin => (bin.current_capacity / bin.max_capacity) * 100 >= 70)
                .map((bin) => {
                  const fillPercentage = Math.round((bin.current_capacity / bin.max_capacity) * 100);
                  
                  return (
                    <Card key={bin.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-black">{bin.name}</CardTitle>
                            <p className="text-sm text-gray-600">{bin.location}</p>
                          </div>
                          <Badge className="bg-rose-100 text-rose-800 border-rose-300">
                            Penuh • {fillPercentage}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {/* Konten sama seperti tab lain */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Kapasitas</span>
                              <span className="font-medium">{bin.current_capacity}/{bin.max_capacity} liter</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full bg-rose-500"
                                style={{ width: `${fillPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Terakhir diperbarui</span>
                            <span>{formatDate(bin.last_updated)}</span>
                          </div>
                          
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              className="w-full border-green-200 text-green-800 hover:bg-green-50"
                              onClick={() => router.push(`/bins/${bin.id}`)}
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 