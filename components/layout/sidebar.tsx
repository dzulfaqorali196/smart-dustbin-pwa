'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 hover:text-white';
  };

  return (
    <aside className="w-64 bg-blue-800 text-white hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold">Smart Dustbin</h2>
        {user && <p className="text-sm opacity-75 mt-2">Halo, {user.email}</p>}
      </div>
      <nav className="mt-6">
        <ul>
          <li>
            <Link href="/" className={`block px-4 py-2 ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/map" className={`block px-4 py-2 ${isActive('/map')}`}>
              Peta
            </Link>
          </li>
          <li>
            <Link href="/dustbins" className={`block px-4 py-2 ${isActive('/dustbins')}`}>
              Tempat Sampah
            </Link>
          </li>
          <li>
            <Link href="/settings" className={`block px-4 py-2 ${isActive('/settings')}`}>
              Pengaturan
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 