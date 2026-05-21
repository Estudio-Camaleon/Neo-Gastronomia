import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/core/providers/LoadingProvider";

// Configuración de metadatos para SEO y PWA
export const metadata: Metadata = {
  title: "NEO | Sistema de Gestión Brutalista",
  description:
    "Plataforma de alta velocidad para la gestión de catálogos y negocios digitales.",
  robots: "noindex, nofollow", 
  icons: {
    icon: "/icons/neo_logo_negro.svg",
  },
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
      <body className="antialiased m-0 p-0 border-none">
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
