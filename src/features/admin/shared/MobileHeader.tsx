"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Sun, Moon, LogOut, Check, Copy } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import { NotificationBell } from "@/features/admin/notifications/NotificationBell";
import { createClient } from "@/core/lib/supabase/client";
import { LogoutModal } from "@/components/ui/logout-modal";
import { toast } from "sonner";

const SECTION_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pedidos": "Pedidos",
  "/productos": "Productos",
  "/clientes": "Clientes",
  "/promos": "Promos Promociones",
  "/estadisticas": "Estadísticas",
  "/configuracion": "Configuración",
};

function getSectionName(pathname: string): string {
  const exact = SECTION_NAMES[pathname];
  if (exact) return exact;
  const prefix = Object.keys(SECTION_NAMES).find((k) => pathname.startsWith(k));
  return prefix ? SECTION_NAMES[prefix] : "";
}

interface MobileHeaderProps {
  slug: string;
}

export function MobileHeader({ slug }: MobileHeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
    <>
      <header className="flex lg:hidden items-center justify-between px-4 pt-3 pb-2.5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 backdrop-blur-lg sticky top-0 z-[60] safe-top">
        {/* Logo + Sección */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/icons/neo_logo_negro.webp"
            alt="NEO"
            width={32}
            height={32}
            className="object-contain dark:invert shrink-0"
            priority
          />
          {sectionName && (
            <span className="text-xs font-black text-[var(--admin-text)] tracking-tight truncate">
              {sectionName}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1">
          {/* Notificaciones */}
          <NotificationBell variant="header" />

          {/* Copiar link tienda */}
          <button
            onClick={handleCopyLink}
            aria-label="Copiar link de la tienda"
            className="touch-target flex items-center justify-center w-10 h-10 rounded-lg transition-all active:scale-90 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[var(--admin-success)] text-[11px] font-bold whitespace-nowrap">
                <Check size={16} />
                OK
              </span>
            ) : (
              <Copy size={16} />
            )}
          </button>

          {/* Cambiar tema */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Tema claro" : "Tema oscuro"}
              className="touch-target flex items-center justify-center w-10 h-10 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all active:scale-90"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Separador */}
          <div className="w-px h-6 bg-[var(--admin-border)] mx-0.5 shrink-0" />

          {/* Cerrar sesión */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Cerrar sesión"
            className="touch-target flex items-center justify-center w-10 h-10 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={handleSignOut}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
