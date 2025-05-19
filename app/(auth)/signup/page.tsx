'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

  const handleTermsChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      terms: checked,
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
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-green-400/10 via-green-50 to-blue-50 dark:from-green-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animasi latar belakang */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-400/30 dark:bg-green-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-400/30 dark:bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-400/30 dark:bg-teal-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 order-2 md:order-1">
        <Card className="w-full max-w-md backdrop-blur-md bg-background/70 dark:bg-background/50 border border-border/50 shadow-xl rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Buat Akun</CardTitle>
            <CardDescription className="text-center">Bergabunglah dengan kami untuk lingkungan yang lebih baik</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="text-sm bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    className={`pl-10 ${formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="youremail@example.com"
                    className={`pl-10 ${formErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className={`pl-10 ${formErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={formData.password || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formErrors.password ? (
                  <p className="text-xs text-red-500">{formErrors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Password minimal 8 karakter, harus mengandung angka dan karakter khusus.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`pl-10 ${formErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-top space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms || false}
                  onCheckedChange={handleTermsChange}
                  className={formErrors.terms ? 'border-red-500 data-[state=checked]:bg-red-500' : ''}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="terms" 
                    className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Saya menyetujui{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Syarat dan Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Kebijakan Privasi
                    </Link>
                  </Label>
                  {formErrors.terms && (
                    <p className="text-xs text-red-500">{formErrors.terms}</p>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300"
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
                  'Daftar'
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-background text-muted-foreground">atau</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
                  <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                onClick={handleGithubSignIn}
                variant="outline"
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 2.835c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.42 20 10c0-5.522-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
                GitHub
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Sudah punya akun?{' '}
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Masuk
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Ilustrasi/Gambar */}
      <div className="md:flex hidden md:w-1/2 items-center justify-center p-8 relative order-1 md:order-2">
        <div className="max-w-md">
          <div className="mb-8 w-36 h-36 mx-auto relative bg-white/20 rounded-2xl p-1.5 shadow-2xl transform hover:rotate-6 transition-all duration-300 hover:shadow-green-500/30">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-inner">
              <span className="text-white text-5xl font-bold drop-shadow-md">SB</span>
            </div>
            
            {/* 3D effect for logo */}
            <div className="absolute -bottom-3 -right-3 w-full h-full rounded-xl bg-teal-700/40 blur-sm -z-10"></div>
          </div>
          
          <Image 
            src="/img/smart-dustbin-illustration.svg" 
            alt="Smart Dustbin Illustration" 
            width={400} 
            height={400}
            className="drop-shadow-xl animate-float"
            priority
          />
          <div className="mt-8 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Smart Dustbin</h2>
            <p className="text-gray-600 dark:text-gray-300">Solusi pengelolaan sampah pintar untuk lingkungan yang lebih bersih dan berkelanjutan.</p>
          </div>
        </div>
      </div>

      {/* Add custom animations to globals.css if not already added */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          33% {
            transform: scale(1.1) translate(40px, -20px);
          }
          66% {
            transform: scale(0.9) translate(-20px, 40px);
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .animate-blob {
          animation: blob 10s infinite alternate;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 