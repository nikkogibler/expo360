import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    // Allow warnings during build but continue
    ignoreDuringBuilds: false,
    // Don't fail on warnings, only errors
    dirs: ['src', 'lib'],
  },
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
    minimumCacheTTL: 60, // Reduced cache time for better error handling
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    path: '/_next/image',
    domains: [],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['next/image'],
  },
};

export default nextConfig;
