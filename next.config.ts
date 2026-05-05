import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Dejamos el objeto vacío o removemos la sección si no tenés otras funciones experimentales activas
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
    // Limpia los logs en el cliente al compilar para producción
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
