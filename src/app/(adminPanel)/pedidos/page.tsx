import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { PedidosRadar } from "@/features/admin/orders/PedidosRadar";
import type { PedidoData } from "@/core/types/domain";

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let negocioIds: string[] = [];
  let negocioNombre = "";
  let panicModeInicial = false;

  let whatsappMensajes: Record<string, string> | null = null;

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nombre, recepcion_pausada, whatsapp_mensajes")
    .eq("user_id", user.id);

  if (negocios && negocios.length > 0) {
    negocioIds = negocios.map((n) => n.id);
    negocioNombre = negocios.map((n) => n.nombre).join(", ");
    panicModeInicial = negocios.some((n) => n.recepcion_pausada === true);
    whatsappMensajes = negocios[0]?.whatsapp_mensajes as Record<string, string> | null;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (supabase.from("team_members" as any) as any)
      .select("negocio_id, rol")
      .eq("user_id", user.id);

    if (memberships && memberships.length > 0) {
      negocioIds = memberships.map((m: { negocio_id: string }) => m.negocio_id);
      const { data: teamNegocios } = await supabase
        .from("negocios")
        .select("id, nombre")
        .in("id", negocioIds);

      negocioNombre = teamNegocios?.map((n) => n.nombre).join(", ") ?? "Mi negocio";
    } else {
      redirect("/configuracion");
    }
  }

  const { data: pedidosIniciales } = await supabase
    .from("pedidos")
    .select(
      `
      id, estado, cliente_nombre, metodo_pago, total,
      cliente_whatsapp, es_delivery, direccion_entrega, notas, created_at,
      pedido_items (id, cantidad, nombre_producto, precio_unitario, detalles)
    `,
    )
    .in("negocio_id", negocioIds)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<PedidoData[]>();

  const listaPedidos = pedidosIniciales || [];

  return (
    <div className="space-y-8 relative z-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[var(--admin-border)]/50 ">
        <div className="space-y-2 ">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
            Recepción de pedidos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] font-medium">
            Control de órdenes y despacho inmediato en tiempo real
          </p>
        </div>

        
      </header>

      <PedidosRadar
        initialPedidos={listaPedidos}
        negocioIds={negocioIds}
        negocioNombre={negocioNombre}
        panicModeInicial={panicModeInicial}
        whatsappMensajes={whatsappMensajes}
      />
    </div>
  );
}
