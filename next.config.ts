import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_URL?.trim() || "http://localhost:3002";
const backendUrl = (
  /^https?:\/\//i.test(rawBackendUrl) ? rawBackendUrl : `https://${rawBackendUrl}`
).replace(/\/$/, "");

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
