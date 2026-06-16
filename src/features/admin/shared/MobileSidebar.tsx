"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/core/lib/supabase/client";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { motion, AnimatePresence } from "framer-motion";
import { TransitionLink } from "@/components/ui/transition-link";
import { LogoutModal } from "@/components/ui/logout-modal";
import { useTheme } from "@/core/providers/ThemeProvider";
import { useOrderNotifications } from "@/features/admin/orders/OrderNotificationProvider";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Percent,
  Settings,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  X,
} from "lucide-react";
interface MobileSidebarProps {
  slug: string;
  negocioNombre: string;
}

const NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
  { name: "Promos", href: "/promos", icon: Percent },
];

export function MobileSidebar({ slug, negocioNombre }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useOrderNotifications();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const sidebarPanelRef = useFocusTrap(open);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-sidebar-overlay"
            className="fixed inset-0 z-[9999] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={sidebarPanelRef}
              id="mobile-sidebar-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              tabIndex={-1}
              className="absolute inset-y-0 left-0 w-[82%] max-w-[340px] bg-[var(--admin-surface)] shadow-2xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border)] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--admin-accent)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    N
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[var(--admin-text)] leading-tight">
                      NEO Admin
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--admin-text-muted)] truncate max-w-[180px]">
                      {negocioNombre || "Panel de control"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={close}
                  aria-label="Cerrar menú"
                  className="touch-target flex items-center justify-center p-3 rounded-xl text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)] transition-colors outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navegación */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] px-3 mb-3 block opacity-70">
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
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] font-semibold text-sm ${
                        isActive
                          ? "bg-[var(--admin-accent)] text-white"
                          : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
                      }`}
                    >
                      <div className="relative">
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                        {link.name === "Pedidos" && unreadCount > 0 && pathname !== "/pedidos" && !pathname.startsWith("/pedidos/") && (
                          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="tracking-wide">{link.name}</span>
                    </TransitionLink>
                  );
                })}

                <div className="my-4 border-t border-[var(--admin-border)]" />

                {/* Ajustes */}
                <TransitionLink
                  href="/configuracion"
                  onClick={close}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm active:scale-[0.97] touch-target ${
                    pathname === "/configuracion" || pathname.startsWith("/configuracion")
                      ? "bg-[var(--admin-accent)] text-white shadow-sm shadow-[var(--admin-accent)]/20"
                      : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/5 hover:text-[var(--admin-text)]"
                  }`}
                >
                  <Settings size={20} strokeWidth={pathname === "/configuracion" ? 2.5 : 2} className="shrink-0" />
                  <span className="tracking-wide">Ajustes</span>
                </TransitionLink>

                {/* Theme toggle */}
                <div className="flex gap-2 px-1 py-3">
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
                  <span className="tracking-wide">Cerrar Sesión</span>
                </button>
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--admin-border)] px-5 py-4 shrink-0 safe-bottom">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={handleSignOut}
          onCancel={() => setShowLogoutConfirm(false)}
          negocioNombre={negocioNombre}
        />
      )}
    </>
  );
}
