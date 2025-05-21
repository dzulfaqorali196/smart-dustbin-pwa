'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Ekstrak inisial dari nama pengguna atau email
  const getUserInitials = () => {
    if (!user) return "?";
    
    if (user.user_metadata?.name) {
      const nameParts = user.user_metadata.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return "U";
  };

  // Cek apakah komponen sudah di-mount (untuk mencegah error hydration)
  if (!mounted) return null;

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-lg">Smart Dustbin</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 hover:shadow-md transition-all duration-200">
                    Dashboard
                  </Link>
                  <Link href="/map" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 hover:shadow-md transition-all duration-200">
                    Peta
                  </Link>
                  
                  {/* Profil Link */}
                  <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profil
                  </Link>
                  
                  {/* Sign Out Button */}
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut} 
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-800 hover:shadow-md transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                  
                  {/* User Avatar - direct link to profile */}
                  <Link href="/profile">
                    <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-white transition-all">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-green-800 text-white">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signin" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 hover:shadow-md transition-all duration-200">
                    Masuk
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-800 hover:bg-green-900 hover:shadow-md transition-all duration-200"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <>
                {/* Mobile Profile Link */}
                <Link 
                  href="/profile" 
                  className="p-2 rounded-md text-white hover:bg-green-700 hover:shadow-md transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                </Link>
                
                {/* Mobile Sign Out Button */}
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="p-2 rounded-md text-white hover:bg-green-700 hover:shadow-md transition-all duration-200"
                  size="icon"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
                
                {/* Mobile Avatar - direct link to profile */}
                <Link href="/profile">
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-white transition-all">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-green-800 text-white text-xs">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 hover:shadow-md focus:outline-none transition-all duration-200"
            >
              <span className="sr-only">Buka menu utama</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-green-700 to-green-800">
          {!user ? (
            <>
              <Link
                href="/signin"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-800 hover:bg-green-900 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Daftar
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/map"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Peta
              </Link>
              <Link
                href="/bins"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Tempat Sampah
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Pengaturan
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Profil
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600 hover:shadow-md transition-all duration-200"
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 