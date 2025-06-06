'use client';

import Navbar from './navbar';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function Header() {
  const { checkSession } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Periksa session saat mount
    checkSession();
    
    // Deteksi status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial status
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkSession]);

  return (
    <header>
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-1 text-center text-sm">
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
        </div>
      )}
      <Navbar />
    </header>
  );
} 