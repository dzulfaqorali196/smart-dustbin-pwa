'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-lg">Smart Dustbin</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Dashboard
                  </Link>
                  <Link href="/map" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Peta
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 bg-blue-800"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Masuk
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 bg-blue-800"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 hover:text-white focus:outline-none"
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                Dashboard
              </Link>
              <Link
                href="/map"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                Peta
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 bg-blue-800"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 bg-blue-800"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 