import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: true,
  },
} as unknown as NextConfig;

export default nextConfig;