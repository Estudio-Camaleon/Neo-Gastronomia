/**
 * NEO SYSTEM v3.0 - Almacén Central (Productos & Menú)
 * Server Component acelerador de catálogo Multi-tenant.
 */
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { AddProductSection } from "@/features/catalog-management/components/AddProductSection";

export default async function ProductosAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user?.id)
    .single();

  if (!negocio) redirect("/configuracion");

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-black pb-16">
      {/* HEADER DE ALMACÉN */}
      <header className="border-b-4 border-black pb-4 space-y-1">
        <div className="flex items-center gap-2 text-gray-400">
          <Package size={14} className="text-black" />
          <span className="text-[10px] font-mono font-black uppercase tracking-widest">
            LOGISTICS // CATALOG ARCHITECTURE
          </span>
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-black">
          Menú & Stock
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          Administrando las existencias del catálogo público de:{" "}
          <span className="underline font-black text-black">
            {negocio.nombre.toUpperCase()}
          </span>
        </p>
      </header>

      {/* SECCIÓN REACTIVA CRUD DE INVENTARIO */}
      <AddProductSection negocioId={negocio.id} />

      {/* FOOTER ADAPTATIVO */}
      <footer className="pt-8 border-t-2 border-dashed border-black/10 opacity-30 flex justify-between items-center select-none">
        <p className="text-[9px] font-black uppercase tracking-widest italic font-mono">
          NEO ENGINE LOG v3.0
        </p>
        <div className="flex gap-2 items-center text-[9px] font-mono font-black uppercase">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sincronizado</span>
        </div>
      </footer>
    </div>
  );
}
