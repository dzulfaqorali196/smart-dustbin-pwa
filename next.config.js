const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['next-pwa']
  },
  // Mengatasi masalah dengan komponen klien di Vercel
  transpilePackages: ['next-pwa']
};

module.exports = withPWA(nextConfig); 