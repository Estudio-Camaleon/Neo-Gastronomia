/**
 * NEO SYSTEM v3.0 - Centro Maestro de Monitoreo (Pedidos)
 * Server Component hidratador con soporte de buffer en tiempo real.
 */
import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  PedidosRadar,
  type PedidoData,
} from "@/features/order-engine/admin-components/PedidosRadar";

export default async function PedidosPage() {
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

  // Captura inicial indexada (Límite preventivo de 50 registros para evitar lag de buffer)
  const { data: pedidosIniciales } = await supabase
    .from("pedidos")
    .select(
      `
      id, estado, cliente_nombre, metodo_pago, total,
      cliente_whatsapp, es_delivery, direccion_entrega, notas,
      pedido_items (id, cantidad, nombre_producto, precio_unitario)
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const listaPedidos = (pedidosIniciales || []) as unknown as PedidoData[];

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative font-sans text-black">
      {/* HEADER DE MONITOREO VIVO */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-black pb-4">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Pedidos<span className="text-[#A3FF00]">.</span>
          </h1>
          <p className="text-gray-400 font-mono font-black uppercase text-[10px] tracking-widest">
            Control de comisiones y despacho inmediato en tiempo real
          </p>
        </div>

        <div className="bg-black text-[#A3FF00] px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono font-black uppercase text-xs tracking-wider transform -rotate-1">
          📍 LOCAL: {negocio.nombre.toUpperCase()}
        </div>
      </header>

      {/* RADAR DE CONEXIONES SOCKET INTERACTIVAS */}
      <PedidosRadar
        initialPedidos={listaPedidos}
        negocioId={negocio.id}
        negocioNombre={negocio.nombre}
      />

      {/* MARCA DE AGUA INDUSTRIAL FLOOD BACKGROUND */}
      <div className="fixed bottom-12 right-12 pointer-events-none opacity-[0.02] select-none hidden xl:block z-0">
        <h2 className="text-[16rem] font-black italic leading-none tracking-tighter">
          NEO
        </h2>
      </div>
    </div>
  );
}
