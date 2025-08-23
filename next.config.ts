import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Electron
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Configure trailing slash for static files
  trailingSlash: true,
  
  // Configure Turbopack root directory
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
