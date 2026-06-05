"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/ui/transition-link";
import { useTheme } from "@/core/providers/ThemeProvider";
import {
  Settings,
  LogOut,
  Sun,
  Moon,
  AlertCircle,
  ExternalLink,
  X,
  Menu,
} from "lucide-react";

interface MobileSidebarProps {
  slug: string;
  negocioNombre: string;
}

export function MobileSidebar({ slug, negocioNombre }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  const handleSignOut = async () => {
    const { createClient } = await import("@/core/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-sidebar-panel"
        className="touch-target flex items-center justify-center p-3 bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] rounded-xl hover:bg-[var(--admin-accent)]/10 transition-all duration-200 cursor-pointer outline-none active:scale-95"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={close}
            aria-hidden="true"
          />

          <div
            id="mobile-sidebar-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed inset-y-0 left-0 w-full max-w-[300px] bg-[var(--admin-surface)] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--admin-border)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--admin-accent)] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--admin-text)] leading-tight">
                    NEO Admin
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--admin-text-muted)] truncate max-w-[180px]">
                    {negocioNombre || "Panel de control"}
                  </span>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Cerrar menú"
                className="touch-target flex items-center justify-center p-2 rounded-xl text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)] transition-colors outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Acciones secundarias */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {/* Ajustes */}
              <TransitionLink
                href="/configuracion"
                onClick={close}
                className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm active:scale-[0.97] touch-target text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
              >
                <Settings size={20} strokeWidth={2} className="shrink-0" />
                <span>Ajustes</span>
              </TransitionLink>

              {/* Theme toggle */}
              <div className="flex gap-2 px-3.5 py-2">
                <button
                  onClick={() => setTheme("light")}
                  aria-label="Tema claro"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
                    mounted && theme === "light"
                      ? "bg-[var(--admin-accent)] text-white shadow-sm"
                      : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                  }`}
                >
                  <Sun size={16} />
                  Claro
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  aria-label="Tema oscuro"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
                    mounted && theme === "dark"
                      ? "bg-[var(--admin-accent)] text-white shadow-sm"
                      : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                  }`}
                >
                  <Moon size={16} />
                  Oscuro
                </button>
              </div>

              {/* Cerrar Sesión */}
              <button
                type="button"
                onClick={() => {
                  close();
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm active:scale-[0.97] touch-target text-[var(--admin-text-muted)] hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut size={20} strokeWidth={2} className="shrink-0" />
                <span>Cerrar Sesión</span>
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--admin-border)] px-4 py-3 shrink-0">
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-1 py-2 text-sm font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
              >
                <ExternalLink size={16} />
                <span className="truncate">neo.app/{slug}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-[var(--admin-border)] animate-in zoom-in-95 duration-150">
            <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mb-5 rounded-full border border-red-200 dark:border-red-900/30">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-bold text-xl text-[var(--admin-text)] text-center tracking-tight mb-2">
              Desconectar{" "}
              <span className="text-[var(--admin-accent)]">Terminal</span>
            </h3>
            <p className="text-sm font-medium text-[var(--admin-text-muted)] text-center leading-relaxed mb-6">
              ¿Confirmás la salida de <br />
              <span className="text-[var(--admin-text)] font-semibold">
                {negocioNombre || "la unidad actual"}
              </span>
              ?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSignOut}
                className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold tracking-wide transition-colors shadow-sm hover:opacity-90"
              >
                Cerrar Terminal
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3.5 border border-[var(--admin-border)] bg-transparent text-[var(--admin-text)] rounded-xl font-bold text-sm hover:bg-[var(--admin-bg)] transition-colors"
              >
                Cancelar y Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
