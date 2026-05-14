"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: "Funciones", href: "#features" },
    { name: "Precios", href: "#precios" },
    { name: "Testimonios", href: "#testimonios" },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full h-20 bg-[var(--theme-background)]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group relative z-[110]"
        >
          <Image
            src="/icons/neo_logo_blanco.svg"
            alt="NEO Logo"
            width={38}
            height={38}
            priority // Agregamos priority porque es el primer elemento que carga (LCP)
            className="h-auto w-auto group-hover:rotate-[15deg] transition-transform duration-500 ease-out"
          />
        </Link>

        <div className="hidden md:flex items-center gap-10 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-4 w-px bg-white/10"></div>
          <Link
            href="/login"
            className="text-white hover:opacity-70 transition-opacity"
          >
            Login
          </Link>
        </div>

        <div className="flex items-center gap-4 relative z-[110]">
          <Link
            href="/registro"
            className="btn-elegant hidden md:block px-6 py-2.5 text-[10px]"
          >
            Comenzar_ahora
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Overlay (Simplificado para el fix) */}
      {isOpen && (
        <div className="fixed inset-0 bg-[var(--theme-background)] z-[100] md:hidden flex flex-col items-center justify-center gap-8">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white"
          >
            <X size={30} />
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-3xl font-bold"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
