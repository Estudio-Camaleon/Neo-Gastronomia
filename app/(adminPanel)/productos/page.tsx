import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductsTable } from "@/components/adminPanel/ProductsTable";
import { AddProductSection } from "../../../components/adminPanel/AddProductSection"; // Componente nuevo

export default async function ProductosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Obtener ID del negocio y categorías (para el Join)
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (negocioError || !negocio) {
    return (
      <div className="p-8 text-center font-bold">
        Configura tu negocio primero.
      </div>
    );
  }

  // 2. Obtener productos con Join a Categorías
  const { data: productosRaw } = await supabase
    .from("productos")
    .select(
      `
      id, 
      nombre, 
      precio, 
      disponible,
      categorias (nombre)
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false });

  const productos = (productosRaw || []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre || "Sin nombre",
    precio: Number(p.precio) || 0,
    disponible: !!p.disponible,
    categoria: p.categorias?.nombre || "General", // Mostramos el nombre de la categoría
  }));

  return (
    <div className="p-8 mx-auto min-h-screen pb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-text-primary dark:text-text-inverse uppercase tracking-tighter">
            Mis Productos
          </h1>
          <p className="text-text-muted text-sm font-medium">
            Gestiona tu menú y disponibilidad.
          </p>
        </div>

        {/* Este componente maneja el estado del Modal */}
        <AddProductSection negocioId={negocio.id} />
      </div>

      <ProductsTable initialProducts={productos ?? []} />
    </div>
  );
}
