'use client';

import AuthGuard from '@/components/ui/auth-guard';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Menambahkan efek animasi saat halaman dimuat
  useEffect(() => {
    // Menambahkan kelas untuk animasi fade-in pada body
    document.body.classList.add('animate-fadeIn');
    
    return () => {
      document.body.classList.remove('animate-fadeIn');
    };
  }, []);
  
  return (
    <AuthGuard requireAuth={false}>
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {children}
      </main>
    </AuthGuard>
  );
} 