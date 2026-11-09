import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled to prevent Server Actions firing twice in development (React Strict Mode double-invoke)
  reactStrictMode: false,
  // Skip TypeScript type checking during Vercel production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const storageBase =
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ||
      'https://azvolnguhxuoddjisxar.supabase.co/storage/v1/object/public/English';
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/audio/:path*',
          destination: `${storageBase}/audio/:path*`,
        },
        {
          source: '/videos/:path*',
          destination: `${storageBase}/videos/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
