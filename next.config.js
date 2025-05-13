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
};

module.exports = withPWA(nextConfig); 