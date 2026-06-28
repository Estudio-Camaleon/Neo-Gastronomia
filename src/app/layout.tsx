import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/core/providers/LoadingProvider";
import { Geist } from "next/font/google";
import { cn } from "@core/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { ResponsiveToaster } from "@/core/providers/ResponsiveToaster";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NEO | Sistema de Gestión",
  description:
    "Plataforma de alta velocidad para la gestión de catálogos y negocios digitales.",
  icons: {
    icon: "/icons/icon.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("m-0 p-0 font-sans", geist.variable)}
    >
      <body className="antialiased m-0 p-0 border-none overflow-x-hidden">
        <a
          href="#main-content"
          className="fixed -top-40 left-4 z-[9999] rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#163225] shadow-lg transition-all focus:top-4 focus:outline-2 focus:outline-[#1f6b3d]"
        >
          Saltar al contenido principal
        </a>
        <LoadingProvider>
          {children}
          <ResponsiveToaster />
        </LoadingProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
