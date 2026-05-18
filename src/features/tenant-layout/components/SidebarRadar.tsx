"use client";
import { Activity } from "lucide-react";

export function SidebarRadar({ negocioId }: { negocioId?: string | null }) {
  return (
    <div className="bg-[var(--admin-surface-accent)]/50 border border-[var(--admin-border)]/10 p-4 shadow-inner relative overflow-hidden">
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative flex items-center justify-center">
          <Activity size={16} className="text-[var(--admin-accent)]" />
          <div className="absolute inset-0 bg-[var(--admin-accent)] opacity-20 blur-lg animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-tight text-[var(--admin-text)]">
            Radar de Enlace
          </span>
          <span className="text-[8px] font-bold text-[var(--admin-accent)] uppercase animate-pulse">
            Sincronizando...
          </span>
        </div>
      </div>
      {/* Detalle decorativo de datos */}
      <div className="mt-3 flex gap-1 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 h-3 bg-[var(--admin-text)]"
            style={{ height: `${Math.random() * 12 + 4}px` }}
          />
        ))}
      </div>
    </div>
  );
}
