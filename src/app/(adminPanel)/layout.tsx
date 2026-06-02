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
      <div className="admin-theme-wrapper min-h-screen flex items-center justify-center antialiased font-sans">
        <ErrorModal
          title="Terminal Incompleta"
          message="Necesitás inicializar la infraestructura operativa de tu local antes de acceder a las herramientas de control maestro."
          action={
            <div className="flex flex-col gap-3.5 w-full">
              <TransitionLink
                href="/registro"
                className="btn-primary w-full py-4 text-center"
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
                  className="btn-ghost text-xs"
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
          {/* Blobs orgánicos animados */}
          <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-[var(--admin-accent)] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 pointer-events-none animate-blob" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[var(--admin-accent-secondary)]/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none animate-blob-reverse" />

          {/* Sidebar de Escritorio */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-20">
            <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
          </aside>

          {/* Contenedor de Trabajo Principal */}
          <div className="flex-1 flex flex-col lg:pl-72 z-10">
            {/* Header de Dispositivos Móviles */}
            <header className="flex lg:hidden items-center justify-between p-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] backdrop-blur-lg sticky top-0 z-30 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--admin-accent)] flex items-center justify-center text-white font-bold shadow-sm">
                  N
                </div>
                <span className="font-bold text-lg text-[var(--admin-text)] tracking-tight">
                  NEO{" "}
                  <span className="text-[var(--admin-text-muted)] font-normal text-sm">
                    Admin
                  </span>
                </span>
              </div>
              <button className="p-2 bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] rounded-xl hover:bg-[var(--admin-accent)]/10 transition-all duration-200 cursor-pointer outline-none active:scale-95">
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
