'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && typeof user !== 'undefined') {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/landing');
      }
    }
  }, [user, isLoading, router]);

  return null;
}