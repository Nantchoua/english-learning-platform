import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled to prevent Server Actions firing twice in development (React Strict Mode double-invoke)
  reactStrictMode: false,
};

export default nextConfig;
