'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
  Loader2,
  MapPin,
  Save,
  Trash2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { toast } from 'sonner';

// Schema validasi form
const editBinSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus minimal 3 karakter' }),
  location: z.string().min(3, { message: 'Lokasi harus minimal 3 karakter' }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  max_capacity: z.coerce.number().positive({ message: 'Kapasitas harus lebih dari 0' }),
  current_capacity: z.coerce.number().min(0, { message: 'Kapasitas saat ini tidak boleh negatif' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  notes: z.string().optional(),
});

type EditBinFormData = z.infer<typeof editBinSchema>;

// Interface untuk data bin
interface Bin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  current_capacity: number;
  status: string;
  last_updated: string;
  created_at: string;
  user_id: string | null;
  location: string | null;
}

export default function EditBinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [bin, setBin] = useState<Bin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [mounted, setMounted] = useState(false);

  const form = useForm<EditBinFormData>({
    resolver: zodResolver(editBinSchema),
    defaultValues: {
      name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      max_capacity: 100,
      current_capacity: 0,
      status: 'ACTIVE',
      notes: '',
    },
  });

  // Handle mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi untuk mengambil data bin
  const fetchBin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setBin(data as Bin);
        
        // Cek ownership
        if (user) {
          const isOwner = user.id === data.user_id;
          setIsUserOwner(isOwner);
          
          if (!isOwner) {
            setError('Anda tidak memiliki akses untuk mengedit tempat sampah ini');
            return;
          }
        }
        
        // Set form values
        form.reset({
          name: data.name,
          location: data.location || '',
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          max_capacity: data.max_capacity,
          current_capacity: data.current_capacity,
          status: data.status as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
          notes: '',
        });
      }
    } catch (error: Error | unknown) {
      console.error('Error fetching bin:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, form]);

  // Load data saat komponen dimuat
  useEffect(() => {
    if (mounted && id) {
      fetchBin();
    }
  }, [mounted, id, fetchBin]);

  // Redirect jika tidak login
  useEffect(() => {
    if (mounted && !user) {
      router.push('/signin');
    }
  }, [mounted, user, router]);

  // Handle form submission
  const onSubmit = async (values: EditBinFormData) => {
    if (!bin || !user || !isUserOwner) {
      toast.error('Anda tidak memiliki akses untuk mengedit tempat sampah ini');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validasi kapasitas
      if (values.current_capacity > values.max_capacity) {
        toast.error('Kapasitas saat ini tidak boleh melebihi kapasitas maksimum');
        return;
      }
      
      const { error } = await supabase
        .from('bins')
        .update({
          name: values.name,
          location: values.location,
          latitude: values.latitude,
          longitude: values.longitude,
          max_capacity: values.max_capacity,
          current_capacity: values.current_capacity,
          status: values.status,
          last_updated: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Tempat sampah berhasil diperbarui');
      router.push(`/bins/${id}`);
    } catch (error: Error | unknown) {
      console.error('Error updating bin:', error);
      toast.error('Gagal memperbarui tempat sampah: ' + (error instanceof Error ? error.message : 'Terjadi kesalahan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!bin || !user || !isUserOwner) {
      toast.error('Anda tidak memiliki akses untuk menghapus tempat sampah ini');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus tempat sampah ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bins')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Tempat sampah berhasil dihapus');
      router.push('/dashboard/bins');
    } catch (error: Error | unknown) {
      console.error('Error deleting bin:', error);
      toast.error('Gagal menghapus tempat sampah: ' + (error instanceof Error ? error.message : 'Terjadi kesalahan'));
    }
  };

  // Calculate fill percentage
  const getFillPercentage = () => {
    if (!bin) return 0;
    return Math.round((bin.current_capacity / bin.max_capacity) * 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-green-600" />
          <p className="text-gray-600 font-medium">Memuat data tempat sampah...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-rose-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={fetchBin} className="bg-green-600 hover:bg-green-700">
              Coba Lagi
            </Button>
            <br />
            <Link href="/dashboard/bins">
              <Button variant="outline">Kembali ke Daftar Tempat Sampah</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bin || !isUserOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-rose-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">
            Anda tidak memiliki akses untuk mengedit tempat sampah ini.
          </p>
          <Link href="/dashboard/bins">
            <Button className="bg-green-600 hover:bg-green-700">
              Kembali ke Daftar Tempat Sampah
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-white/80"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">ID:</span>
              <span className="text-sm font-mono bg-gray-100 text-gray-800 px-2 pt-1.4 rounded">
                {bin.id}
              </span>
            </div>
          </div>

          {/* Title Card */}
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Archive className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Edit Tempat Sampah
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Perbarui informasi untuk {bin.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(bin.status)} border px-3 py-1.5`}>
                    {bin.status === 'ACTIVE' ? 'Aktif' : bin.status === 'INACTIVE' ? 'Tidak Aktif' : 'Pemeliharaan'}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1.5">
                    {getFillPercentage()}% Penuh
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Form */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Informasi Dasar</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Nama Tempat Sampah</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Contoh: Tempat Sampah Taman A" 
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Lokasi</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Contoh: Di depan Gedung A" 
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Location Coordinates */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Koordinat Lokasi</h3>
                        
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCoordinates(!showCoordinates)}
                        className="text-gray-800"
                      >
                        {showCoordinates ? <EyeOff className="w-4 h-4 mr-1 text-gray-800" /> : <Eye className="w-4 h-4 mr-1 text-gray-800" />}
                        {showCoordinates ? 'Sembunyikan' : 'Tampilkan'}
                      </Button>
                    </div>
                    
                    {showCoordinates && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Latitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="any" 
                                  placeholder="-6.175110"
                                  className="border-gray-300 text-gray-800 focus:border-blue-500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Rentang: -90 sampai 90
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Longitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="any" 
                                  placeholder="106.865036"
                                  className="border-gray-300 text-gray-800 focus:border-blue-500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Rentang: -180 sampai 180
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Capacity Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                      <Archive className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Pengaturan Kapasitas</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="max_capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Kapasitas Maksimum (liter)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Kapasitas total tempat sampah
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="current_capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Kapasitas Saat Ini (liter)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Level pengisian saat ini
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Capacity Warning */}
                    {form.watch('current_capacity') > form.watch('max_capacity') && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Kapasitas saat ini tidak boleh melebihi kapasitas maksimum.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Status Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Status Operasional</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Status Tempat Sampah</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            {(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const).map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={status}
                                  value={status}
                                  checked={field.value === status}
                                  onChange={() => field.onChange(status)}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <Label 
                                  htmlFor={status} 
                                  className={`cursor-pointer px-3 py-2 rounded-lg border-2 transition-colors ${
                                    field.value === status 
                                      ? getStatusColor(status).replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-')
                                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                  }`}
                                >
                                  {status === 'ACTIVE' ? 'Aktif' : status === 'INACTIVE' ? 'Tidak Aktif' : 'Pemeliharaan'}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormDescription>
                            Pilih status operasional tempat sampah
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/bins/${id}`)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                    >
                      Batal
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 px-6 py-3"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}