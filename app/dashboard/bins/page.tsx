'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedBin, getAllBins, subscribeToBinsUpdates } from '@/lib/api/bins';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Filter, Gauge, Home, ListFilter, Plus, RefreshCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNotifications } from '@/components/providers/notification-provider';

export default function DashboardBinsPage() {
  const router = useRouter();
  const [bins, setBins] = useState<FormattedBin[]>([]);
  const [filteredBins, setFilteredBins] = useState<FormattedBin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'fillLevel' | 'lastUpdated'>('name');
  const { sendBinFullNotification } = useNotifications();

  // Filter aktif
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    // Memuat data awal
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllBins();
        setBins(data);
        applyFilters(data, searchQuery, activeFilter, sort);
      } catch (error) {
        console.error('Error loading bins:', error);
        toast.error('Gagal memuat data tempat sampah');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Subscribe ke pembaruan real-time
    const unsubscribe = subscribeToBinsUpdates((updatedBins) => {
      setBins(updatedBins);
      applyFilters(updatedBins, searchQuery, activeFilter, sort);
      
      // Cek apakah ada tempat sampah yang hampir penuh
      updatedBins.forEach(bin => {
        if (bin.fillLevel >= 90) {
          sendBinFullNotification(bin.name, bin.fillLevel);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [sendBinFullNotification]);

  // Menerapkan filter dan pencarian ke data
  const applyFilters = (
    data: FormattedBin[],
    query: string,
    filter: 'all' | 'low' | 'medium' | 'high',
    sortBy: 'name' | 'fillLevel' | 'lastUpdated'
  ) => {
    // Filter berdasarkan query pencarian
    let result = data;
    
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(
        bin => bin.name.toLowerCase().includes(lowercaseQuery) || 
               bin.location.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Filter berdasarkan kondisi
    if (filter !== 'all') {
      result = result.filter(bin => {
        switch (filter) {
          case 'low': 
            return bin.fillLevel < 30;
          case 'medium': 
            return bin.fillLevel >= 30 && bin.fillLevel < 70;
          case 'high': 
            return bin.fillLevel >= 70;
          default: 
            return true;
        }
      });
    }
    
    // Sort data
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'fillLevel':
          return b.fillLevel - a.fillLevel;
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredBins(result);
  };

  // Handler saat filter berubah
  useEffect(() => {
    applyFilters(bins, searchQuery, activeFilter, sort);
  }, [searchQuery, activeFilter, sort, bins]);

  const getStatusBadgeClass = (fillLevel: number) => {
    if (fillLevel < 30) {
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    } else if (fillLevel < 70) {
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    } else {
      return 'bg-rose-100 text-rose-800 border border-rose-200';
    }
  };

  const getStatusText = (fillLevel: number) => {
    if (fillLevel < 30) return 'Rendah';
    if (fillLevel < 70) return 'Sedang';
    return 'Tinggi';
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-green-700 hover:text-green-800 hover:bg-green-50 -ml-2 mb-3"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <Home className="w-5 h-5 mr-1" />
            <span>Kembali ke Dashboard</span>
          </Button>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">Tempat Sampah</h1>
              <p className="text-black">Kelola dan pantau semua tempat sampah</p>
            </div>
            <Button 
              asChild
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              <Link href="/bins/add">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tempat Sampah
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Filter dan pencarian */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
            <div className="flex gap-2">
              <Select 
                value={sort} 
                onValueChange={(value) => setSort(value as 'name' | 'fillLevel' | 'lastUpdated')}
              >
                <SelectTrigger className="w-[180px]">
                  <ListFilter className="w-4 h-4 mr-2" />
                  <span>Urutkan</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nama (A-Z)</SelectItem>
                  <SelectItem value="fillLevel">Level Pengisian</SelectItem>
                  <SelectItem value="lastUpdated">Terakhir Diperbarui</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="border-green-200 text-green-800 hover:bg-green-50"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const data = await getAllBins();
                    setBins(data);
                    applyFilters(data, searchQuery, activeFilter, sort);
                    toast.success('Data berhasil diperbarui');
                  } catch {
                    toast.error('Gagal memperbarui data');
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Perbarui
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tab filter berdasarkan level */}
        <Tabs 
          value={activeFilter} 
          onValueChange={(value) => setActiveFilter(value as 'all' | 'low' | 'medium' | 'high')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <TabsList className="w-full grid grid-cols-4 h-12 bg-gray-100 rounded-none p-0 border-b">
            <TabsTrigger 
              value="all" 
              className="rounded-none py-3 text-sm data-[state=active]:bg-white"
            >
              Semua
            </TabsTrigger>
            <TabsTrigger 
              value="low" 
              className="rounded-none py-3 text-sm data-[state=active]:bg-white"
            >
              Rendah (0-30%)
            </TabsTrigger>
            <TabsTrigger 
              value="medium" 
              className="rounded-none py-3 text-sm data-[state=active]:bg-white"
            >
              Sedang (30-70%)
            </TabsTrigger>
            <TabsTrigger 
              value="high" 
              className="rounded-none py-3 text-sm data-[state=active]:bg-white"
            >
              Tinggi ({'>'}70%)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeFilter} className="p-6 mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredBins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBins.map((bin) => (
                  <Link 
                    href={`/bins/${bin.id}`}
                    key={bin.id}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-all border border-gray-200 hover:border-green-200 cursor-pointer h-full">
                      <CardHeader className="border-b bg-gray-50 p-4">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold">{bin.name}</CardTitle>
                            <p className="text-sm text-gray-600">{bin.location}</p>
                          </div>
                          <Badge className={getStatusBadgeClass(bin.fillLevel)}>
                            {getStatusText(bin.fillLevel)} • {bin.fillLevel}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1 flex justify-between">
                              <span>Level Pengisian</span>
                              <span className="font-medium">{bin.fillLevel}%</span>
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  bin.fillLevel < 30
                                    ? 'bg-emerald-500'
                                    : bin.fillLevel < 70
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${bin.fillLevel}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-600">Terakhir diperbarui:</span>
                            <span className="font-medium">
                              {new Date(bin.lastUpdated).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Gauge className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Tidak ada tempat sampah ditemukan</h3>
                <p className="mt-1 text-sm">
                  {searchQuery 
                    ? 'Coba ubah kata kunci pencarian Anda' 
                    : activeFilter !== 'all' 
                      ? 'Tidak ada tempat sampah dengan level ini'
                      : 'Tambahkan tempat sampah pertama Anda'}
                </p>
                {activeFilter === 'all' && !searchQuery && (
                  <Button 
                    asChild
                    className="mt-4 bg-green-700 hover:bg-green-800 text-white"
                  >
                    <Link href="/bins/add">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Tempat Sampah
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 