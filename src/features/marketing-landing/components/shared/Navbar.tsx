"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Layers } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationLinks = [
    { name: "Características", href: "#features" },
    { name: "Planes", href: "#pricing" },
    { name: "Casos de Éxito", href: "#testimonials" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto max-w-7xl glass-card px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#9db71c] p-2 rounded-xl text-black transition-transform group-hover:rotate-6 duration-300">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-white">
            NEO<span className="text-[#9db71c]">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#748c58] hover:text-white transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-bold text-white hover:text-[#9db71c] transition-colors duration-200"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="flex items-center gap-1.5 bg-[#9db71c] text-black text-sm font-black uppercase px-4 py-2 rounded-xl hover:bg-white transition-all duration-300 shadow-[0_4px_14px_rgba(157,183,28,0.2)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
          >
            Comenzar Gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#748c58] hover:text-white focus:outline-none"
            aria-label="Alternar menú de navegación"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl glass-card p-4 flex flex-col gap-4 border-t border-[rgba(95,131,16,0.25)]">
          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-[#748c58] hover:text-white transition-colors py-1"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-[1px] bg-[rgba(95,131,16,0.15)] my-1" />
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="text-center text-sm font-bold text-white py-2"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="flex items-center justify-center gap-2 bg-[#9db71c] text-black text-sm font-black uppercase py-2.5 rounded-xl"
            >
              Comenzar Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
