'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { Bell, User, LogOut, Save, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/components/providers/notification-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardSettingsPage() {
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
    return null;
  }
  
  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-black">Pengaturan</h1>
          <p className="text-black">Kelola preferensi dan akun Anda</p>
        </div>
      </div>
      
      {/* Settings Tabs */}
      <Card className="border shadow-sm overflow-hidden">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full flex h-12 bg-gray-50 border-b border-gray-200 p-0 rounded-t-lg">
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
                  className="bg-green-700 hover:bg-green-800 text-white font-medium"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </Button>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Notifications Tab Content */}
          <TabsContent value="notifications" className="m-0 border-t-0 bg-white p-6">
            <div className="space-y-6">
              {/* Browser Notifications */}
              <div className="pb-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-black">Notifikasi Browser</h3>
                    <p className="text-sm text-black max-w-md">
                      Aktifkan notifikasi browser untuk menerima pemberitahuan langsung bahkan saat Anda tidak membuka aplikasi
                    </p>
                  </div>
                  <Button
                    onClick={handleNotificationPermission}
                    disabled={!isSupported}
                    className={
                      permission === 'granted'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-green-700 hover:bg-green-800 text-white'
                    }
                  >
                    {permission === 'granted' ? (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4 mr-2" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                </div>
                {!isSupported && (
                  <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                    <p className="text-sm text-amber-800">
                      Browser Anda tidak mendukung notifikasi. Coba gunakan browser lain seperti Chrome, Firefox, atau Edge.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4 text-black">Preferensi Notifikasi</h3>
                
                {/* Notification Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-black">Notifikasi Tempat Sampah Penuh</Label>
                      <p className="text-sm text-black">
                        Dapatkan pemberitahuan saat tempat sampah hampir penuh
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifyWhenFull}
                      onCheckedChange={(value) => handleSettingChange('notifyWhenFull', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-black">Pemberitahuan Pemeliharaan</Label>
                      <p className="text-sm text-black">
                        Dapatkan pemberitahuan tentang pemeliharaan terjadwal
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifyMaintenance}
                      onCheckedChange={(value) => handleSettingChange('notifyMaintenance', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-black">Pemberitahuan Pengumpulan</Label>
                      <p className="text-sm text-black">
                        Dapatkan pemberitahuan saat tempat sampah dikosongkan
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifyCollections}
                      onCheckedChange={(value) => handleSettingChange('notifyCollections', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-black">Notifikasi Email</Label>
                      <p className="text-sm text-black">
                        Terima pemberitahuan melalui email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 