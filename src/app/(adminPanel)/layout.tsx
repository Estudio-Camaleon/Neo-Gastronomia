import { Sidebar } from "@/features/admin/shared/Sidebar";
import { ErrorModal } from "@/components/ui/error-modal";
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { LoadingProvider } from "@/core/providers/LoadingProvider";
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";
import "@/features/admin/shared/admin-panel.css";
import { TransitionLink } from "@/components/ui/transition-link";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Candado de Seguridad en Servidor
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

  // 3. Contingencia: Si no posee local asignado
  if (businessError || !negocio) {
    return (
      <div className="admin-theme-wrapper min-h-screen bg-[#f4f4f4] text-[#0f172a] flex items-center justify-center antialiased font-sans">
        <ErrorModal
          title="Terminal Incompleta"
          message="Necesitás inicializar la infraestructura operativa de tu local antes de acceder a las herramientas de control maestro."
          action={
            <div className="flex flex-col gap-3.5 w-full">
              <TransitionLink
                href="/registro"
                className="block w-full py-4 bg-[#34a35f] hover:bg-[#2e8f53] text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-center text-sm tracking-wide"
              >
                Completar Registro de Local
              </TransitionLink>

              <form
                action={async () => {
                  "use server";
                  const client = await createClient();
                  await client.auth.signOut();
                  redirect("/login");
                }}
                className="w-full flex justify-center"
              >
                <button
                  type="submit"
                  className="text-xs text-zinc-500 hover:text-zinc-800 hover:underline transition-colors text-center font-medium bg-transparent border-none cursor-pointer py-1 outline-none"
                >
                  Cerrar sesión o cambiar de cuenta
                </button>
              </form>
            </div>
          }
        />
      </div>
    );
  }

  // 4. Ecosistema Operativo Conectado con el Estado del Cliente
  return (
    <LoadingProvider>
      <ThemeProvider>
        <div className="flex min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] font-sans antialiased w-full transition-colors duration-200">
          {/* Elementos geométricos optimizados sin ralentización de GPU */}
          <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-[var(--admin-border)] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 pointer-events-none" />
          <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-[var(--admin-accent)] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" />

          {/* Sidebar de Escritorio */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-20">
            <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
          </aside>

          {/* Contenedor de Trabajo Principal */}
          <div className="flex-1 flex flex-col lg:pl-72 z-10">
            {/* Header de Dispositivos Móviles */}
            <header className="flex lg:hidden items-center justify-between p-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/80 backdrop-blur-md sticky top-0 z-30 shadow-xs transition-colors duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--admin-accent)] rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
                  N
                </div>
                <span className="font-bold text-lg text-[var(--admin-text)] tracking-tight">
                  NEO{" "}
                  <span className="text-[var(--admin-text-muted)] font-normal text-sm">
                    Admin
                  </span>
                </span>
              </div>
              <button className="p-2 bg-[var(--admin-border)]/40 text-[var(--admin-accent)] rounded-lg hover:bg-[var(--admin-border)] transition-colors cursor-pointer outline-none">
                <Menu size={20} />
              </button>
            </header>

            <main className="flex-1 p-4 md:p-6 lg:p-10 w-full max-w-7xl mx-auto animate-in fade-in duration-300 relative">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </LoadingProvider>
  );
}
