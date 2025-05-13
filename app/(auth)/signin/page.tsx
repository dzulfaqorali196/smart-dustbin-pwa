'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function SignIn() {
  const router = useRouter();
  const { signIn, error, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Email dan password harus diisi');
      return;
    }

    try {
      await signIn(email, password);
      router.push('/');
    } catch (error) {
      // Error handling is done in auth-store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Masuk</h1>
        
        {(error || formError) && (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
            {formError || error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="youremail@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="ml-2 block text-sm">
                Ingat saya
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
              Lupa password?
            </Link>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm">
            Belum punya akun?{' '}
            <Link href="/signup" className="text-green-600 hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 