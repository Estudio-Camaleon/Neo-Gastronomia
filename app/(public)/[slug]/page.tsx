import { supabase } from "@/lib/supabase/client";
import { MenuCard } from "@/components/menu/MenuCard";
import { notFound } from "next/navigation";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
  imagen_url: string | null;
  disponible: boolean;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuPublico({ params }: PageProps) {
  const { slug } = await params;

  // 1. Buscamos el negocio por el slug
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("slug", slug)
    .single();

  if (!negocio) {
    notFound();
  }

  // 2. Buscamos los productos del negocio
  // Agregamos 'as Producto[]' para decirle a TS exactamente qué es
  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("negocio_id", negocio.id)
    .eq("disponible", true);

  const productos: Producto[] = data || [];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {negocio.nombre}
        </h1>

        <div className="space-y-4">
          {productos.length > 0 ? (
            productos.map((prod: Producto) => (
              <MenuCard
                key={prod.id}
                nombre={prod.nombre}
                descripcion={prod.descripcion || undefined}
                precio={prod.precio}
                imagenUrl={prod.imagen_url || undefined}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No hay productos disponibles en este momento.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
