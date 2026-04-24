import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Opciones de configuración de Next.js */
  reactStrictMode: true,

  // Si planeas subir imágenes o assets a Supabase Storage,
  // esto te permitirá cargarlos sin problemas en el futuro:
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Optimización de rendimiento
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
