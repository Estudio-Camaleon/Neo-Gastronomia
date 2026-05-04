import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Importamos los proveedores de estado y notificaciones
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";

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
        {/* 
            El CartProvider envuelve a toda la aplicación para que 
            el estado del carrito sea global y persistente.
        */}
        <CartProvider>
          {children}

          {/* 
              Toaster permite que las notificaciones (toast.success, etc.) 
              se rendericen correctamente en cualquier parte de la app.
          */}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "18px",
                border: "2px solid var(--border)",
                fontFamily: "var(--font-montserrat)",
                fontWeight: "bold",
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
