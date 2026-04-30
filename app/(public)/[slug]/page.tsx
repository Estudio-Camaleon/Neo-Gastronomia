// app/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { MenuCard } from "@/components/menu/MenuCard";
// Importaremos el CategoryFilter cuando agreguemos la lógica de filtros

export default async function PublicMenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { slug } = await params;

  // 1. Obtener datos del negocio
  const { data: negocio } = await supabase
    .from("negocios")
    .select("*, productos(*)")
    .eq("slug", slug)
    .single();

  if (!negocio) notFound();

  return (
    <main className="min-h-screen bg-bg-main dark:bg-bg-darker">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header del negocio */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-text-primary dark:text-text-inverse mb-4">
            {negocio.nombre}
          </h1>
          <p className="text-text-secondary">
            {negocio.whatsapp ? "Haz tu pedido por WhatsApp" : ""}
          </p>
        </header>

        {/* Lista de productos */}
        <div className="space-y-4">
          {negocio.productos.map((prod: any) => (
            <MenuCard
              key={prod.id}
              nombre={prod.nombre}
              descripcion={prod.descripcion}
              precio={prod.precio}
              imagenUrl={prod.imagen_url}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
