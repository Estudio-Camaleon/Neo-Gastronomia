import { Sidebar } from "@/components/adminPanel/layout/Sidebar";
import { ErrorModal } from "@/components/adminPanel/configuracion/ui/ErrorModal";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AdminThemeWrapper } from "@/components/adminPanel/layout/AdminThemeWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";


import "@/components/adminPanel/style/admin.css";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("user_id", user.id)
    .single();

  if (error || !negocio) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <ErrorModal
          title="Configuración Requerida"
          message="Necesitás configurar tu local para acceder a las herramientas de gestión."
          action={
            <Link
              href="/configuracion"
              className="block w-full py-4 bg-[#A3FF00] text-black font-black uppercase tracking-widest italic border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-center"
            >
              Configurar mi negocio
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AdminThemeWrapper>
        {/* CONTENEDOR MAESTRO: Usa variables del admin.css */}
        <div className="flex min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-300">
          
          {/* SIDEBAR DESKTOP */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r-4 border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 flex flex-col lg:pl-72">
            
            {/* HEADER MÓVIL */}
            <header className="flex lg:hidden items-center justify-between p-4 border-b-4 border-[var(--admin-border)] bg-[var(--admin-surface)] sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--admin-accent)] border-2 border-[var(--admin-border)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                <span className="font-black uppercase italic tracking-tighter text-lg">
                  NEO <span className="text-[var(--admin-accent)]">ADMIN</span>
                </span>
              </div>
              <button className="p-2 bg-[var(--admin-accent)] text-black border-2 border-[var(--admin-border)] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
                <Menu size={24} />
              </button>
            </header>

            {/* AREA DE TRABAJO */}
            <main className="flex-1 p-4 lg:p-10 w-full max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </div>
      </AdminThemeWrapper>
    </ThemeProvider>
  );
}