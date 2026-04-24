import { createClient } from "@/lib/supabase/server"; // Importa solo el de servidor
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default async function AdminPage() {
  // 1. Inicializamos el cliente de servidor (esperamos la promesa)
  const supabase = await createClient();

  // 2. Obtención de usuario (getUser es más seguro en servidor)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 3. Consulta paralela: Negocio + Productos
  const [negocioRes, productosRes] = await Promise.all([
    supabase.from("negocios").select("*").eq("user_id", user.id).single(),
    supabase.from("productos").select("id, disponible").eq("user_id", user.id),
  ]);

  // Si hay error al buscar el negocio, manejamos el caso
  if (negocioRes.error || !negocioRes.data) {
    return (
      <div className="p-8 text-center text-red-600">
        No encontramos tu negocio. Contacta a soporte.
      </div>
    );
  }

  const negocio = negocioRes.data;
  const productos = productosRes.data || [];

  const totalProducts = productos.length;
  const activeProducts = productos.filter((p) => p.disponible).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {negocio.nombre}
        </h1>
        <p className="text-gray-500">
          Administra tu menú y productos desde aquí.
        </p>
      </div>

      <StatsCards
        totalProducts={totalProducts}
        activeProducts={activeProducts}
        totalOrders={0}
      />

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
        <h3 className="font-semibold text-gray-500 mb-2">
          Tu catálogo digital
        </h3>
        <a
          href={`/${negocio.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold hover:underline"
        >
          neo-landing.com/{negocio.slug}
        </a>
      </div>
    </div>
  );
}
