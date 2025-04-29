import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ["qujgsyngpismiyphgkip.supabase.co"],
  },
} as unknown as NextConfig;

export default nextConfig;