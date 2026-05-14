"use client";

import { Sun, Moon, ExternalLink, LogOut } from "lucide-react";

interface SidebarFooterProps {
  slug?: string;
  negocioNombre?: string;
  theme: string;
  setTheme: (theme: string) => void;
  onSignOutTrigger: () => void;
}

export function SidebarFooter({
  slug,
  negocioNombre,
  theme,
  setTheme,
  onSignOutTrigger,
}: SidebarFooterProps) {
  return (
    <div className="space-y-6">
      {/* SWITCHER DE TEMA (ESTILO HARDWARE) */}
      <div className="grid grid-cols-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] p-1 shadow-[2px_2px_0px_0px_var(--admin-border)]">
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase transition-all ${
            theme === "light"
              ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]"
              : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          }`}
        >
          <Sun size={12} strokeWidth={3} /> Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase transition-all ${
            theme === "dark"
              ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]"
              : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          }`}
        >
          <Moon size={12} strokeWidth={3} /> Dark
        </button>
      </div>

      {/* MODULO DE ACCESO RÁPIDO */}
      {slug && (
        <div className="bg-[var(--admin-surface-accent)]/30 border-l-2 border-[var(--admin-accent)] p-3 group transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--admin-accent)] opacity-70">
              Live Gateway
            </span>
            <ExternalLink
              size={10}
              className="opacity-30 group-hover:opacity-100 transition-all"
            />
          </div>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono font-bold text-[var(--admin-text)] truncate block hover:text-[var(--admin-accent)] transition-colors"
          >
            neo.app/{slug}
          </a>
        </div>
      )}

      {/* IDENTIDAD DE SESIÓN */}
      <button
        type="button"
        onClick={onSignOutTrigger}
        className="w-full flex items-center gap-3 p-3 group transition-all"
      >
        <div className="p-2 bg-[var(--admin-surface-accent)] text-[var(--admin-text-muted)] group-hover:bg-[var(--admin-danger)] group-hover:text-white transition-colors border border-[var(--admin-border)]/10">
          <LogOut size={14} strokeWidth={3} />
        </div>
        <div className="flex flex-col items-start overflow-hidden">
          <span className="text-[9px] font-black uppercase tracking-tighter text-[var(--admin-text-muted)] group-hover:text-[var(--admin-danger)] transition-colors">
            End Session
          </span>
          <span className="text-[10px] font-bold text-[var(--admin-text)] truncate w-full text-left opacity-60">
            {negocioNombre || "Node_01"}
          </span>
        </div>
      </button>
    </div>
  );
}
