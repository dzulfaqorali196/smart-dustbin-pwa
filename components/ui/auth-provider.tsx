'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    // Cek session saat komponen di-mount
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
} 