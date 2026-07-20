import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/KYC/booking imagery is served from the configured upload host.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
