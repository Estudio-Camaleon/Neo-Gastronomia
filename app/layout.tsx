import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Importamos Montserrat
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

// Configuramos Montserrat con los pesos que más vas a usar (400 regular, 700 bold, 900 black)
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
        className={`${montserrat.className} antialiased bg-bg-main dark:bg-bg-darker text-text-primary transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
