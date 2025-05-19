'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = harus login, false = tidak boleh login (sudah login)
}

export default function AuthGuard({ 
  children, 
  requireAuth = true
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkSession, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle server-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [checkSession, isMounted]);

  useEffect(() => {
    if (!isMounted || isChecking || isLoading) return;

    // Jika memerlukan auth tapi user tidak login
    if (requireAuth && !user) {
      router.push('/signin?redirect=' + encodeURIComponent(pathname || ''));
    }
    
    // Jika tidak memerlukan auth (halaman login/signup) tapi user sudah login
    if (!requireAuth && user) {
      router.push('/');
    }
  }, [requireAuth, user, isChecking, isLoading, router, pathname, isMounted]);

  // Jika belum dimount, jangan tampilkan apapun untuk menghindari hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Menampilkan loading saat memeriksa auth
  if (isChecking || isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-green-300 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Memeriksa otentikasi...</p>
      </div>
    );
  }

  // Jika auth sudah diperiksa dan sesuai dengan requireAuth
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Fallback, jika ada kasus lain, tidak render apapun (loading)
  return null;
} 