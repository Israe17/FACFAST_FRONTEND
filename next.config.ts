import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL?.trim() || "http://localhost:3002").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  serverExternalPackages: ["leaflet"],
  transpilePackages: ["react-leaflet"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
