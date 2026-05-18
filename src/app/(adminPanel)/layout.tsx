/**
 * NEO SYSTEM v3.0 - Admin Panel Maestro Layout
 * Server Component de misión crítica. Controla accesos, sesiones y contingencias Multi-tenant.
 */
import { Sidebar } from "@/features/tenant-layout/components/Sidebar";
import { ErrorModal } from "@/features/tenant-branding/ui/ErrorModal";
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Candado de Frontera: Verificación única de sesión en servidor
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Obtención de Contexto Multi-tenant
  const { data: negocio, error: businessError } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("user_id", user.id)
    .single();

  // 3. Contingencia: Si no tiene local asignado, bloquea la terminal e induce registro
  if (businessError || !negocio) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 font-sans">
        <ErrorModal
          title="Terminal Incompleta"
          message="Necesitás inicializar la infraestructura operativa de tu local antes de acceder a las herramientas de control maestro."
          action={
            <Link
              href="/configuracion"
              className="block w-full py-4 bg-[#A3FF00] text-black font-black uppercase tracking-widest text-xs border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center"
            >
              Inicializar Mi Negocio 🍔
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 text-black font-sans antialiased">
        {/* SIDEBAR DESKTOP SÓLIDO BRUTALISTA */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r-4 border-black bg-white">
          <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
        </aside>

        {/* CONTENEDOR DE TRABAJO PRINCIPAL */}
        <div className="flex-1 flex flex-col lg:pl-72">
          {/* HEADER EXCLUSIVO PARA DISPOSITIVOS MÓVILES */}
          <header className="flex lg:hidden items-center justify-between p-4 border-b-4 border-black bg-white sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#A3FF00] border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
              <span className="font-black uppercase italic tracking-tighter text-md">
                NEO<span className="text-gray-400">//</span>ADMIN
              </span>
            </div>
            <button className="p-2 bg-[#A3FF00] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
              <Menu size={20} strokeWidth={3} />
            </button>
          </header>

          {/* ÁREA DE TRABAJO NETO EN RENDER CONTROLADO */}
          <main className="flex-1 p-4 lg:p-10 w-full max-w-7xl mx-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
