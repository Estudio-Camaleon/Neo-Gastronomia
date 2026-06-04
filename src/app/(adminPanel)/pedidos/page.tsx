/**
 * NEO SYSTEM v3.0 - Centro Maestro de Monitoreo (Pedidos)
 * Server Component hidratador con soporte de buffer en tiempo real.
 */
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { PedidosRadar } from "@/features/admin/orders/PedidosRadar";
import type { PedidoData } from "@/core/types/domain";

export default async function PedidosPage() {
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

  // Captura inicial indexada (Límite preventivo de 50 registros para evitar lag de buffer)
  const { data: pedidosIniciales } = await supabase
    .from("pedidos")
    .select(
      `
      id, estado, cliente_nombre, metodo_pago, total,
      cliente_whatsapp, es_delivery, direccion_entrega, notas,
      pedido_items (id, cantidad, nombre_producto, precio_unitario, detalles)
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const listaPedidos = (pedidosIniciales || []) as unknown as PedidoData[];

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10 ">
      {/* HEADER DE MONITOREO VIVO */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--admin-border)]/50 ">
        <div className="space-y-2 ">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
            Pedidos en vivo
          </h1>
          <p className="text-[var(--admin-text-muted)] font-medium text-sm ">
            Control de órdenes y despacho inmediato en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--admin-accent)] text-white px-4 py-2 rounded-xl shadow-md shadow-[var(--admin-accent)]/20 font-semibold text-xs tracking-wide">
          <MapPin size={16} />
          {negocio.nombre}
        </div>
      </header>

      {/* RADAR DE CONEXIONES SOCKET INTERACTIVAS */}
      <PedidosRadar
        initialPedidos={listaPedidos}
        negocioId={negocio.id}
        negocioNombre={negocio.nombre}
      />
    </div>
  );
}
