import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/core/providers/LoadingProvider";
import { Geist } from "next/font/google";
import { cn } from "@core/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NEO | Sistema de Gestión",
  description:
    "Plataforma de alta velocidad para la gestión de catálogos y negocios digitales.",
  robots: "noindex, nofollow",
  icons: {
    icon: "/icons/neo_logo_negro.webp",
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
      className={cn("m-0 p-0 font-sans", geist.variable)}
    >
      <body className="antialiased m-0 p-0 border-none">
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
