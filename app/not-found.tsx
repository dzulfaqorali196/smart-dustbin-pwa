import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#4CAF50",
};

export const metadata: Metadata = {
  title: "Page Not Found - Smart Dustbin",
  description: "The page you're looking for doesn't exist",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-green-500">404</h1>
        <h2 className="text-3xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <Button asChild className="bg-green-500 hover:bg-green-600">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
} 