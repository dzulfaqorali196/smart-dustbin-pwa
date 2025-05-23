'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { ChevronLeft, Gauge, Home, ListFilter, Plus, RefreshCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const router = useRouter();
  const [bins, setBins] = useState<Bin[]>([]);
  const [filteredBins, setFilteredBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'fillLevel' | 'lastUpdated'>('name');
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

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

  // Menerapkan filter dan pengurutan
  useEffect(() => {
    // Filter berdasarkan query pencarian
    let result = bins;
    
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        bin => bin.name.toLowerCase().includes(lowercaseQuery) || 
               bin.location?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Filter berdasarkan kondisi
    if (activeFilter !== 'all') {
      result = result.filter(bin => {
        const fillLevel = Math.round((bin.current_capacity / bin.max_capacity) * 100);
        switch (activeFilter) {
          case 'low': 
            return fillLevel < 30;
          case 'medium': 
            return fillLevel >= 30 && fillLevel < 70;
          case 'high': 
            return fillLevel >= 70;
          default: 
            return true;
        }
      });
    }
    
    // Sort data
    result = [...result].sort((a, b) => {
      const fillLevelA = Math.round((a.current_capacity / a.max_capacity) * 100);
      const fillLevelB = Math.round((b.current_capacity / b.max_capacity) * 100);
      
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'fillLevel':
          return fillLevelB - fillLevelA;
        case 'lastUpdated':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredBins(result);
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

  // Format tanggal terakhir diperbarui
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <SelectTrigger className="sm:w-[180px] text-black bg-white border border-gray-200" style={{backgroundColor: 'white', backdropFilter: 'none'}}>
                  <ListFilter className="w-4 h-4 mr-2 text-black" />
                  <span>Urutkan</span>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg" style={{backgroundColor: 'white', backdropFilter: 'none'}}>
                  <SelectItem value="name" className="text-black">Nama (A-Z)</SelectItem>
                  <SelectItem value="fillLevel" className="text-black">Level Pengisian</SelectItem>
                  <SelectItem value="lastUpdated" className="text-black">Terakhir Diperbarui</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="border-green-200 text-green-800 hover:bg-green-50 bg-white"
                onClick={fetchBins}
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
                {filteredBins.map((bin) => {
                  const fillPercentage = Math.round((bin.current_capacity / bin.max_capacity) * 100);
                  
                  return (
                    <Link 
                      href={`/bins/${bin.id}`}
                      key={bin.id}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-all border border-gray-200 hover:border-green-200 cursor-pointer h-full">
                        <CardHeader className="border-b bg-gray-50 p-4">
                          <div className="flex justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold text-black">{bin.name}</CardTitle>
                              <p className="text-sm text-black">{bin.location || "Auto-created location"}</p>
                            </div>
                            <Badge className={`${getStatusBadgeClass(fillPercentage)} hover:shadow-md transition-all hover:scale-105 cursor-pointer`}>
                              {getStatusText(fillPercentage)} • {fillPercentage}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-black mb-1 flex justify-between">
                                <span>Level Pengisian</span>
                                <span className="font-medium">{fillPercentage}%</span>
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    fillPercentage < 30
                                      ? 'bg-emerald-500'
                                      : fillPercentage < 70
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${fillPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm mt-2">
                              <span className="text-black">Terakhir diperbarui:</span>
                              <span className="font-medium text-gray-800">
                                {formatDate(bin.last_updated)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
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