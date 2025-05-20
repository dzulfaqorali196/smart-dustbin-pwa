'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Mail, User as UserIcon, Calendar, Clock, Shield, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, signOut, updateProfile } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    if (user) {
      // Nama pengguna diambil dari user_metadata yang sudah di-override dengan data dari tabel profiles
      // sehingga perubahan nama akan dipertahankan meskipun user logout dan login kembali
      setName(user.user_metadata?.name || '');
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      // Data profil akan disimpan di user_metadata dan juga di tabel profiles
      // untuk memastikan perubahan tetap ada setelah login ulang
      await updateProfile({ name });
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setIsUpdating(false);
    }
  };

  // Ekstrak inisial dari nama pengguna atau email
  const getUserInitials = () => {
    if (!user) return "?";
    
    if (user.user_metadata?.name) {
      const nameParts = user.user_metadata.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return "U";
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Profil</h1>
          <Card className="border-0 shadow-md">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-xl text-gray-800">Memuat data...</CardTitle>
              <CardDescription className="text-gray-500">Silakan tunggu sebentar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const createdAt = user.created_at ? new Date(user.created_at) : new Date();
  const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
          <Button asChild variant="ghost" className="flex items-center gap-1 text-green-700 hover:text-green-800 hover:bg-green-50">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Card Profil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 shadow-md overflow-hidden bg-white">
              <div className="h-32 bg-gradient-to-r from-green-600 to-green-700"></div>
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-16 left-6 border-4 border-white rounded-full shadow-lg">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-3xl bg-green-700 text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="mt-20 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.user_metadata?.name || 'Pengguna'}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {user.email}
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="flex gap-2 items-center bg-red-600 hover:bg-red-700 text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Card Informasi Akun */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <UserIcon className="w-5 h-5 text-green-600" />
                  Informasi Akun
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Informasi dasar tentang akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Nama</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Masukkan nama Anda"
                    className="border-gray-300 focus:border-green-500 text-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input 
                    id="email" 
                    value={user.email || ''} 
                    disabled
                    className="bg-gray-100 text-gray-600 border-gray-300"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    ID: {user.id.substring(0, 8)}...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Card Detail Akun */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Shield className="w-5 h-5 text-green-600" />
                  Detail Akun
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Informasi tambahan tentang akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 font-medium">Tanggal Pendaftaran</span>
                    </div>
                    <span className="font-medium text-gray-800">{format(createdAt, 'dd MMMM yyyy')}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 font-medium">Login Terakhir</span>
                    </div>
                    <span className="font-medium text-gray-800">{format(lastSignInAt, 'dd MMMM yyyy, HH:mm')}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 font-medium">Metode Login</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {user.app_metadata?.provider === 'google' ? 'Google' : 
                        user.app_metadata?.provider === 'github' ? 'GitHub' : 
                        'Email & Password'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 