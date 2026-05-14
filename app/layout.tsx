import type { Metadata, Viewport } from "next";
import "./globals.css";

// Configuración de metadatos para SEO y PWA
export const metadata: Metadata = {
  title: "NEO | Sistema de Gestión Brutalista",
  description:
    "Plataforma de alta velocidad para la gestión de catálogos y negocios digitales.",
  robots: "noindex, nofollow", // Por defecto privado hasta el despliegue
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="m-0 p-0">
      <body className="antialiased m-0 p-0 border-none">{children}</body>
    </html>
  );
}
