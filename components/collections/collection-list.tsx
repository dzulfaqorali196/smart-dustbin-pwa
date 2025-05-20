'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { FormattedCollection, getAllCollections, getCollectionsByBin } from '@/lib/api/collections';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionListProps {
  binId?: string;
  limit?: number;
}

export default function CollectionList({ binId, limit = 5 }: CollectionListProps) {
  const [collections, setCollections] = useState<FormattedCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        let data: FormattedCollection[];
        
        if (binId) {
          data = await getCollectionsByBin(binId, limit);
        } else {
          data = await getAllCollections(limit);
        }
        
        setCollections(data);
      } catch (error) {
        console.error('Error loading collections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
  }, [binId, limit]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (collections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500 py-4">
            Belum ada riwayat pengumpulan sampah.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {collections.map((collection) => (
        <Card key={collection.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className="w-2 h-full min-h-24 bg-green-500 mr-4"></div>
              <div className="flex-1 py-4 pr-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{collection.binName}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(collection.collectedAt), { 
                      addSuffix: true,
                      locale: id
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{collection.binLocation}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">
                    Level sebelumnya: <span className="font-medium">{collection.fillLevelBefore}%</span>
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Terkumpul
                  </span>
                </div>
                {collection.notes && (
                  <p className="mt-2 text-sm text-gray-600 border-t pt-2">
                    {collection.notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 