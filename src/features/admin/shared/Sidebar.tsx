"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/core/lib/supabase/client";
import { useTheme } from "@/core/providers/ThemeProvider";
import { useOrderNotifications } from "@/features/admin/orders/OrderNotificationProvider";
import { NotificationBell } from "@/features/admin/notifications/NotificationBell";
import { TransitionLink } from "@/components/ui/transition-link";
import { LogoutModal } from "@/components/ui/logout-modal";
import {
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
  Crown,
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

type PlanTier = "free" | "pro";

interface SidebarProps {
  slug?: string;
  negocioNombre?: string;
  negocioId?: string | null;
  compact?: boolean;
}

export function Sidebar({
  slug,
  negocioNombre,
  negocioId,
  compact = false,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const { unreadCount } = useOrderNotifications();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!negocioId) return;
    const supabase = createClient();
    supabase
      .from("negocios")
      .select("plan_tier")
      .eq("id", negocioId)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.plan_tier) {
          setPlanTier(data.plan_tier as PlanTier);
        }
      });
  }, [negocioId]);

  const handleUpgrade = () => {
    router.push("/configuracion?upgrade=true");
  };

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
          <div className="flex flex-col items-center gap-0.5 mb-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--admin-accent)] text-white font-bold text-base">
              N
            </div>
            <span className="text-[7px] font-semibold text-[var(--admin-text-muted)] opacity-50 leading-none">
              v1.1.1
            </span>
          </div>

          <div className="w-full border-t border-[var(--admin-border)] mb-2 shrink-0" />

          {/* Nav iconos */}
          <nav aria-label="Navegación principal" className="flex-1 w-full space-y-1 overflow-y-auto custom-scrollbar min-h-0">
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
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-[var(--admin-accent)] text-white shadow-sm"
                      : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
                  }`}
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? "text-white" : ""}
                    />
                    {link.name === "Pedidos" && unreadCount > 0 && pathname !== "/pedidos" && !pathname.startsWith("/pedidos/") && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                </TransitionLink>
              );
            })}
          </nav>

          {/* Notification bell compacto */}
          <NotificationBell variant="sidebar" />

          {/* Plan indicator compacto */}
          {planTier === "free" && (
            <button
              type="button"
              onClick={handleUpgrade}
              title="Actualizar a PRO"
              aria-label="Actualizar a PRO"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all active:scale-95 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            >
              <Crown size={15} />
            </button>
          )}

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
            onCancel={() => setShowLogoutConfirm(false)}
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
            <div className="relative">
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
              <span className="absolute -bottom-3.5 right-0 text-[7px] font-semibold text-[var(--admin-text-muted)] opacity-50 leading-none select-none pointer-events-none">
                v1.1.1
              </span>
            </div>
          </div>

          {/* spacer to compensate version label */}
          <div className="h-3 shrink-0" />

          <div className="my-4 border-t border-[var(--admin-border)] shrink-0" />

          {/* Navegación */}
          <nav aria-label="Navegación principal" className="flex-1 mt-4 space-y-0.5 overflow-y-auto custom-scrollbar min-h-0">
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
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group relative font-semibold text-sm active:scale-[0.97] ${
                    isActive
                      ? "bg-[var(--admin-accent)] text-white shadow-sm shadow-[var(--admin-accent)]/20"
                      : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 w-1 h-5 bg-[var(--admin-accent)] rounded-r-md shadow-sm" />
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
                  {link.name === "Pedidos" && unreadCount > 0 && pathname !== "/pedidos" && !pathname.startsWith("/pedidos/") && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </TransitionLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 lg:pt-4 border-t border-[var(--admin-border)] space-y-3 shrink-0">
          {/* Plan badge + upgrade */}
          <div className={`rounded-xl p-2.5 lg:p-3 border transition-all ${
            planTier === "pro"
              ? "bg-[var(--admin-accent)]/5 border-[var(--admin-accent)]/20"
              : "bg-amber-500/5 border-amber-500/20"
          }`}>
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-wider ${
                planTier === "pro"
                  ? "text-[var(--admin-accent)]"
                  : "text-amber-600 dark:text-amber-400"
              }`}>
                Plan {planTier === "pro" ? "PRO" : "GRATIS"}
              </span>
              {planTier === "free" && (
                <Crown size={11} className="text-amber-500" />
              )}
            </div>
            {planTier === "free" ? (
              <button
                type="button"
                onClick={handleUpgrade}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] lg:text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-[0.97]"
              >
                <Crown size={12} />
                Actualizar a PRO
              </button>
            ) : (
              <p className="text-[11px] lg:text-xs font-bold text-[var(--admin-accent)] truncate mt-1">
                Todo desbloqueado
              </p>
            )}
          </div>

          <div className="flex bg-[var(--admin-bg)] rounded-lg p-0.5 border border-[var(--admin-border)]">
            <button
              onClick={() => setTheme("light")}
              aria-label="Tema claro"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] lg:text-xs font-bold rounded-md transition-all active:scale-[0.97] ${
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] lg:text-xs font-bold rounded-md transition-all active:scale-[0.97] ${
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
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleSignOut}
          negocioNombre={negocioNombre}
        />
      )}
    </>
  );
}
