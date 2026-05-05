import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Radio, History, LayoutDashboard } from "lucide-react";
import {
  PedidosRadar,
  type PedidoData,
} from "@/components/adminPanel/pedidos/PedidosRadar"; // Importamos el tipo real aquí
import { TestOrderButton } from "@/components/adminPanel/pedidos/monitoring/TestOrderButton";
import { RealtimeOrders } from "@/components/adminPanel/pedidos/monitoring/RealtimeOrders";

/**
 * Panel de Control de Pedidos NEO.
 * Orquesta la hidratación inicial de datos estáticos desde el servidor y monta las pasarelas reactivas.
 */
export default async function PedidosPage() {
  const supabase = await createClient();

  // 1. Control perimetral de sesión activa
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtención del contexto de inquilino (Negocio)
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .single();

  if (!negocio) redirect("/configuracion");

  // 3. Hidratación inicial del lote de pedidos con JOIN relacional
  const { data: pedidosIniciales } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      estado,
      cliente_nombre,
      metodo_pago,
      total,
      cliente_whatsapp,
      es_delivery,
      direccion_entrega,
      notas,
      pedido_items (
        id,
        cantidad,
        nombre_producto,
        precio_unitario
      )
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Parseo limpio acoplado al tipo oficial del Radar sin usar 'any'
  const listaPedidos = (pedidosIniciales || []) as unknown as PedidoData[];

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32 max-w-7xl mx-auto font-sans relative">
      <RealtimeOrders negocioId={negocio.id} />

      {/* Cabecera Táctica del Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="text-primary w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
              Live Operations Control
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary dark:text-text-inverse uppercase tracking-tighter italic leading-none">
            Comandas
          </h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-2">
            Monitoreo en tiempo real para{" "}
            <span className="text-primary">{negocio.nombre}</span>
          </p>
        </div>

        {/* Acciones Rápidas y Tarjetas de Estadísticas en Lote */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <TestOrderButton negocioId={negocio.id} />

          <div className="flex gap-4 w-full sm:w-auto">
            {/* Stat 1: Órdenes Activas en Cocina / Espera */}
            <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-4 rounded-neo flex items-center gap-4 shadow-sm flex-1 sm:flex-initial min-w-[120px] transition-colors">
              <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                <Radio className="animate-pulse" size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  Activos
                </p>
                <p className="text-xl font-black italic leading-none text-text-primary dark:text-text-inverse font-mono mt-0.5">
                  {
                    listaPedidos.filter(
                      (p) =>
                        p.estado === "pendiente" ||
                        p.estado === "preparando" ||
                        p.estado === "preparacion",
                    ).length
                  }
                </p>
              </div>
            </div>

            {/* Stat 2: Historial Técnico del Día */}
            <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-4 rounded-neo flex items-center gap-4 shadow-sm flex-1 sm:flex-initial min-w-[120px] transition-colors">
              <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                <History size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  Hoy
                </p>
                <p className="text-xl font-black italic leading-none text-text-primary dark:text-text-inverse font-mono mt-0.5">
                  {listaPedidos.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* El Radar: Canvas Interactivo Principal sin errores de tipo */}
      <main className="animate-in fade-in duration-700 delay-200 relative z-10">
        <PedidosRadar initialPedidos={listaPedidos} negocioId={negocio.id} />
      </main>

      {/* Marca de Agua Estética de Respaldo NEO */}
      <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 select-none z-0">
        <h2 className="text-[12rem] font-black italic leading-none tracking-tighter text-border dark:text-border-dark">
          NEO
        </h2>
      </div>
    </div>
  );
}
