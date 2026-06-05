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
  BarChart3,
  Percent,
  Settings,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  Activity,
} from "lucide-react";

const supabase = createClient();

const NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
   { name: "Promos", href: "/promos", icon: Percent },
  { name: "Ajustes", href: "/configuracion", icon: Settings },
];

interface SidebarProps {
  slug?: string;
  negocioNombre?: string;
  negocioId?: string | null;
  compact?: boolean;
}

export function Sidebar({
  slug,
  negocioNombre,
  compact = false,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  // ── Modo compacto: solo iconos (sm: 640-768px) ────────────
  if (compact) {
    return (
      <>
        <aside className="admin-sidebar p-2 relative h-full flex flex-col items-center w-full min-h-0 select-none">
          {/* Logo compacto */}
          <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-[var(--admin-accent)] text-white font-bold text-base mb-3">
            N
          </div>

          <div className="w-full border-t border-[var(--admin-border)] mb-2 shrink-0" />

          {/* Nav iconos */}
          <nav className="flex-1 w-full space-y-1 overflow-y-auto custom-scrollbar min-h-0">
            {NAVIGATION_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <TransitionLink
                  key={link.name}
                  href={link.href}
                  title={link.name}
                  aria-label={link.name}
                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-[var(--admin-accent)] text-white shadow-sm"
                      : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-white" : ""}
                  />
                </TransitionLink>
              );
            })}
          </nav>

          {/* Theme toggle iconos */}
          <div className="w-full mt-2 pt-2 border-t border-[var(--admin-border)] space-y-1 shrink-0">
            <button
              onClick={() => setTheme("light")}
              aria-label="Tema claro"
              className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all active:scale-95 ${
                theme === "light"
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5"
              }`}
            >
              <Sun size={17} />
            </button>
            <button
              onClick={() => setTheme("dark")}
              aria-label="Tema oscuro"
              className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all active:scale-95 ${
                theme === "dark"
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5"
              }`}
            >
              <Moon size={17} />
            </button>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            title="Cerrar Sesión"
            aria-label="Cerrar Sesión"
            className="w-10 h-10 mt-1 flex items-center justify-center mx-auto rounded-xl text-[var(--admin-text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 shrink-0"
          >
            <LogOut size={17} />
          </button>
        </aside>

        {showLogoutConfirm && (
          <LogoutModal
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={handleSignOut}
            negocioNombre={negocioNombre}
          />
        )}
      </>
    );
  }

  // ── Modo expandido: completo (md+ y lg+) ────────────────
  return (
    <>
      <aside className="admin-sidebar p-4 lg:p-5 relative h-full flex flex-col justify-between w-full min-h-0 select-none">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-start gap-3 group shrink-0">
            {theme === "dark" ? (
              <img
                src="/icons/neo_logo_blanco.webp"
                alt="NEO Sistema Gastronómico"
                className="h-6 lg:h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
              />
            ) : (
              <img
                src="/icons/neo_logo_negro.webp"
                alt="NEO Sistema Gastronómico"
                className="h-6 lg:h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
              />
            )}
          </div>

          <div className="my-4 border-t border-[var(--admin-border)] shrink-0" />

          {/* Radar */}
          <div className="admin-card p-3 lg:p-4 relative overflow-hidden shrink-0">
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="relative flex items-center justify-center p-1.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl">
                <Activity size={14} className="text-[var(--admin-accent)]" />
                <div className="absolute inset-0 bg-[var(--admin-accent)] opacity-15 blur-md animate-pulse rounded-lg" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] lg:text-xs font-bold tracking-wide text-[var(--admin-text)] truncate">
                  Radar de Enlace
                </span>
                <span className="text-[9px] lg:text-[10px] font-semibold text-[var(--admin-accent)] animate-pulse">
                  Sincronizando...
                </span>
              </div>
            </div>
            <div
              className="mt-2 flex gap-0.5 opacity-25 dark:opacity-45"
              aria-hidden="true"
            >
              {[8, 14, 10, 16, 6, 12, 18, 11, 7, 13, 9, 15].map((height) => (
                <div
                  key={height}
                  className="w-0.5 bg-[var(--admin-accent)] rounded-full"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 mt-4 space-y-0.5 overflow-y-auto custom-scrollbar min-h-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] ml-3 mb-2 block opacity-70">
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
                  className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group relative font-semibold text-sm active:scale-[0.97] ${
                    isActive
                      ? "bg-[var(--admin-accent)] text-white shadow-sm shadow-[var(--admin-accent)]/20"
                      : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 w-0.5 h-5 bg-[var(--admin-accent)] rounded-r-md shadow-sm" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? "text-white shrink-0"
                        : "text-[var(--admin-text-muted)] group-hover:text-[var(--admin-text)] transition-colors shrink-0"
                    }
                  />
                  <span className="tracking-wide truncate">{link.name}</span>
                </TransitionLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 lg:pt-4 border-t border-[var(--admin-border)] space-y-3 shrink-0">
          <div className="flex bg-[var(--admin-bg)] rounded-xl p-0.5 border border-[var(--admin-border)]">
            <button
              onClick={() => setTheme("light")}
              aria-label="Tema claro"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] lg:text-xs font-bold rounded-lg transition-all active:scale-[0.97] ${
                theme === "light"
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]/40"
              }`}
            >
              <Sun size={13} /> <span className="hidden lg:inline">Claro</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              aria-label="Tema oscuro"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] lg:text-xs font-bold rounded-lg transition-all active:scale-[0.97] ${
                theme === "dark"
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]/40"
              }`}
            >
              <Moon size={13} />{" "}
              <span className="hidden lg:inline">Oscuro</span>
            </button>
          </div>

          {slug && (
            <div className="bg-[var(--admin-surface-accent)]/30 rounded-xl p-2.5 lg:p-3 group transition-all border border-[var(--admin-border)]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-[var(--admin-accent)]">
                  Tu Tienda Online
                </span>
                <ExternalLink
                  size={11}
                  className="text-[var(--admin-accent)] opacity-60 group-hover:opacity-100 transition-all shrink-0"
                />
              </div>
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] lg:text-xs font-bold text-[var(--admin-text)] truncate block hover:text-[var(--admin-accent)] transition-colors"
              >
                neo.app/{slug}
              </a>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl group transition-all hover:bg-[var(--admin-accent-secondary)]/10 border border-transparent hover:border-[var(--admin-accent-secondary)]/20 active:scale-[0.97] touch-target"
          >
            <div className="p-1.5 lg:p-2 rounded-xl bg-[var(--admin-bg)] text-[var(--admin-text-muted)] group-hover:bg-[var(--admin-accent-secondary)] group-hover:text-white transition-colors shrink-0">
              <LogOut size={15} />
            </div>
            <div className="flex flex-col items-start overflow-hidden text-left min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--admin-text-muted)] group-hover:text-red-500 transition-colors">
                Cerrar Sesión
              </span>
              <span className="text-[11px] lg:text-xs font-bold text-[var(--admin-text)] truncate w-full opacity-80">
                {negocioNombre || "Administrador"}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <LogoutModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleSignOut}
          negocioNombre={negocioNombre}
        />
      )}
    </>
  );
}

function LogoutModal({
  onClose,
  onConfirm,
  negocioNombre,
}: {
  onClose: () => void;
  onConfirm: () => void;
  negocioNombre?: string;
}) {
  return (
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
            onClick={onConfirm}
            className="w-full py-3.5 bg-[var(--admin-danger)] text-white rounded-xl font-bold tracking-wide transition-colors shadow-sm hover:opacity-90"
          >
            Cerrar Terminal
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 border border-[var(--admin-border)] bg-transparent text-[var(--admin-text)] rounded-xl font-bold text-sm hover:bg-[var(--admin-bg)] transition-colors"
          >
            Cancelar y Volver
          </button>
        </div>
      </div>
    </div>
  );
}
