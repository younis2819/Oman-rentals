import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // 1. Image Optimization Config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Allow Supabase Storage
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // 👈 ADD THIS to fix the error
      },
    ],
    // ⚠️ Uncomment these only when building for Mobile App (Capacitor)
    // unoptimized: true, 
  },

  // ⚠️ Uncomment this only when building for Mobile App
  // output: 'export',
};

export default nextConfig;