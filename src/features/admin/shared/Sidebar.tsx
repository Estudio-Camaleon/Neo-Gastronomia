"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/core/lib/supabase/client";
import { useTheme } from "@/core/providers/ThemeProvider";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  AlertCircle,
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  Activity,
} from "lucide-react";

const NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Ajustes", href: "/configuracion", icon: Settings },
];

interface SidebarProps {
  slug?: string;
  negocioNombre?: string;
  negocioId?: string | null;
}

export function Sidebar({ slug, negocioNombre, negocioId }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!mounted) {
    return (
      <aside className="w-full h-full bg-[var(--admin-surface)] border-r border-[var(--admin-border)]" />
    );
  }

  return (
    <>
      <aside className="admin-sidebar p-5 md:p-6 relative h-full flex flex-col justify-between w-full min-h-0 select-none">
        <div className="flex flex-col flex-1 min-h-0">
          {/* === 1. BLOQUE LOGOTIPO AUTOMATIZADO CON CONTROL DE ESTADO REACTIVO === */}
          <div className="flex items-center justify-start gap-3 group px-2 h-10 shrink-0">
            {theme === "dark" ? (
              <img
                src="/icons/neo_logo_blanco.svg"
                alt="NEO Sistema Gastronómico"
                className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
              />
            ) : (
              <img
                src="/icons/neo_logo_negro.svg"
                alt="NEO Sistema Gastronómico"
                className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                // NOTA TÉCNICA: Si el logo se sigue viendo blanco/invisible debido al archivo físico SVG,
                // podés descomentar la siguiente línea para forzar un invert por hardware:
                // className="h-7 w-auto object-contain invert"
              />
            )}
          </div>

          <div className="my-5 border-t border-[var(--admin-border)] shrink-0" />

          {/* === 2. BLOQUE RADAR DE SINCRONIZACIÓN REALTIME === */}
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl p-4 shadow-sm relative overflow-hidden shrink-0">
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex items-center justify-center p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg shadow-xs">
                <Activity size={16} className="text-[var(--admin-accent)]" />
                <div className="absolute inset-0 bg-[var(--admin-accent)] opacity-15 blur-md animate-pulse rounded-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wide text-[var(--admin-text)]">
                  Radar de Enlace
                </span>
                <span className="text-[10px] font-semibold text-[var(--admin-accent)] animate-pulse">
                  Sincronizando...
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-1 opacity-25 dark:opacity-45">
              {[8, 14, 10, 16, 6, 12, 18, 11, 7, 13, 9, 15].map((height, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-[var(--admin-accent)] rounded-full"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          {/* === 3. BLOQUE NAVEGACIÓN SEMÁNTICA === */}
          <nav className="flex-1 mt-5 space-y-1 overflow-y-auto custom-scrollbar px-0.5 min-h-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-4 mb-2.5 block opacity-70">
              Menú Principal
            </span>

            {NAVIGATION_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <TransitionLink
                  key={link.name}
                  href={link.href}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative font-semibold text-sm
                    ${
                      isActive
                        ? "bg-[var(--admin-accent)] text-white shadow-sm shadow-[var(--admin-accent)]/20"
                        : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-accent)] hover:text-[var(--admin-text)]"
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 w-1 h-5 bg-white rounded-r-md" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? "text-white"
                        : "text-[var(--admin-text-subtle)] group-hover:text-[var(--admin-text)] transition-colors"
                    }
                  />
                  <span className="tracking-wide">{link.name}</span>
                </TransitionLink>
              );
            })}
          </nav>
        </div>

        {/* === 4. BLOQUE FOOTER GLOBAL === */}
        <div className="mt-auto pt-4 border-t border-[var(--admin-border)] space-y-4 shrink-0">
          <div className="flex bg-[var(--admin-bg)] rounded-xl p-1 shadow-inner border border-[var(--admin-border)]">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                theme === "light"
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]/40"
              }`}
            >
              <Sun size={14} /> Claro
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                theme === "dark"
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]/40"
              }`}
            >
              <Moon size={14} /> Oscuro
            </button>
          </div>

          {slug && (
            <div className="bg-[var(--admin-surface-accent)]/30 rounded-xl p-3 group transition-all border border-[var(--admin-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--admin-accent)]">
                  Tu Tienda Online
                </span>
                <ExternalLink
                  size={12}
                  className="text-[var(--admin-accent)] opacity-60 group-hover:opacity-100 transition-all"
                />
              </div>
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[var(--admin-text)] truncate block hover:text-[var(--admin-accent)] transition-colors"
              >
                neo.app/{slug}
              </a>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl group transition-all hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <div className="p-2 rounded-lg bg-[var(--admin-surface-accent)] text-[var(--admin-text-muted)] group-hover:bg-red-500 group-hover:text-white transition-colors">
              <LogOut size={16} />
            </div>
            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--admin-text-muted)] group-hover:text-red-500 transition-colors">
                Cerrar Sesión
              </span>
              <span className="text-xs font-bold text-[var(--admin-text)] truncate w-full opacity-80">
                {negocioNombre || "Administrador"}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* MODAL DE SEGURIDAD */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-[var(--admin-border)] animate-in zoom-in-95 duration-150">
            <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/20 text-[var(--admin-danger)] flex items-center justify-center mb-5 rounded-full border border-red-200 dark:border-red-900/30">
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
                className="w-full py-3.5 bg-[var(--admin-danger)] text-white rounded-xl font-bold tracking-wide transition-colors shadow-sm hover:opacity-90"
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
