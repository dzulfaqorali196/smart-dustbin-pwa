'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedBin, getAllBins, subscribeToBinsUpdates } from '@/lib/api/bins';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Gauge, Home, ListFilter, Plus, RefreshCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
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
  }, [sendBinFullNotification, searchQuery, activeFilter, sort]);

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
      return 'bg-emerald-100 text-black border border-emerald-200';
    } else if (fillLevel < 70) {
      return 'bg-amber-100 text-black border border-amber-200';
    } else {
      return 'bg-rose-100 text-black border border-rose-200';
    }
  };

  const getStatusText = (fillLevel: number) => {
    if (fillLevel < 30) return 'Rendah';
    if (fillLevel < 70) return 'Sedang';
    return 'Tinggi';
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 max-w-6xl">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-green-700 hover:text-green-800 hover:bg-green-50 -ml-2 mb-3"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <Home className="w-5 h-5 mr-1" />
            <span>Dashboard</span>
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
                <span className="sm:inline">Tambah Tempat Sampah</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Filter dan pencarian */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 text-black h-4 w-4" />
              <Input
                placeholder="Cari tempat sampah..."
                className="pl-10 text-black placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select 
                value={sort} 
                onValueChange={(value) => setSort(value as 'name' | 'fillLevel' | 'lastUpdated')}
              >
                <SelectTrigger className="sm:w-[180px] text-black bg-white border border-green-200" style={{backgroundColor: 'white'}}>
                  <ListFilter className="w-4 h-4 mr-2 text-black" />
                  <span>Urutkan</span>
                </SelectTrigger>
                <SelectContent sideOffset={4} className="bg-white border border-green-200 shadow-lg" style={{backgroundColor: 'white', backdropFilter: 'none'}}>
                  <SelectItem value="name" className="text-black">Nama (A-Z)</SelectItem>
                  <SelectItem value="fillLevel" className="text-black">Level Pengisian</SelectItem>
                  <SelectItem value="lastUpdated" className="text-black">Terakhir Diperbarui</SelectItem>
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
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-12 bg-gray-50 rounded-none p-0 border-b border-gray-200">
            <TabsTrigger 
              value="all" 
              className="rounded-none py-3 text-sm font-medium text-gray-600 transition-all
              data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:border-b-[3px] data-[state=active]:border-green-700 data-[state=active]:shadow-[inset_0_-1px_0_0_white]
              hover:bg-gray-100 hover:text-green-600"
            >
              Semua
            </TabsTrigger>
            <TabsTrigger 
              value="low" 
              className="rounded-none py-3 text-sm font-medium text-gray-600 transition-all
              data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:border-b-[3px] data-[state=active]:border-emerald-700 data-[state=active]:shadow-[inset_0_-1px_0_0_white]
              hover:bg-gray-100 hover:text-emerald-600"
            >
              Rendah
              <span className="hidden sm:inline"> (0-30%)</span>
            </TabsTrigger>
            <TabsTrigger 
              value="medium" 
              className="rounded-none py-3 text-sm font-medium text-gray-600 transition-all
              data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:border-b-[3px] data-[state=active]:border-amber-700 data-[state=active]:shadow-[inset_0_-1px_0_0_white]
              hover:bg-gray-100 hover:text-amber-600"
            >
              Sedang
              <span className="hidden sm:inline"> (30-70%)</span>
            </TabsTrigger>
            <TabsTrigger 
              value="high" 
              className="rounded-none py-3 text-sm font-medium text-gray-600 transition-all
              data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:border-b-[3px] data-[state=active]:border-rose-700 data-[state=active]:shadow-[inset_0_-1px_0_0_white]
              hover:bg-gray-100 hover:text-rose-600"
            >
              Tinggi
              <span className="hidden sm:inline"> ({'>'}70%)</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeFilter} className="p-4 sm:p-6 mt-6 sm:mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredBins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredBins.map((bin) => (
                  <Link 
                    href={`/bins/${bin.id}`}
                    key={bin.id}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-all border border-gray-200 hover:border-green-200 cursor-pointer h-full">
                      <CardHeader className="border-b bg-gray-50 p-4">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold text-black">{bin.name}</CardTitle>
                            <p className="text-sm text-black">{bin.location}</p>
                          </div>
                          <Badge className={`${getStatusBadgeClass(bin.fillLevel)} hover:shadow-md transition-all hover:scale-105 cursor-pointer`}>
                            {getStatusText(bin.fillLevel)} • {bin.fillLevel}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-black mb-1 flex justify-between">
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
                            <span className="text-black">Terakhir diperbarui:</span>
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
              <div className="text-center py-12 text-black">
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