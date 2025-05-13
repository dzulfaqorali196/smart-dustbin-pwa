'use client';

import AuthGuard from '@/components/ui/auth-guard';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import Footer from '@/components/layout/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-6 bg-gray-100 dark:bg-gray-900">
            {children}
            <Footer />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
} 