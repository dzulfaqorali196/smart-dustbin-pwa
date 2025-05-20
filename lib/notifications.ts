/**
 * File helper untuk menangani notifikasi browser di aplikasi Smart Dustbin
 */

/**
 * Memeriksa apakah browser mendukung notifikasi
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Mendapatkan status izin notifikasi saat ini
 */
export const getNotificationPermissionStatus = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Meminta izin notifikasi
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    throw new Error('Notifikasi tidak didukung di browser ini');
  }
  
  return await Notification.requestPermission();
};

/**
 * Menampilkan notifikasi dengan opsi default
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported()) {
    console.warn('Notifikasi tidak didukung di browser ini');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('Izin notifikasi belum diberikan');
    return;
  }
  
  // Opsi default
  const defaultOptions: NotificationOptions = {
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/manifest-icon-192.maskable.png',
    vibrate: [200, 100, 200],
    ...options
  };
  
  try {
    new Notification(title, defaultOptions);
  } catch (error) {
    console.error('Gagal menampilkan notifikasi:', error);
  }
};

/**
 * Mengirim contoh notifikasi
 */
export const sendTestNotification = (): void => {
  if (Notification.permission === 'granted') {
    showNotification('Smart Dustbin', {
      body: 'Ini adalah contoh notifikasi dari Smart Dustbin.',
      icon: '/icons/manifest-icon-192.maskable.png',
      timestamp: Date.now()
    });
  }
};

/**
 * Mengirim notifikasi ketika tempat sampah penuh
 */
export const sendBinFullNotification = (binName: string, fillLevel: number): void => {
  if (Notification.permission === 'granted') {
    showNotification('Tempat Sampah Penuh', {
      body: `${binName} sudah ${fillLevel}% penuh. Segera lakukan pengumpulan sampah.`,
      icon: '/icons/manifest-icon-192.maskable.png',
      tag: `bin-full-${binName}`,
      data: {
        binName,
        fillLevel,
        type: 'bin-full'
      }
    });
  }
};

/**
 * Mengirim notifikasi ketika jadwal pemeliharaan
 */
export const sendMaintenanceNotification = (binName: string, date: Date): void => {
  if (Notification.permission === 'granted') {
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    
    showNotification('Jadwal Pemeliharaan', {
      body: `Pemeliharaan untuk ${binName} dijadwalkan pada ${formattedDate}.`,
      icon: '/icons/manifest-icon-192.maskable.png',
      tag: `maintenance-${binName}`,
      data: {
        binName,
        date: date.toISOString(),
        type: 'maintenance'
      }
    });
  }
};

/**
 * Mengirim notifikasi ketika sampah dikumpulkan
 */
export const sendCollectionNotification = (binName: string): void => {
  if (Notification.permission === 'granted') {
    showNotification('Sampah Dikumpulkan', {
      body: `Sampah di ${binName} telah berhasil dikumpulkan.`,
      icon: '/icons/manifest-icon-192.maskable.png',
      tag: `collection-${binName}`,
      data: {
        binName,
        type: 'collection'
      }
    });
  }
}; 