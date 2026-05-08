"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Search,
  BellDot,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { TestOrderButton } from "./monitoring/TestOrderButton";
import { PedidoCard } from "./ui/PedidoCard";
import { enviarNotificacionWhatsApp } from "@/lib/utils/whatsappActions";

export interface PedidoItem {
  id: string;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  detalles?: string;
}

export interface PedidoData {
  id: string;
  estado: "pendiente" | "en_preparacion" | "entregado" | "cancelado";
  cliente_nombre: string;
  metodo_pago: string;
  total: number;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega?: string;
  notas?: string;
  pedido_items: PedidoItem[];
}

interface PedidosRadarProps {
  initialPedidos: PedidoData[];
  negocioId: string;
  negocioNombre: string;
}

export function PedidosRadar({
  initialPedidos,
  negocioId,
  negocioNombre,
}: PedidosRadarProps) {
  const [filter, setFilter] = useState("");
  const [pedidos, setPedidos] = useState<PedidoData[]>(initialPedidos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  // 🚀 MOTOR REALTIME
  useEffect(() => {
    const channel = supabase
      .channel(`radar-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: fullPedido } = await supabase
              .from("pedidos")
              .select("*, pedido_items(*)")
              .eq("id", payload.new.id)
              .single();

            if (fullPedido) {
              setPedidos((prev) => [
                fullPedido as unknown as PedidoData,
                ...prev,
              ]);
              toast.info("NUEVO PEDIDO RECIBIDO", {
                icon: <BellDot className="text-primary animate-bounce" />,
                description: `Cliente: ${fullPedido.cliente_nombre.toUpperCase()}`,
              });
            }
          } else if (payload.eventType === "UPDATE") {
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === payload.new.id
                  ? { ...p, estado: payload.new.estado }
                  : p,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId, supabase]);

  // 🛡️ ACTUALIZACIÓN DE ESTADO + NOTIFICACIÓN
  const handleUpdateStatus = async (
    id: string,
    nuevoEstado: PedidoData["estado"],
  ) => {
    setLoadingId(id);
    const pedidoAfectado = pedidos.find((p) => p.id === id);

    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;

      // DISPARAR VOZ DEL SISTEMA
      if (pedidoAfectado) {
        enviarNotificacionWhatsApp(pedidoAfectado, nuevoEstado, negocioNombre);
      }

      toast.success(`Pedido actualizado`);
    } catch {
      // Agregamos el guion bajo
      toast.error("Error en la sincronización con la base de datos");
    } finally {
      setLoadingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      nuevos: pedidos.filter((p) => p.estado === "pendiente").length,
      cocina: pedidos.filter((p) => p.estado === "en_preparacion").length,
      listos: pedidos.filter((p) => p.estado === "entregado").length,
    }),
    [pedidos],
  );

  const radarItems = [
    {
      label: "Nuevos",
      value: stats.nuevos,
      color: "bg-amber-400",
      icon: Clock,
    },
    {
      label: "En Cocina",
      value: stats.cocina,
      color: "bg-primary",
      icon: ShoppingCart,
    },
    {
      label: "Finalizados",
      value: stats.listos,
      color: "bg-green-500",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden border-4 border-black rounded-neo bg-surface dark:bg-surface-dark p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <item.icon className="absolute -right-2 -bottom-2 w-20 h-24 text-black/5 dark:text-white/5 -rotate-12" />
            <span className="relative z-10 font-black uppercase italic text-[10px] tracking-widest opacity-50 block mb-1">
              Status: {item.label}
            </span>
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-5xl font-black leading-none">
                {item.value}
              </span>
              <div
                className={`w-3 h-3 rounded-full ${item.color} border-2 border-black animate-pulse`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-text-muted group-focus-within:text-primary transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            className="w-full bg-surface dark:bg-surface-dark border-4 border-black p-4 pl-12 rounded-neo shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none font-bold focus:bg-primary/5 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <TestOrderButton negocioId={negocioId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos
          .filter((p) => p.estado !== "entregado" && p.estado !== "cancelado")
          .filter(
            (p) =>
              p.cliente_nombre.toLowerCase().includes(filter.toLowerCase()) ||
              p.id.includes(filter),
          )
          .map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              // 🚀 PASAMOS LAS PROPS FALTANTES:
              onUpdateStatus={handleUpdateStatus}
              loadingId={loadingId}
            />
          ))}
      </div>

      {pedidos.filter(
        (p) => p.estado !== "entregado" && p.estado !== "cancelado",
      ).length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border-4 border-dashed border-black/10 rounded-super bg-black/5 dark:bg-white/5">
          <ShoppingBag size={64} className="text-black/10 mb-4" />
          <p className="font-black uppercase italic text-text-muted tracking-widest">
            Radar despejado. Sin pedidos activos.
          </p>
        </div>
      )}
    </div>
  );
}
