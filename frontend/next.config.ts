import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // In production: set BACKEND_URL env var on Railway to your backend service URL
    // In local dev: falls back to localhost:8000
    const backendUrl = (
      process.env.BACKEND_URL || "http://localhost:8000"
    ).replace(/\/$/, "").replace(/\/api$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
