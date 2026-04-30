import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductsTable } from "@/components/adminPanel/ProductsTable";

export default async function ProductosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Obtener ID del negocio
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (negocioError || !negocio) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <h2 className="text-xl font-bold text-text-primary">
          Negocio no encontrado
        </h2>
        <p>Asegúrate de haber creado tu negocio correctamente.</p>
      </div>
    );
  }

  // 2. Obtener productos con validación de tipos
  const { data: productosRaw, error: prodError } = await supabase
    .from("productos")
    .select("id, nombre, precio, disponible")
    .eq("negocio_id", negocio.id);

  if (prodError) {
    console.error("Error al cargar productos:", prodError);
  }

  // Mapeo seguro para el componente
  const productos = (productosRaw || []).map((p) => ({
    id: p.id,
    nombre: p.nombre || "Sin nombre",
    precio: Number(p.precio) || 0,
    disponible: !!p.disponible,
  }));

  return (
    <div className="p-8 mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-inverse">
          Mis Productos
        </h1>
        <button className="bg-primary text-text-primary dark:text-text-inverse px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-sm">
          + Nuevo Producto
        </button>
      </div>

      {/* Tabla con diseño Dark Premium */}
      <ProductsTable initialProducts={productos} />
    </div>
  );
}
