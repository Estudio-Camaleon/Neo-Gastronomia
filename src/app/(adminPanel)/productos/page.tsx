/**
 * NEO SYSTEM v3.0 - Almacén Central (Productos & Menú)
 * Server Component acelerador de catálogo Multi-tenant.
 */
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package, CheckCircle2 } from "lucide-react";
import { AddProductSection } from "@/features/admin/catalog/components/AddProductSection";

export default async function ProductosAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user?.id ?? "")
    .single();

  if (!negocio) redirect("/configuracion");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 relative z-10">
      {/* HEADER DE ALMACÉN */}
      <header className="border-b border-[var(--admin-border)]/50 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
          <Package size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Gestión de Catálogo
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
          Menú & Stock
        </h1>
        <p className="text-[var(--admin-text-muted)] text-sm font-medium">
          Administrando las existencias del catálogo público de:{" "}
          <span className="font-semibold text-[var(--admin-text)]">
            {negocio.nombre}
          </span>
        </p>
      </header>

      {/* SECCIÓN REACTIVA CRUD DE INVENTARIO */}
      <AddProductSection negocioId={negocio.id} />

      {/* FOOTER ADAPTATIVO */}
      <footer className="pt-8 border-t border-[var(--admin-border)]/30 flex justify-between items-center select-none text-[var(--admin-text-muted)]">
        <p className="text-xs font-medium tracking-wide">NEO ENGINE v3.0</p>
        <div className="flex gap-2 items-center text-xs font-semibold">
          <CheckCircle2 size={14} className="text-[var(--admin-accent)]" />
          <span>Sincronizado</span>
        </div>
      </footer>
    </div>
  );
}
