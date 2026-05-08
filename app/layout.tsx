import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

// Configuración de fuentes de alto rendimiento
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEO | Sistema de Gestión Gastronómica",
  description:
    "Plataforma SaaS de alto rendimiento para el control total de locales gastronómicos.",
  manifest: "/manifest.json", // Opcional por si activás PWA después
};

// Control de escala para dispositivos móviles
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/30`}
      >
        {/* ThemeProvider envuelve toda la app para el control de modo claro/oscuro */}
        <ThemeProvider>
          {children}

          {/* Toaster configurado con estética Neo-Brutalista */}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className:
                "border-4 border-black rounded-neo shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-sans font-bold",
              style: {
                padding: "16px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
