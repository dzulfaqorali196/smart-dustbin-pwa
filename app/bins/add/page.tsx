'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ChevronLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Skema validasi form
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus minimal 3 karakter' }),
  location: z.string().min(3, { message: 'Lokasi harus minimal 3 karakter' }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  max_capacity: z.coerce.number().positive(),
});

// Definisikan tipe yang dihasilkan dari schema
type FormValues = z.infer<typeof formSchema>;

export default function AddBinPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect jika tidak login
    if (mounted && !user) {
      router.push('/signin');
    }
  }, [user, router, mounted]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      max_capacity: 100,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('bins')
        .insert({
          name: values.name,
          location: values.location,
          latitude: values.latitude,
          longitude: values.longitude,
          max_capacity: values.max_capacity,
          user_id: user?.id,
          current_capacity: 0,
          status: 'ACTIVE',
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      toast.success(
        'Tempat sampah berhasil ditambahkan dengan status aktif!', 
        {
          description: 'Tempat sampah siap untuk monitoring real-time',
          duration: 4000,
        }
      );
      
      // Redirect ke halaman peta atau daftar bins
      router.push('/dashboard/bins');
    } catch (error: Error | unknown) {
      console.error('Error adding bin:', error);
      toast.error('Gagal menambahkan tempat sampah: ' + (error instanceof Error ? error.message : 'Terjadi kesalahan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilkan loading state atau null selama pengecekan auth
  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-green-700 hover:text-green-800 hover:bg-green-50 -ml-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Kembali
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center text-xl">
            <Plus className="w-5 h-5 mr-2 text-green-700" />
            Tambah Tempat Sampah Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Tempat Sampah</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Tempat Sampah Taman" {...field} />
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
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Di depan Gedung A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas Maksimum (liter)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nilai default: 100 liter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Info Card */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Status Tempat Sampah</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Tempat sampah akan dibuat dengan status <strong>AKTIF</strong> dan siap untuk monitoring real-time.
                    </p>
                    <ul className="text-sm text-green-600 mt-2 list-disc list-inside">
                      <li>Dapat menerima data dari sensor IoT</li>
                      <li>Ditampilkan di peta dan dashboard</li>
                      <li>Dapat mengirim notifikasi</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-green-700 hover:bg-green-800"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Menambahkan...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Tambah Tempat Sampah</span>
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}