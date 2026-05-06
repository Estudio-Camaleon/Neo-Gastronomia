import { Sidebar } from "@/components/adminPanel/layout/Sidebar";
import { ErrorModal } from "@/components/adminPanel/configuracion/ui/ErrorModal";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Control perimetral de sesión activa antes de interrogar a la base de datos
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Deshidratación del contexto comercial del inquilino
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("user_id", user.id)
    .single();

  // SI NO HAY NEGOCIO: Bloqueamos el acceso con el Modal de configuración inicial
  if (error || !negocio) {
    return (
      <ErrorModal
        title="Negocio no configurado"
        message="No pudimos encontrar un negocio asociado a tu cuenta. Para acceder al panel, necesitas crear tu primer negocio."
        action={
          <Link
            href="/crear-negocio"
            className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center border-t border-white/10"
          >
            Crear mi negocio ahora
          </Link>
        }
      />
    );
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-bg-main dark:bg-bg-dark text-text-primary dark:text-text-inverse transition-colors duration-300">
        {/* CORREGIDO: Sidebar limpio libre de props de estadísticas estáticas muertas */}
        <Sidebar slug={negocio.slug} negocioNombre={negocio.nombre} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ThemeProvider>
  );
}
