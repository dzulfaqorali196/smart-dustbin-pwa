'use client';

import { useEffect } from 'react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Menambahkan efek animasi saat halaman dimuat
  useEffect(() => {
    // Menambahkan kelas untuk animasi fade-in pada body
    document.body.classList.add('animate-fadeIn');
    document.body.classList.add('marketing-layout');
    
    return () => {
      document.body.classList.remove('animate-fadeIn');
      document.body.classList.remove('marketing-layout');
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}