/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [
      "qujgsyngpismiyphgkip.supabase.co", 
      "qujgsyngpismiyphgkip.supabase.in",
      "storage.googleapis.com"
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
};

module.exports = nextConfig;