"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/core/lib/supabase/client";
import { useTheme } from "@/core/providers/ThemeProvider";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
  AlertCircle,
} from "lucide-react";

import { SidebarLogo } from "./SidebarLogo";
import { SidebarRadar } from "./SidebarRadar";
import { SidebarFooter } from "./SidebarFooter";
import Link from "next/link";

export function Sidebar({
  slug,
  negocioNombre,
  negocioId,
}: {
  slug?: string;
  negocioNombre?: string;
  negocioId?: string | null;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Definición de la sección de Dashboard y Navegación
  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard }, // Ruta raíz de (adminPanel)
    { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
    { name: "Productos", href: "/productos", icon: Package },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Configuración", href: "/configuracion", icon: Settings },
  ];

  if (!mounted)
    return (
      <aside className="w-72 bg-[var(--admin-surface)] border-r-2 border-[var(--admin-border)]" />
    );

  return (
    <>
      <aside className="flex flex-col h-full bg-[var(--admin-surface)] border-r-2 border-[var(--admin-border)] p-6 transition-colors duration-500 z-40">
        <SidebarLogo />

        <div className="my-8 border-t border-[var(--admin-border)] opacity-10" />

        <SidebarRadar negocioId={negocioId} />

        {/* SECCIÓN DE NAVEGACIÓN PRINCIPAL */}
        <nav className="flex-1 mt-8 space-y-2 overflow-y-auto custom-scrollbar">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--admin-text-muted)] ml-2 mb-4 block opacity-50">
            Main Terminal
          </span>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3 border-2 transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-[var(--admin-accent)] border-[var(--admin-border)] text-[var(--admin-bg)] shadow-[4px_4px_0px_0px_var(--admin-border)]"
                      : "bg-transparent border-transparent text-[var(--admin-text-muted)] hover:border-[var(--admin-border)]/20 hover:text-[var(--admin-text)]"
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 3 : 2}
                  className={
                    isActive
                      ? "text-[var(--admin-bg)]"
                      : "text-[var(--admin-accent)]"
                  }
                />
                <span className="text-xs font-black uppercase tracking-widest italic">
                  {item.name}
                </span>

                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-[var(--admin-bg)] rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--admin-border)] opacity-20" />

        <SidebarFooter
          slug={slug}
          negocioNombre={negocioNombre}
          theme={theme}
          setTheme={setTheme}
          onSignOutTrigger={() => setShowLogoutConfirm(true)}
        />
      </aside>

      {/* MODAL DE DESCONEXIÓN (ESTILO FOREST TECH) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-[#0f4023]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[var(--admin-bg)] border-2 border-[var(--admin-border)] p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_var(--admin-border)] relative">
            <div className="mx-auto w-14 h-14 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] flex items-center justify-center mb-6 border-2 border-[var(--admin-danger)] rounded-full">
              <AlertCircle size={28} strokeWidth={2.5} />
            </div>

            <h3 className="font-black text-xl text-[var(--admin-text)] text-center uppercase italic tracking-tighter mb-2">
              Desconectar{" "}
              <span className="text-[var(--admin-accent)]">Terminal</span>
            </h3>

            <p className="text-[10px] font-bold text-[var(--admin-text-muted)] text-center uppercase tracking-widest leading-tight mb-8 opacity-70">
              ¿Confirmás la salida de <br />
              <span className="text-[var(--admin-text)] font-black">
                {negocioNombre || "la unidad actual"}
              </span>
              ?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSignOut}
                className="w-full py-4 bg-[var(--admin-border)] text-[var(--admin-bg)] font-black uppercase italic text-xs tracking-[0.2em] hover:bg-[var(--admin-accent)] transition-all shadow-[4px_4px_0px_0px_var(--admin-accent)]/20"
              >
                Cerrar Terminal
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 border-2 border-[var(--admin-border)] text-[var(--admin-text)] font-black uppercase italic text-[10px] tracking-[0.2em] hover:bg-[var(--admin-surface-accent)] transition-all"
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
