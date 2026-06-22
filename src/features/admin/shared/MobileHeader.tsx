"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sun, Moon, ExternalLink, LogOut, Check } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import { createClient } from "@/core/lib/supabase/client";
import { LogoutModal } from "@/components/ui/logout-modal";
import { toast } from "sonner";

interface MobileHeaderProps {
  slug: string;
}

export function MobileHeader({ slug }: MobileHeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleCopyLink = useCallback(async () => {
    try {
      const url = `${window.location.origin}/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link de tienda copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }, [slug]);

  return (
    <>
      <header className="flex lg:hidden items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 backdrop-blur-lg sticky top-0 z-[60] transition-all duration-300 safe-top">
        {/* Logo */}
        <div className="relative w-9 h-9">
          <Image
            src="/icons/neo_logo_negro.webp"
            alt="NEO"
            width={36}
            height={36}
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/icons/neo_logo_blanco.webp"
            alt="NEO"
            width={36}
            height={36}
            className="object-contain hidden dark:block"
            priority
          />
        </div>

        {/* Acciones */}
        <div ref={menuRef} className="flex items-center gap-1">
          {/* Copiar link tienda */}
          <button
            onClick={handleCopyLink}
            aria-label="Copiar link de la tienda"
            className={`p-2 rounded-lg transition-all active:scale-90 ${
              copied
                ? "text-[var(--admin-success)] bg-[var(--admin-success-bg)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
            }`}
          >
            {copied ? <Check size={18} /> : <ExternalLink size={18} />}
          </button>

          {/* Cambiar tema */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Tema claro" : "Tema oscuro"}
              className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all active:scale-90"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Cerrar sesión */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Cerrar sesión"
            className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={handleSignOut}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
