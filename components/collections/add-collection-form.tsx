'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCollection } from '@/lib/api/collections';
import { FormattedBin } from '@/lib/api/bins';

const formSchema = z.object({
  notes: z.string().optional(),
});

interface AddCollectionFormProps {
  bin: FormattedBin;
  onSuccess?: () => void;
}

export default function AddCollectionForm({ bin, onSuccess }: AddCollectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      await createCollection(
        bin.id,
        bin.fillLevel,
        values.notes || undefined
      );
      
      toast.success('Pengumpulan sampah berhasil dicatat');
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting collection:', error);
      toast.error('Gagal mencatat pengumpulan sampah');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catat Pengumpulan Sampah</CardTitle>
        <CardDescription>
          Catat pengumpulan sampah untuk {bin.name} di {bin.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Level Saat Ini:</span>
              <span className="font-bold text-lg">{bin.fillLevel}%</span>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan tentang pengumpulan ini"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Catat Pengumpulan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 