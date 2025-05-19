'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/map" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors">
                    Peta
                  </Link>
                  
                  {/* Sign Out Button */}
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut} 
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                  
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-green-700/50 p-0 hover:bg-green-700/80">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-green-800 text-white">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-1">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user.user_metadata?.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Pengaturan</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/signin" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors">
                    Masuk
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-800 hover:bg-green-900 transition-colors"
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
                {/* Mobile Sign Out Button */}
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="p-2 rounded-md text-white hover:bg-green-700"
                  size="icon"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-green-700/50 p-0 hover:bg-green-700/80 mr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-green-800 text-white text-xs">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">{user.user_metadata?.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/map">Peta</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none transition-colors"
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
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-800 hover:bg-green-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Daftar
              </Link>
            </>
          ) : (
            <>
              <div className="px-3 py-2 text-sm font-medium text-green-200">
                Login sebagai: {user.user_metadata?.name || user.email}
              </div>
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/map"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Peta
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Profil
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-green-700 hover:text-red-100 transition-colors"
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