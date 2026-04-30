import { Sidebar } from "@/components/adminPanel/Sidebar";
import { ErrorModal } from "@/components/adminPanel/ErrorModal";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("slug, nombre")
    .eq("user_id", user?.id)
    .single();

  // SI NO HAY NEGOCIO: Bloqueamos el acceso con el Modal
  if (error || !negocio) {
    return (
      <ErrorModal
        title="Negocio no configurado"
        message="No pudimos encontrar un negocio asociado a tu cuenta. Para acceder al panel, necesitas crear tu primer negocio."
        action={
          <Link
            href="/crear-negocio"
            className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
          >
            Crear mi negocio ahora
          </Link>
        }
      />
    );
  }

  // LIMPIEZA: Quitamos las props que ya no existen en nuestro ThemeProvider personalizado
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-bg-main dark:bg-bg-dark text-text-primary dark:text-text-inverse transition-colors duration-300">
        <Sidebar
          slug={negocio.slug}
          negocioNombre={negocio.nombre}
          stats={{ totalProductos: 0, totalPedidos: 0 }}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ThemeProvider>
  );
}
