"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PedidoCard } from "./ui/PedidoCard";
import { TestOrderButton } from "./monitoring/TestOrderButton";
import { Radio, Loader2, Inbox, LayoutDashboard, History } from "lucide-react";
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
} from "@supabase/supabase-js";

export interface PedidoItem {
  id: string;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
}

export interface PedidoData {
  id: string;
  estado:
    | "pendiente"
    | "preparando"
    | "preparacion"
    | "enviado"
    | "entregado"
    | "cancelado";
  cliente_nombre: string;
  metodo_pago?: string | null;
  total: number | string;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega?: string | null;
  notas?: string | null;
  pedido_items: PedidoItem[];
}

interface PedidosRadarProps {
  initialPedidos: PedidoData[];
  negocioId: string;
  negocioNombre: string; // Recibimos el nombre para el Header
}

export function PedidosRadar({
  initialPedidos,
  negocioId,
  negocioNombre,
}: PedidosRadarProps) {
  const [pedidos, setPedidos] = useState<PedidoData[]>(initialPedidos);
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // SINCRO TOTAL: Escuchamos cualquier evento ("*") para atajar INSERTs, UPDATEs y DELETEs
    const channel: RealtimeChannel = supabase
      .channel(`radar-pedidos-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // <-- Escucha global activa
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        async (
          payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
        ) => {
          console.log(
            "📡 Mutación detectada en NEO Realtime Engine:",
            payload.eventType,
          );
          setIsSyncing(true);

          // Volvemos a consultar el lote fresco con sus relaciones para mantener consistencia estricta
          const { data } = await supabase
            .from("pedidos")
            .select("*, pedido_items(*)")
            .eq("negocio_id", negocioId)
            .order("created_at", { ascending: false })
            .limit(50);

          if (data) {
            setPedidos(data as unknown as PedidoData[]);
          }
          setIsSyncing(false);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, negocioId]);

  // Filtramos los pedidos activos incluyendo los estados de cocina y preparación
  const pendientes = pedidos.filter(
    (p) =>
      p.estado === "pendiente" ||
      p.estado === "preparando" ||
      p.estado === "preparacion",
  );

  return (
    <div className="space-y-10 font-sans text-text-primary dark:text-text-inverse">
      {/* 1. HEADER TÁCTICO INTEGRADO - 100% DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-500 select-none">
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
            <span className="text-primary">{negocioNombre}</span>
          </p>
        </div>

        {/* Botón de Pruebas + Tarjetas Estadísticas con estados en vivo de React */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <TestOrderButton negocioId={negocioId} />

          <div className="flex gap-4 w-full sm:w-auto">
            {/* Stat 1: Órdenes Activas en Cocina */}
            <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-4 rounded-neo flex items-center gap-4 shadow-sm flex-1 sm:flex-initial min-w-[120px] transition-colors">
              <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                <Radio className="animate-pulse" size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  Activos
                </p>
                <p className="text-xl font-black italic leading-none text-text-primary dark:text-text-inverse font-mono mt-0.5">
                  {pendientes.length}
                </p>
              </div>
            </div>

            {/* Stat 2: Total de Pedidos del Lote */}
            <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-4 rounded-neo flex items-center gap-4 shadow-sm flex-1 sm:flex-initial min-w-[120px] transition-colors">
              <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                <History size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                  Hoy
                </p>
                <p className="text-xl font-black italic leading-none text-text-primary dark:text-text-inverse font-mono mt-0.5">
                  {pedidos.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. INDICADOR DE ESTADO DEL RADAR ESTILO TICKET */}
      <div className="flex items-center justify-between bg-bg-main dark:bg-bg-darker/50 p-4 rounded-neo border-2 border-border dark:border-border-dark border-dashed transition-colors select-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="text-primary animate-pulse" size={20} />
            <div className="absolute inset-0 bg-primary/20 blur-lg animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">
              Radar Operativo
            </p>
            <p className="text-xs font-bold text-text-muted dark:text-text-muted/80 uppercase tracking-tight font-mono">
              Escuchando mutaciones y nuevos pedidos en vivo
            </p>
          </div>
        </div>
        {isSyncing && (
          <div className="flex items-center gap-2 text-text-muted animate-in fade-in">
            <Loader2 className="animate-spin text-primary" size={14} />
            <span className="text-[9px] font-black uppercase italic font-mono">
              Sincronizando...
            </span>
          </div>
        )}
      </div>

      {/* 3. GRID DE PEDIDOS ACTIVOS */}
      <main className="animate-in fade-in duration-700 delay-200 relative z-10">
        {pendientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendientes.map((pedido) => (
              <PedidoCard key={pedido.id} pedido={pedido} />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border dark:border-border-dark rounded-super bg-gray-50/50 dark:bg-white/5 transition-colors select-none">
            <div className="p-6 bg-white dark:bg-bg-darker rounded-full shadow-xl border-2 border-border dark:border-border-dark">
              <Inbox className="text-border dark:text-border-dark" size={48} />
            </div>
            <div className="space-y-1">
              <p className="font-black uppercase italic text-xl tracking-tighter text-text-primary dark:text-text-inverse">
                Sin pedidos pendientes
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                El radar está despejado por ahora
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
