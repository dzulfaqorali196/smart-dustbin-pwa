'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { z } from 'zod';

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
  const { signUp, error, isLoading } = useAuthStore();
  
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Buat Akun</h1>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="youremail@example.com"
              className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
            {formErrors.email && (
              <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className={`w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              value={formData.password || ''}
              onChange={handleChange}
              required
            />
            {formErrors.password ? (
              <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Password minimal 8 karakter, harus mengandung angka dan karakter khusus.
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={`w-full px-3 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              value={formData.confirmPassword || ''}
              onChange={handleChange}
              required
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className={`h-4 w-4 mt-1 text-green-600 focus:ring-green-500 ${formErrors.terms ? 'border-red-500' : ''}`}
              checked={formData.terms || false}
              onChange={handleChange}
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm">
              Saya menyetujui{' '}
              <Link href="/terms" className="text-green-600 hover:underline">
                Syarat dan Ketentuan
              </Link>{' '}
              dan{' '}
              <Link href="/privacy" className="text-green-600 hover:underline">
                Kebijakan Privasi
              </Link>
            </label>
          </div>
          {formErrors.terms && (
            <p className="text-xs text-red-500 -mt-2">{formErrors.terms}</p>
          )}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Buat Akun'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm">
            Sudah punya akun?{' '}
            <Link href="/signin" className="text-green-600 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 