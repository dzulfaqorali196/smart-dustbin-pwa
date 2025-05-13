const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mengatur timeout yang lebih lama untuk generasi halaman statis
  staticPageGenerationTimeout: 300,
  // Mengatur opsi khusus untuk Vercel
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Menambahkan output standalone untuk Vercel
  output: 'standalone',
  // Mengatasi masalah dengan pustaka eksternal server
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
};

module.exports = withPWA(nextConfig); 