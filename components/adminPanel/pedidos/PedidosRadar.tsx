"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PedidoCard } from "./ui/PedidoCard";
import { Radio, Loader2, Inbox } from "lucide-react";
import {
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
}

export function PedidosRadar({ initialPedidos, negocioId }: PedidosRadarProps) {
  const [pedidos, setPedidos] = useState<PedidoData[]>(initialPedidos);
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`radar-pedidos-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        async (
          payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
        ) => {
          console.log("¡Nuevo pedido detectado en NEO!", payload);
          setIsSyncing(true);

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

  // CORREGIDO: Filtramos incluyendo "preparacion" para que coincida con la hidratación del servidor
  const pendientes = pedidos.filter(
    (p) =>
      p.estado === "pendiente" ||
      p.estado === "preparando" ||
      p.estado === "preparacion",
  );

  return (
    <div className="space-y-8 font-sans text-text-primary dark:text-text-inverse">
      {/* Indicador de Estado del Radar Estilo Ticket */}
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
              Escuchando nuevos pedidos en vivo
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

      {/* Grid de Pedidos Activos */}
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
    </div>
  );
}
