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

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user?.id ?? "")
    .limit(1);

  const negocio = negocios?.[0] ?? null;
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
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-[var(--admin-text)]">
          Catálogo Público de{" "}
          <span className="font-bold text-[var(--admin-text)]">
            {negocio.nombre}
          </span>
        </h1>
      </header>

      {/* SECCIÓN REACTIVA CRUD DE INVENTARIO */}
      <AddProductSection negocioId={negocio.id} />
    </div>
  );
}
