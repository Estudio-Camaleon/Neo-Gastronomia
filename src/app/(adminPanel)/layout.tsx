import { Suspense } from "react";
import { Sidebar } from "@/features/admin/shared/Sidebar";
import { MobileSidebar } from "@/features/admin/shared/MobileSidebar";
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import "@/features/admin/shared/admin-panel.css";

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

  // 2. Obtención de Contexto Multi-tenant: owner o team member
  let negocio: { slug: string; nombre: string } | null = null;

  const { data: negocios } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  negocio = negocios?.[0] ?? null;

  // Si no es owner, check team_members
  if (!negocio) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (supabase.from("team_members" as any) as any)
      .select("negocio_id")
      .eq("user_id", user.id)
      .limit(1);

    if (memberships?.[0]?.negocio_id) {
      const { data: teamNegocio } = await supabase
        .from("negocios")
        .select("slug, nombre")
        .eq("id", memberships[0].negocio_id)
        .limit(1)
        .single();
      negocio = teamNegocio ?? null;
    }
  }

  if (!negocio) {
    redirect("/login");
  }

  // 4. Ecosistema Operativo Conectado con el Estado del Cliente
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] font-sans antialiased w-full transition-colors duration-200">
        {/* Blobs orgánicos animados */}
        <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-[var(--admin-accent)] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 pointer-events-none animate-blob" />
        <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[var(--admin-accent-secondary)]/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none animate-blob-reverse" />

        {/* Sidebar compacto (sm: 640-768px) - solo iconos */}
        <aside className="hidden sm:flex md:hidden w-16 flex-col fixed inset-y-0 z-20">
          <Sidebar compact slug={negocio.slug} negocioNombre={negocio.nombre} />
        </aside>

        {/* Sidebar expandido (md+ y lg+) */}
        <aside className="hidden md:flex md:w-60 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-20">
          <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
        </aside>

        {/* Contenedor de Trabajo Principal */}
        <div className="flex-1 flex flex-col sm:pl-16 md:pl-60 lg:pl-72 z-10">
          {/* Header - solo visible en mobile (< sm) */}
          <header className="flex sm:hidden items-center justify-between px-3 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] backdrop-blur-lg sticky top-0 z-30 transition-all duration-300 safe-top">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--admin-accent)] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                N
              </div>
              <span className="font-bold text-base sm:text-lg text-[var(--admin-text)] tracking-tight">
                NEO{" "}
                <span className="text-[var(--admin-text-muted)] font-normal text-xs sm:text-sm">
                  Admin
                </span>
              </span>
            </div>
            <MobileSidebar slug={negocio.slug} negocioNombre={negocio.nombre} />
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-10 w-full max-w-7xl mx-auto animate-in fade-in duration-300 relative">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-[60vh]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--neo-brand)] shadow-lg shadow-[var(--neo-brand)]/30">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      <div className="absolute inset-0 animate-pulse rounded-xl bg-white/20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neo-brand)] opacity-50" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--neo-brand)]" />
                      </span>
                      <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                        Cargando...
                      </p>
                    </div>
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
