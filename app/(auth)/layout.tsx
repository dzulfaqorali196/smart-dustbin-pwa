'use client';

import AuthGuard from '@/components/ui/auth-guard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={false}>
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </AuthGuard>
  );
} 