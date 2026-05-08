import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  PedidosRadar,
  type PedidoData,
} from "@/components/adminPanel/pedidos/PedidosRadar";

export default async function PedidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .single();

  if (!negocio) redirect("/configuracion");

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
    <div className="max-w-7xl mx-auto space-y-10 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
            Pedidos<span className="text-primary">.</span>
          </h1>
          <p className="text-text-muted font-bold uppercase text-xs tracking-[0.2em] mt-2">
            Centro de monitoreo en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-neo text-primary font-black text-[10px] uppercase">
            {negocio.nombre}
          </div>
        </div>
      </header>

      <PedidosRadar
        initialPedidos={listaPedidos}
        negocioId={negocio.id}
        negocioNombre={negocio.nombre}
      />

      <div className="fixed bottom-6 right-6 pointer-events-none opacity-5 select-none hidden lg:block">
        <h2 className="text-[12rem] font-black italic leading-none tracking-tighter">
          NEO
        </h2>
      </div>
    </div>
  );
}
