'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isNotificationSupported, 
  requestNotificationPermission,
  sendTestNotification,
  sendBinFullNotification,
  sendMaintenanceNotification,
  sendCollectionNotification
} from '@/lib/notifications';
import { toast } from 'sonner';

// Menambahkan type declaration untuk mengatasi properti yang tidak ada di TypeScript
type NotificationConstructorWithPermissionChange = {
  readonly permission: NotificationPermission;
  onpermissionchange: ((this: Notification, ev: Event) => unknown) | null;
  new(title: string, options?: NotificationOptions): Notification;
  requestPermission(): Promise<NotificationPermission>;
};

type NotificationContextType = {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<NotificationPermission>;
  sendTestNotification: () => void;
  sendBinFullNotification: (binName: string, fillLevel: number) => void;
  sendMaintenanceNotification: (binName: string, date: Date) => void;
  sendCollectionNotification: (binName: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Periksa dukungan notifikasi
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Tambahkan listener untuk perubahan izin (jika browser mendukung)
      if ('onpermissionchange' in Notification) {
        const handlePermissionChange = () => {
          setPermission(Notification.permission);
        };
        
        // Menggunakan type assertion untuk mengatasi type error
        const NotificationWithChange = Notification as unknown as NotificationConstructorWithPermissionChange;
        NotificationWithChange.onpermissionchange = handlePermissionChange;
        
        return () => {
          NotificationWithChange.onpermissionchange = null;
        };
      }
    } else {
      setPermission('unsupported');
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Browser Anda tidak mendukung notifikasi');
      return 'denied';
    }
    
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Terjadi kesalahan saat meminta izin notifikasi');
      return 'denied';
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isSupported,
        permission,
        requestPermission,
        sendTestNotification,
        sendBinFullNotification,
        sendMaintenanceNotification,
        sendCollectionNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
} 