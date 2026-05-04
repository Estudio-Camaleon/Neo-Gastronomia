import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Radio, History, LayoutDashboard } from "lucide-react";
import { PedidosRadar } from "@/components/adminPanel/PedidosRadar";
import { TestOrderButton } from "@/components/adminPanel/TestOrderButton";

/**
 * Panel de Control de Pedidos NEO.
 * Orquesta la carga de órdenes iniciales y activa el sistema de monitoreo Realtime.
 */
export default async function PedidosPage() {
  const supabase = await createClient();

  // 1. Verificación de sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtención del negocio vinculado al usuario
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .single();

  if (!negocio) redirect("/configuracion");

  // 3. Carga inicial de pedidos con sus items vinculados
  const { data: pedidosIniciales } = await supabase
    .from("pedidos")
    .select(
      `
      *,
      pedido_items (*)
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32 max-w-7xl mx-auto">
      {/* Header del Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="text-primary w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
              Live Operations Control
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
            Comandas
          </h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-2">
            Monitoreo en tiempo real para{" "}
            <span className="text-primary">{negocio.nombre}</span>
          </p>
        </div>

        {/* Acciones y Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Botón de Pruebas (Solo visible en desarrollo o para testing) */}
          <TestOrderButton negocioId={negocio.id} />

          <div className="flex gap-4">
            <div className="bg-white dark:bg-bg-darker border-2 border-border p-4 rounded-neo flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Radio className="text-amber-500 animate-pulse" size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  Activos
                </p>
                <p className="text-xl font-black italic leading-none">
                  {pedidosIniciales?.filter(
                    (p) =>
                      p.estado === "pendiente" || p.estado === "preparando",
                  ).length || 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-bg-darker border-2 border-border p-4 rounded-neo flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <History className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  Hoy
                </p>
                <p className="text-xl font-black italic leading-none">
                  {pedidosIniciales?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* El Radar: Componente Client que maneja la suscripción Realtime */}
      <main className="animate-in fade-in duration-700 delay-200">
        <PedidosRadar
          initialPedidos={pedidosIniciales || []}
          negocioId={negocio.id}
        />
      </main>

      {/* Decoración Estética NEO */}
      <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 select-none">
        <h2 className="text-[12rem] font-black italic leading-none tracking-tighter text-border">
          NEO
        </h2>
      </div>
    </div>
  );
}
