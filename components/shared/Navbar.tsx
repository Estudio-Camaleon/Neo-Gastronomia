"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface NavbarProps {
  showLinks?: boolean;
  showActions?: boolean;
}

export function Navbar({ showLinks = true, showActions = true }: NavbarProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-bg-main dark:bg-bg-darker/80 backdrop-blur-md border-b border-border dark:border-border-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black text-primary tracking-tighter"
        >
          <img
            src={
              mounted && theme === "light"
                ? "/icons/neo_logo_negro.svg"
                : "/icons/neo_logo_blanco.svg"
            }
            alt="NEO Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Links */}
        {showLinks && (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <Link
              href="#inicio"
              className="hover:text-primary transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="#productos"
              className="hover:text-primary transition-colors"
            >
              Productos
            </Link>
            <Link
              href="#precios"
              className="hover:text-primary transition-colors"
            >
              Precios
            </Link>
            <Link
              href="#pedidos"
              className="hover:text-primary transition-colors"
            >
              Pedidos
            </Link>
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 active:scale-95"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
