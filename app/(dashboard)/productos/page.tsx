import { createClient } from "@/lib/supabase/server"; // Cliente de servidor
import { redirect } from "next/navigation";
import { ProductsTable } from "@/components/dashboard/ProductsTable";

export default async function ProductosPage() {
  // 1. Inicializar cliente de servidor
  const supabase = await createClient();

  // 2. Obtener usuario (más seguro y directo que getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 3. Obtener ID del negocio y Productos en paralelo
  // Primero el negocio
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (negocioError || !negocio) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">
          Negocio no encontrado
        </h2>
        <p className="text-gray-500">
          Asegúrate de haber creado tu negocio correctamente.
        </p>
      </div>
    );
  }

  // Luego los productos
  const { data: productos = [], error: prodError } = await supabase
    .from("productos")
    .select("*")
    .eq("negocio_id", negocio.id);

  if (prodError) {
    console.error("Error al cargar productos:", prodError);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
          + Nuevo Producto
        </button>
      </div>

      {/* ProductsTable es un Client Component, pero recibe los datos pre-cargados */}
      <ProductsTable initialProducts={productos} />
    </div>
  );
}
