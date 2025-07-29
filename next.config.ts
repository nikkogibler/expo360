import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [480, 640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 300, // 5 minutes cache
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enhanced optimization for large images
    loader: 'default',
    path: '/_next/image',
    // Limit concurrent image optimizations to prevent memory issues
    domains: [],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['next/image'],
  },
};

export default nextConfig;
