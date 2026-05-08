"use client";

import { Sun, Moon } from "lucide-react";

interface SidebarFooterProps {
  slug?: string;
  negocioNombre?: string;
  mounted: boolean;
  _theme: string; // <--- Cambiado aquí
  setTheme: (theme: string) => void;
  onSignOutTrigger: () => void;
}

export function SidebarFooter({
  slug,
  negocioNombre,
  mounted,
  _theme, // <--- Cambiado aquí
  setTheme,
  onSignOutTrigger,
}: SidebarFooterProps) {
  return (
    <div className="mt-auto space-y-4 pt-6 border-t border-border dark:border-border-dark">
      {/* THEME SWITCHER INTEGRADO */}
      <div className="flex items-center justify-between bg-bg-main dark:bg-bg-darker p-1 rounded-2xl border border-border dark:border-border-dark">
        <button
          onClick={() => setTheme("light")}
          className={`flex-1 flex justify-center py-2 rounded-xl transition-all ${
            mounted && _theme === "light"
              ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
          title="Modo Claro"
        >
          <Sun size={16} strokeWidth={mounted && _theme === "light" ? 3 : 2} />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`flex-1 flex justify-center py-2 rounded-xl transition-all ${
            mounted && _theme === "dark"
              ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
          title="Modo Oscuro"
        >
          <Moon size={16} strokeWidth={mounted && _theme === "dark" ? 3 : 2} />
        </button>
      </div>

      {slug && (
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 font-sans">
          <p className="text-[10px] uppercase tracking-widest text-primary/70 font-black mb-1">
            Catálogo Público
          </p>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black text-primary hover:underline truncate block"
          >
            neo.app/{slug}
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={onSignOutTrigger}
        className="w-full flex flex-col items-start p-3 hover:bg-error/10 rounded-2xl transition-all group border border-transparent hover:border-error/20 font-sans"
      >
        <span className="text-[10px] uppercase font-black tracking-widest text-text-muted group-hover:text-error transition-colors">
          Cerrar sesión
        </span>
        <span className="text-sm font-bold text-text-primary dark:text-text-inverse truncate w-full text-left">
          {negocioNombre || "Mi Negocio"}
        </span>
      </button>
    </div>
  );
}
