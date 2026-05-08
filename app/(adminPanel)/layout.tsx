import { Sidebar } from "@/components/adminPanel/layout/Sidebar";
import { ErrorModal } from "@/components/adminPanel/configuracion/ui/ErrorModal";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react"; // Importamos el icono de menú

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
      <div className="fixed inset-0 bg-bg-dark/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <ErrorModal
          title="Configuración Requerida"
          message="Necesitás configurar tu local para acceder a las herramientas de gestión."
          action={
            <Link
              href="/configuracion"
              className="block w-full py-4 bg-primary text-white font-black uppercase tracking-widest italic rounded-neo border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-center"
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
      {/* CONTENEDOR MAESTRO */}
      <div className="flex min-h-screen bg-bg-main dark:bg-bg-dark text-text-primary dark:text-text-inverse transition-colors duration-300">
        {/* SIDEBAR: 
            En desktop (lg) es relativo y visible. 
            En móvil está oculto (hidden) hasta que agreguemos el disparador cliente. 
        */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r-2 border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
        </aside>

        {/* CONTENIDO PRINCIPAL: 
            Agregamos pl-0 en móvil y pl-72 en desktop para compensar el fixed sidebar.
        */}
        <div className="flex-1 flex flex-col lg:pl-72">
          {/* HEADER MÓVIL: Solo visible en pantallas chicas */}
          <header className="flex lg:hidden items-center justify-between p-4 border-b-2 border-border dark:border-border-dark bg-surface dark:bg-surface-dark sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md" />
              <span className="font-black uppercase italic tracking-tighter text-sm">
                NEO
              </span>
            </div>
            <button className="p-2 bg-primary/10 text-primary rounded-neo border border-primary/20">
              <Menu size={20} />
            </button>
          </header>

          <main className="flex-1 p-4 lg:p-10 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
