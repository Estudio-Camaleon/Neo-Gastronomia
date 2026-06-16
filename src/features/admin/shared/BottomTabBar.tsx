"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TransitionLink } from "@/components/ui/transition-link";
import { useOrderNotifications } from "@/features/admin/orders/OrderNotificationProvider";
import { useTheme } from "@/core/providers/ThemeProvider";
import { createClient } from "@/core/lib/supabase/client";
import { LogoutModal } from "@/components/ui/logout-modal";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Percent,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

const TAB_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Promos", href: "/promos", icon: Percent },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Stats", href: "/estadisticas", icon: BarChart3 },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useOrderNotifications();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
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

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      <nav aria-label="Navegación inferior" className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--admin-surface)]/95 backdrop-blur-xl border-t border-[var(--admin-border)] safe-bottom pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-around px-0.5 sm:px-1 pt-1">
          {TAB_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <TransitionLink
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-1 px-1.5 sm:px-2.5 rounded-xl transition-all duration-200 active:scale-95 touch-target min-w-0 ${
                  active
                    ? "text-[var(--admin-accent)]"
                    : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  {item.name === "Pedidos" && unreadCount > 0 && pathname !== "/pedidos" && !pathname.startsWith("/pedidos/") && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold leading-tight ${
                    active
                      ? "text-[var(--admin-accent)]"
                      : "text-[var(--admin-text-muted)]"
                  }`}
                >
                  {item.name}
                </span>
              </TransitionLink>
            );
          })}

          {/* Botón Ajustes con popover */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-expanded={showMenu}
              aria-label="Ajustes"
              className={`relative flex flex-col items-center gap-0.5 py-1 px-1.5 sm:px-2.5 rounded-xl transition-all duration-200 active:scale-95 touch-target min-w-0 ${
                showMenu
                  ? "text-[var(--admin-accent)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              }`}
            >
              <Settings size={20} strokeWidth={showMenu ? 2.5 : 2} />
              <span className={`text-[9px] sm:text-[10px] font-bold leading-tight ${
                showMenu ? "text-[var(--admin-accent)]" : "text-[var(--admin-text-muted)]"
              }`}>
                Ajustes
              </span>
            </button>

            {/* Popover */}
            {showMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100 origin-bottom-right">
                {/* Theme toggle */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--admin-text)]">
                    Tema
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTheme("light")}
                      aria-label="Tema claro"
                      className={`p-1.5 rounded-lg transition-all ${
                        mounted && theme === "light"
                          ? "bg-[var(--admin-accent)] text-white shadow-sm"
                          : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)]"
                      }`}
                    >
                      <Sun size={15} />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      aria-label="Tema oscuro"
                      className={`p-1.5 rounded-lg transition-all ${
                        mounted && theme === "dark"
                          ? "bg-[var(--admin-accent)] text-white shadow-sm"
                          : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)]"
                      }`}
                    >
                      <Moon size={15} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[var(--admin-border)] mx-3 my-1" />

                {/* Cerrar sesión */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={handleSignOut}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
