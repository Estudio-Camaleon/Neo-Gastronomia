// app/(adminPanel)/layout.tsx
import { Sidebar } from "@/components/adminPanel/Sidebar";
import { ErrorModal } from "@/components/adminPanel/ErrorModal";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function adminPanelLayout({
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
            className="block w-full py-3 bg-primary text-text-primary dark:text-text-inverse font-bold rounded-xl hover:bg-primary-hover transition-all"
          >
            Crear mi negocio ahora
          </Link>
        }
      />
    );
  }

  // Si todo está bien, renderizamos el adminPanel normalmente
  return (
    <div className="flex min-h-screen bg-bg-main dark:bg-bg-darker">
      <Sidebar
        slug={negocio.slug}
        negocioNombre={negocio.nombre}
        stats={{ totalProductos: 0, totalPedidos: 0 }} // Puedes agregar la lógica de conteo aquí también
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
