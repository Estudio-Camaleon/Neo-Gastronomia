"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react"; // Importamos íconos para el switch
import { useTheme } from "@/components/providers/ThemeProvider";
interface SidebarProps {
  slug?: string;
  negocioNombre?: string;
  stats: { totalProductos: number; totalPedidos: number };
}

export function Sidebar({ slug, negocioNombre, stats }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // Extraemos setTheme
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: "Pedidos", href: "/pedidos", icon: "📦" },
    { name: "Productos", href: "/productos", icon: "🏷️" },
    { name: "Clientes", href: "/clientes", icon: "👥" },
    { name: "Configuración", href: "/configuracion", icon: "⚙️" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-surface dark:bg-surface-dark border-r border-border dark:border-border-dark p-6 flex flex-col h-screen sticky top-0 transition-colors duration-300">
      {/* LOGO DINÁMICO */}
      <div className="mb-8">
        <Link
          href="/pedidos"
          className="inline-block transition-transform active:scale-95"
        >
          <img
            src={
              mounted && theme === "dark"
                ? "/icons/neo_logo_blanco.svg"
                : "/icons/neo_logo_negro.svg"
            }
            alt="Logo NEO"
            className="h-8 w-auto transition-opacity duration-300"
          />
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 gap-2 mb-8">
        <div className="bg-bg-main dark:bg-bg-darker p-3 rounded-xl border border-border dark:border-border-dark text-center">
          <p className="text-[10px] uppercase font-black tracking-tighter text-text-muted mb-1">
            Productos
          </p>
          <p className="font-black text-text-primary dark:text-text-inverse text-lg">
            {stats.totalProductos}
          </p>
        </div>
        <div className="bg-bg-main dark:bg-bg-darker p-3 rounded-xl border border-border dark:border-border-dark text-center">
          <p className="text-[10px] uppercase font-black tracking-tighter text-text-muted mb-1">
            Pedidos
          </p>
          <p className="font-black text-text-primary dark:text-text-inverse text-lg">
            {stats.totalPedidos}
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-text-secondary hover:bg-bg-main dark:hover:bg-bg-darker hover:text-text-primary dark:hover:text-text-inverse"
              }`}
            >
              <span className={isActive ? "opacity-100" : "opacity-50"}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Theme Switcher + Catálogo + SignOut */}
      <div className="mt-auto space-y-4 pt-6 border-t border-border dark:border-border-dark">
        {/* THEME SWITCHER INTEGRADO */}
        <div className="flex items-center justify-between bg-bg-main dark:bg-bg-darker p-1 rounded-2xl border border-border dark:border-border-dark">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 flex justify-center py-2 rounded-xl transition-all ${
              mounted && theme === "light"
                ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
            title="Modo Claro"
          >
            <Sun size={16} strokeWidth={mounted && theme === "light" ? 3 : 2} />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 flex justify-center py-2 rounded-xl transition-all ${
              mounted && theme === "dark"
                ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
            title="Modo Oscuro"
          >
            <Moon size={16} strokeWidth={mounted && theme === "dark" ? 3 : 2} />
          </button>
        </div>

        {slug && (
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-black mb-1">
              Catálogo Público
            </p>
            <a
              href={`/${slug}`}
              target="_blank"
              className="text-xs font-black text-primary hover:underline truncate block"
            >
              neo.app/{slug}
            </a>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex flex-col items-start p-3 hover:bg-error/10 rounded-2xl transition-all group border border-transparent hover:border-error/20"
        >
          <span className="text-[10px] uppercase font-black tracking-widest text-text-muted group-hover:text-error">
            Cerrar sesión
          </span>
          <span className="text-sm font-bold text-text-primary dark:text-text-inverse truncate w-full text-left">
            {negocioNombre || "Mi Negocio"}
          </span>
        </button>
      </div>
    </aside>
  );
}
