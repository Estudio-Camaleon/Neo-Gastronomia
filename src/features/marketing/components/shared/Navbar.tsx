"use client";

import { useState, useEffect } from "react";
import { TransitionLink } from "@/components/ui/transition-link";
import { Menu, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useActiveSection } from "@/core/hooks/useActiveSection";
import { useIsScrolled } from "@/core/hooks/useIsScrolled";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const activeSection = useActiveSection([
    "hero",
    "features",
    "how-it-works",
    "planes",
    "testimonials",
  ]);

  const isScrolled = useIsScrolled();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navigationLinks = [
    { name: "Inicio", href: "#hero" },
    { name: "Beneficios", href: "#features" },
    { name: "Pasos", href: "#how-it-works" },
    { name: "Planes", href: "#planes" },
  ];

  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8">
      <nav
        className={`mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between rounded-[20px] transition-all duration-500 ${
          isScrolled
            ? "glass-card shadow-lg"
            : "bg-transparent border border-transparent shadow-none"
        }`}
      >
        {/* Logo */}
        <TransitionLink href="/" className="flex items-center gap-2 group">
          <div className="neo-chip p-2 rounded-xl transition-transform group-hover:rotate-6 duration-300">
            <Image
              src="/icons/neo_logo_negro.webp"
              alt="NEO Brand Logo"
              width={60}
              height={60}
              priority
              className="object-contain"
            />
          </div>
        </TransitionLink>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <TransitionLink
                key={link.name}
                href={link.href}
                className={`relative text-sm transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
                  isActive
                    ? "font-black text-[var(--theme-primary)] scale-105 after:w-full after:bg-[var(--theme-primary)]"
                    : "font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] after:w-0 after:bg-[var(--theme-primary)] hover:after:w-full"
                }`}
              >
                {link.name}
              </TransitionLink>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <TransitionLink
            href="/login"
            className="text-sm font-bold text-[var(--theme-text)] hover:text-[var(--theme-primary)] transition-colors duration-200"
          >
            Ingresar
          </TransitionLink>
          <TransitionLink
            href="/registro"
            className="flex items-center gap-1.5 bg-[var(--theme-primary)] text-white text-sm font-black uppercase px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all duration-300 shadow-[0_4px_14px_rgba(31,107,61,0.16)]"
          >
            Crear local
            <ArrowRight className="w-4 h-4" />
          </TransitionLink>
        </div>

        {/* Mobile Toggle */}
        <div className="relative md:hidden">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-20 md:w-36 md:h-36 bg-[var(--theme-primary)] rounded-b-[80px] opacity-100 md:opacity-100" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-white hover:text-white/80 focus:outline-none transition-colors duration-200"
            aria-label="Alternar menú de navegación"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer + Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={close}
          />
          <div className="md:hidden fixed left-4 right-4 top-[5.5rem] z-50 animate-slide-down opacity-0">
            <div className="glass-card p-5 flex flex-col gap-4 border border-[var(--theme-border)] shadow-xl rounded-2xl">
              {navigationLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <TransitionLink
                    key={link.name}
                    href={link.href}
                    onClick={close}
                    className={`text-base transition-all duration-200 py-2 px-3 rounded-xl ${
                      isActive
                        ? "font-black text-[var(--theme-primary)] bg-[var(--theme-primary-soft)]/50"
                        : "font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-soft)]/30"
                    }`}
                  >
                    {link.name}
                  </TransitionLink>
                );
              })}
              <div className="h-px bg-[var(--theme-border)] my-1" />
              <div className="flex flex-col gap-2">
                <TransitionLink
                  href="/login"
                  onClick={close}
                  className="text-center text-sm font-bold text-[var(--theme-text)] py-2.5 rounded-xl border border-[var(--theme-border)] hover:bg-[var(--theme-surface-soft)] transition-all duration-200 active:scale-[0.97]"
                >
                  Ingresar
                </TransitionLink>
                <TransitionLink
                  href="/registro"
                  onClick={close}
                  className="flex items-center justify-center gap-2 bg-[var(--theme-primary)] text-white text-sm font-black uppercase py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 shadow-[0_4px_14px_rgba(31,107,61,0.16)]"
                >
                  Crear local
                  <ArrowRight className="w-4 h-4" />
                </TransitionLink>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
