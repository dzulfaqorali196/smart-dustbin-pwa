'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardDustbinsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/bins');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Mengalihkan ke halaman tempat sampah...</p>
      </div>
    </div>
  );
} 