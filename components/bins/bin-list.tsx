'use client';

import { useEffect, useState } from 'react';
import { FormattedBin, getAllBins, subscribeToBinsUpdates } from '@/lib/api/bins';
import BinCard from './bin-card';
import { Skeleton } from '@/components/ui/skeleton';

interface BinListProps {
  onSelectBin?: (bin: FormattedBin) => void;
  limit?: number;
  bins?: FormattedBin[];
  isLoading?: boolean;
}

export default function BinList({ onSelectBin, limit, bins: propBins, isLoading: propIsLoading }: BinListProps) {
  const [bins, setBins] = useState<FormattedBin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Jika bins diberikan sebagai prop, gunakan itu
    if (propBins) {
      setBins(limit ? propBins.slice(0, limit) : propBins);
      setIsLoading(false);
      return;
    }
    
    // Jika tidak, lakukan fetch data
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllBins();
        setBins(limit ? data.slice(0, limit) : data);
      } catch (error) {
        console.error('Error loading bins:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Subscribe ke pembaruan hanya jika tidak menggunakan prop bins
    const unsubscribe = subscribeToBinsUpdates((updatedBins) => {
      setBins(limit ? updatedBins.slice(0, limit) : updatedBins);
    });
    
    return () => {
      unsubscribe();
    };
  }, [limit, propBins]);
  
  if (propIsLoading || isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Skeleton key={i} className="h-24 sm:h-36 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (bins.length === 0) {
    return (
      <p className="text-center text-sm sm:text-base text-gray-500 py-4">
        Tidak ada tempat sampah yang ditemukan.
      </p>
    );
  }
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {bins.map((bin) => (
        <BinCard 
          key={bin.id} 
          bin={bin} 
          onClick={() => onSelectBin && onSelectBin(bin)} 
        />
      ))}
    </div>
  );
} 