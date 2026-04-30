import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "NEO | Gestión de Catálogos",
  description: "Tu catálogo digital profesional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${montserrat.className} antialiased`}
      >
        {/* CRÍTICO: Aquí debe ir children para que la app funcione */}
        {children}
      </body>
    </html>
  );
}
