import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
      <div className="max-w-md w-full flex flex-col items-center">
        <div className="mb-8 relative w-24 h-24 md:w-32 md:h-32">
          {/* Placeholder untuk logo, ganti dengan logo sesungguhnya nanti */}
          <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">SB</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Smart Dustbin PWA</h1>
        <p className="text-base md:text-lg mb-10 text-center text-gray-600 dark:text-gray-300">
          Real-time monitoring system for smart waste management
        </p>
        
        <div className="flex gap-4 w-full max-w-xs">
          <Link
            href="/signin"
            className="flex-1 px-4 py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 px-4 py-3 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-center text-gray-500">
          <p>Version 1.0.0</p>
          <p className="mt-2">© 2024 Smart Dustbin System</p>
        </div>
      </div>
    </main>
  );
}
