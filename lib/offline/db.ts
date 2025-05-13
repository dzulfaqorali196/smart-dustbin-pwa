import { openDB, DBSchema } from 'idb';
import { Bin, Alert, Collection } from '@/types/models';

// Interface untuk pending updates
interface PendingUpdate {
  id?: string;
  url: string;
  method: string;
  payload: unknown;
  timestamp: number;
}

interface SmartDustbinDB extends DBSchema {
  bins: {
    key: string;
    value: Bin;
    indexes: { 'by-status': string };
  };
  alerts: {
    key: string;
    value: Alert;
    indexes: { 'by-status': string };
  };
  collections: {
    key: string;
    value: Collection;
    indexes: { 'by-date': string };
  };
  pendingUpdates: {
    key: string;
    value: PendingUpdate;
  };
}

export const dbPromise = openDB<SmartDustbinDB>('smart-dustbin-db', 1, {
  upgrade(db) {
    // Create stores for data types
    const binStore = db.createObjectStore('bins', { keyPath: 'id' });
    binStore.createIndex('by-status', 'status');
    
    const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
    alertStore.createIndex('by-status', 'status');
    
    const collectionStore = db.createObjectStore('collections', { keyPath: 'id' });
    collectionStore.createIndex('by-date', 'collected_at');
    
    db.createObjectStore('pendingUpdates', { 
      keyPath: 'id',
      autoIncrement: true 
    });
  },
});

export const offlineDB = {
  // Get all bins
  async getAllBins(): Promise<Bin[]> {
    const db = await dbPromise;
    return db.getAll('bins');
  },
  
  // Add or update a bin
  async saveBin(bin: Bin): Promise<string> {
    const db = await dbPromise;
    return db.put('bins', bin);
  },
  
  // Add a pending update for when online
  async addPendingUpdate(url: string, method: string, payload: unknown): Promise<IDBValidKey> {
    const db = await dbPromise;
    return db.add('pendingUpdates', {
      url,
      method,
      payload,
      timestamp: Date.now(),
    });
  },
  
  // Process pending updates when back online
  async processPendingUpdates(): Promise<void> {
    const db = await dbPromise;
    const updates = await db.getAll('pendingUpdates');
    
    for (const update of updates) {
      try {
        await fetch(update.url, {
          method: update.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update.payload),
        });
        
        // If successful, remove from pending
        await db.delete('pendingUpdates', update.id!);
      } catch (error) {
        console.error('Failed to process update:', error);
      }
    }
  }
  
  // Add more methods as needed for other data types
}; 