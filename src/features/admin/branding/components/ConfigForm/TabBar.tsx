"use client";

import { Palette, FileText, Settings2, Clock, Bell, Crown, LifeBuoy, AlertTriangle } from "lucide-react";

export const TABS = [
  { id: "identidad", label: "Identidad Visual", icon: Palette, color: "#8b5cf6" },
  { id: "informacion", label: "Información", icon: FileText, color: "#3b82f6" },
  { id: "operacion", label: "WhatsApp", icon: Settings2, color: "#64748b" },
  { id: "horarios", label: "Horarios", icon: Clock, color: "#f97316" },
  { id: "notificaciones", label: "Notificaciones", icon: Bell, color: "#06b6d4" },
  { id: "suscripcion", label: "Suscripción", icon: Crown, color: "#f59e0b" },
  { id: "soporte", label: "Soporte", icon: LifeBuoy, color: "#14b8a6" },
  { id: "peligro", label: "Peligro", icon: AlertTriangle, color: "#ef4444" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="sticky top-0 z-50 w-full min-w-0">
      <nav
        className="flex flex-wrap lg:flex-nowrap items-center gap-0.5 px-1.5 py-1.5 border border-[var(--admin-border)] rounded-xl bg-[var(--admin-surface)]/80 backdrop-blur-xl shadow-sm"
        role="tablist"
        aria-label="Secciones de configuración"
      >
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => onChange(id)}
            style={
              activeTab === id
                ? { "--tab-color": color, "--tab-color-alpha": `${color}1a` } as React.CSSProperties
                : undefined
            }
            className={`touch-target flex items-center gap-1 max-sm:gap-1 px-2.5 max-sm:px-2 py-2 text-[15px] font-semibold whitespace-nowrap rounded-lg transition-all duration-200 ${
              activeTab === id
                ? "bg-[var(--tab-color-alpha)] text-[var(--tab-color)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]/50"
            }`}
          >
            <Icon className="size-3.5 max-sm:size-3" strokeWidth={activeTab === id ? 2.5 : 1.5} />
            <span className="max-sm:text-[12px] max-sm:leading-tight">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
