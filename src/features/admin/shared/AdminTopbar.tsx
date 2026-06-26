"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Copy, Check, ExternalLink } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import { NotificationBell } from "@/features/admin/notifications/NotificationBell";
import { toast } from "sonner";

const SECTION_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pedidos": "Pedidos",
  "/productos": "Productos",
  "/clientes": "Clientes",
  "/promos": "Promos",
  "/estadisticas": "Estadísticas",
  "/configuracion": "Configuración",
};

function getSectionName(pathname: string): string {
  const exact = SECTION_NAMES[pathname];
  if (exact) return exact;
  const prefix = Object.keys(SECTION_NAMES).find((k) => pathname.startsWith(k));
  return prefix ? SECTION_NAMES[prefix] : "";
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface AdminTopbarProps {
  slug: string;
}

export function AdminTopbar({ slug }: AdminTopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const now = useClock();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      const url = `${window.location.origin}/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link de tienda copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }, [slug]);

  const sectionName = getSectionName(pathname);

  return (
    <header className="max-[1439px]:hidden flex items-center justify-between h-14 px-6 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 backdrop-blur-lg sticky top-0 z-[60]">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-bold text-[var(--admin-text)] tracking-tight truncate">
          {sectionName || "Panel"}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Reloj */}
        {now && (
          <div className="hidden xl:flex items-center gap-3 mr-2 text-[11px] text-[var(--admin-text-muted)] font-medium select-none">
            <span className="capitalize">{formatDate(now)}</span>
            <span className="font-mono tabular-nums">{formatTime(now)}</span>
          </div>
        )}

        {/* Separador */}
        <div className="h-5 w-px bg-[var(--admin-border)] mx-1 hidden xl:block" />

        {/* Link tienda */}
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver tienda"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all active:scale-90"
        >
          <ExternalLink size={16} />
        </a>

        {/* Copiar link */}
        <button
          onClick={handleCopyLink}
          aria-label="Copiar link de la tienda"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all active:scale-90"
        >
          {copied ? <Check size={16} className="text-[var(--admin-success)]" /> : <Copy size={16} />}
        </button>

        {/* Notificaciones */}
        <NotificationBell variant="header" />

        {/* Tema */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Tema claro" : "Tema oscuro"}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all active:scale-90"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}
      </div>
    </header>
  );
}
