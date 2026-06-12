import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  compiler: {
    // Limpia logs del cliente en producción, pero preserva errores
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error"] }
        : false,
  },
};

export default nextConfig;
