'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { z } from 'zod';
import Image from 'next/image';

const signupSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[0-9]/, 'Password harus mengandung angka')
    .regex(/[^a-zA-Z0-9]/, 'Password harus mengandung karakter khusus'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'Anda harus menyetujui Syarat dan Ketentuan',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub, error, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<Partial<SignupFormData>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      const validatedData = signupSchema.parse(formData);
      setFormErrors({});
      
      // Register user
      await signUp(validatedData.email, validatedData.password, validatedData.name);
      
      // Redirect to dashboard on success
      router.push('/');
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            errors[error.path[0]] = error.message;
          }
        });
        setFormErrors(errors);
      }
      // Auth errors are handled in the store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Animasi latar belakang */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 dark:opacity-10">
          <div className="absolute top-1/3 -left-8 w-28 h-28 bg-green-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute top-2/3 right-1/4 w-36 h-36 bg-blue-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-44 h-44 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-yellow-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3.5s' }}></div>
        </div>
      </div>

      {/* Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 order-2 md:order-1">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Akun</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Bergabunglah dengan kami untuk lingkungan yang lebih baik</p>
          </div>
          
          {error && (
            <div className="p-3 mb-6 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-3 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200`}
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="youremail@example.com"
                  className={`w-full pl-10 pr-3 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200`}
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200`}
                  value={formData.password || ''}
                  onChange={handleChange}
                  required
                />
                {formErrors.password ? (
                  <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password minimal 8 karakter, harus mengandung angka dan karakter khusus.
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3 py-3 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200`}
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className={`h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300 rounded ${formErrors.terms ? 'border-red-500' : ''}`}
                checked={formData.terms || false}
                onChange={handleChange}
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Saya menyetujui{' '}
                <Link href="/terms" className="text-green-600 dark:text-green-400 hover:underline">
                  Syarat dan Ketentuan
                </Link>{' '}
                dan{' '}
                <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">
                  Kebijakan Privasi
                </Link>
              </label>
            </div>
            {formErrors.terms && (
              <p className="text-xs text-red-500 -mt-2">{formErrors.terms}</p>
            )}
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memuat...</span>
                </div>
              ) : (
                'Buat Akun'
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">atau</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="py-2.5 px-4 flex justify-center items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover-lift"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
                  <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubSignIn}
                className="py-2.5 px-4 flex justify-center items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover-lift"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 2.835c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.42 20 10c0-5.522-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
                GitHub
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sudah punya akun?{' '}
              <Link href="/signin" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Ilustrasi/Gambar */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 relative order-1 md:order-2">
        <div className="max-w-md">
          <Image 
            src="/img/recycling-illustration.svg" 
            alt="Recycling Illustration" 
            width={400} 
            height={400}
            className="drop-shadow-xl animate-float"
            priority
          />
          <div className="mt-8 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Peduli Lingkungan</h2>
            <p className="text-gray-600 dark:text-gray-300">Bergabunglah dengan kami dalam mengelola sampah dengan cerdas untuk masa depan yang lebih berkelanjutan.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 