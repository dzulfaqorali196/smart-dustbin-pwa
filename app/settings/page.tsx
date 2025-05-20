'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { Bell, User, LogOut, Save, ChevronLeft, Home, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/components/providers/notification-provider';

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    sendTestNotification 
  } = useNotifications();
  const [settings, setSettings] = useState({
    notifyWhenFull: true,
    notifyMaintenance: true,
    notifyCollections: true,
    emailNotifications: true
  });
  
  // Form untuk profile
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  // Efek untuk memuat data user dan status notifikasi
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.user_metadata?.name || '',
        email: user.email || ''
      });
    }
    
    // Cek apakah setting tersimpan di localStorage
    const savedSettings = localStorage.getItem('dustbin_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [user]);
  
  // Fungsi untuk mengubah setting
  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Simpan ke localStorage
      localStorage.setItem('dustbin_settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };
  
  // Fungsi untuk memperbarui profil
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Gunakan fungsi updateProfile dari auth-store untuk sinkronisasi data
      await updateProfile({ name: profileForm.name });
      
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fungsi untuk keluar
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Gagal keluar dari aplikasi');
    }
  };
  
  // Fungsi untuk mengelola notifikasi
  const handleNotificationPermission = async () => {
    if (!isSupported) {
      toast.error('Browser Anda tidak mendukung notifikasi');
      return;
    }

    if (permission === 'granted') {
      // Jika sudah diizinkan, tampilkan notifikasi contoh
      sendTestNotification();
      
      toast.info(
        'Untuk menonaktifkan notifikasi, Anda perlu mengubahnya di pengaturan browser',
        { duration: 5000 }
      );
      
      return;
    }

    try {
      const newPermission = await requestPermission();
      
      if (newPermission === 'granted') {
        toast.success('Notifikasi berhasil diaktifkan!');
        sendTestNotification();
      } else if (newPermission === 'denied') {
        toast.error('Izin notifikasi ditolak oleh browser');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Terjadi kesalahan saat meminta izin notifikasi');
    }
  };
  
  if (!user) {
    router.push('/signin');
    return null;
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex flex-col space-y-6">
        {/* Header dengan tombol kembali */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm border border-gray-200">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-green-700 hover:text-green-800 hover:bg-green-50 -ml-2 mb-3"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <Home className="w-5 h-5 mr-1" />
            <span>Kembali ke Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-black">Pengaturan</h1>
          <p className="text-black">Kelola preferensi dan akun Anda</p>
        </div>
        
        {/* Settings Tabs - fix styling */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="w-full flex h-12 bg-gray-100 border-b border-gray-200 p-0 rounded-t-lg">
              <TabsTrigger 
                value="account" 
                className="flex-1 h-full rounded-none text-black font-medium data-[state=active]:bg-white data-[state=active]:border-r data-[state=active]:border-b-0 data-[state=active]:border-gray-200 border-r border-gray-200"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex-1 h-full rounded-none text-black font-medium data-[state=active]:bg-white data-[state=active]:border-b-0"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifikasi
              </TabsTrigger>
            </TabsList>
          
            {/* Account Tab Content */}
            <TabsContent value="account" className="m-0 border-t-0 bg-white p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama Anda"
                    className="border-gray-300 focus:border-green-500 bg-white/90 text-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">Email</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    readOnly
                    className="bg-gray-200 border-gray-300 text-black"
                  />
                  <p className="text-sm text-black">
                    Email tidak dapat diubah
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isLoading}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50 bg-white/80"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Notifications Tab Content */}
            <TabsContent value="notifications" className="m-0 border-t-0 bg-white p-6">
              <div className="space-y-6 divide-y divide-gray-200">
                <div className="flex items-center justify-between pb-5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-black">Notifikasi Email</Label>
                    <p className="text-sm text-black">
                      Terima notifikasi melalui email
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-black">Tempat Sampah Penuh</Label>
                    <p className="text-sm text-black">
                      Notifikasi ketika tempat sampah hampir penuh
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifyWhenFull}
                    onCheckedChange={(checked) => handleSettingChange('notifyWhenFull', checked)}
                    disabled={permission !== 'granted'}
                  />
                </div>
                
                <div className="flex items-center justify-between py-5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-black">Pemeliharaan</Label>
                    <p className="text-sm text-black">
                      Notifikasi terkait pemeliharaan tempat sampah
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifyMaintenance}
                    onCheckedChange={(checked) => handleSettingChange('notifyMaintenance', checked)}
                    disabled={permission !== 'granted'}
                  />
                </div>
                
                <div className="flex items-center justify-between py-5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-black">Pengumpulan Sampah</Label>
                    <p className="text-sm text-black">
                      Notifikasi ketika sampah telah dikumpulkan
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifyCollections}
                    onCheckedChange={(checked) => handleSettingChange('notifyCollections', checked)}
                    disabled={permission !== 'granted'}
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4">
                <Button 
                  className={`w-full py-6 ${
                    permission === 'granted'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-green-700 hover:bg-green-800'
                  } text-white`}
                  onClick={handleNotificationPermission}
                  disabled={!isSupported || permission === 'denied'}
                >
                  {permission === 'granted' ? (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Kelola Notifikasi Browser
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Aktifkan Notifikasi Browser
                    </>
                  )}
                </Button>
                
                {permission === 'granted' && (
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Notifikasi aktif. Anda akan menerima pemberitahuan dari Smart Dustbin.
                  </p>
                )}
                
                {permission === 'denied' && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    Notifikasi diblokir. Anda perlu mengubah izin notifikasi di pengaturan browser.
                  </p>
                )}
                
                {!isSupported && (
                  <p className="mt-2 text-sm text-amber-600 text-center">
                    Browser Anda tidak mendukung fitur notifikasi.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 