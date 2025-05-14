/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

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
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'es', 'de'],
    localeDetection: true,
  },
};

module.exports = nextConfig; 