"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, AlertTriangle } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

// SINCENAMIENTO DE IMPORTACIONES NOMBRADAS (Named Imports)
import { SidebarLogo } from "./sections/SidebarLogo";
import { SidebarRadar } from "./sections/SidebarRadar";
import { SidebarNavigation } from "./sections/SidebarNavigation";
import { SidebarFooter } from "./sections/SidebarFooter";

interface SidebarProps {
  slug?: string;
  negocioNombre?: string;
}

export function Sidebar({ slug, negocioNombre }: SidebarProps) {
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [negocioId, setNegocioId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function obtenerContextoNegocio() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("negocios")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) setNegocioId(data.id);
    }
    obtenerContextoNegocio();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <aside className="w-64 bg-surface dark:bg-surface-dark border-r border-border dark:border-border-dark p-6 flex flex-col h-screen sticky top-0 transition-colors duration-300 z-40">
        <SidebarLogo mounted={mounted} theme={theme} />

        <SidebarRadar negocioId={negocioId} />

        <SidebarNavigation />

        <SidebarFooter
          slug={slug}
          negocioNombre={negocioNombre}
          mounted={mounted}
          _theme={theme}
          setTheme={setTheme}
          onSignOutTrigger={() => setShowConfirm(true)}
        />
      </aside>

      {/* MODAL DE CONFIRMACIÓN ESTILO NEO-BRUTALISTA */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-bg-darker border-4 border-black dark:border-border-dark p-6 max-w-sm w-full rounded-super shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(38,38,38,1)] animate-in zoom-in-95 duration-200 text-center font-sans">
            <div className="mx-auto w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4 border-2 border-error">
              <AlertTriangle size={22} />
            </div>
            <h3 className="font-black uppercase italic text-xl tracking-tighter text-text-primary dark:text-text-inverse leading-none mb-2">
              ¿Cerrar Sesión Operativa?
            </h3>
            <p className="text-xs font-medium text-text-muted dark:text-text-muted/80 leading-relaxed mb-6">
              Vas a salir del Panel de Control de{" "}
              <span className="font-black text-text-primary dark:text-text-inverse">
                {negocioNombre || "tu negocio"}
              </span>
              . El radar dejará de escuchar pedidos en vivo.
            </p>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="py-3 border-2 border-border dark:border-border-dark rounded-xl text-xs font-black uppercase text-text-secondary dark:text-text-inverse hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="py-3 bg-error text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all border-t border-white/10 shadow-sm"
              >
                <LogOut size={13} strokeWidth={3} /> Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
