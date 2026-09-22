import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (mock/showcase thumbnails)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Supabase Storage (production thumbnails)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
