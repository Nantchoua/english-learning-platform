import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled to prevent Server Actions firing twice in development (React Strict Mode double-invoke)
  reactStrictMode: false,
  // Skip TypeScript type checking during Vercel production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint checks during Vercel production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
