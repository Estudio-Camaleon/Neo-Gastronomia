"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Search,
  ShoppingBag,
  BellDot,
} from "lucide-react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { PedidoCard } from "./PedidoCard";
import { updateOrderStatusAction } from "../actions";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface PedidoItem {
  id: string;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  detalles?: string | null;
}

export interface PedidoData {
  id: string;
  estado: "pendiente" | "en_preparacion" | "entregado" | "cancelado";
  cliente_nombre: string;
  metodo_pago: string;
  total: number;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega?: string | null;
  notas?: string | null;
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

  useEffect(() => {
    const channel = supabase
      .channel(`live-radar-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        // Tipamos el payload de la transmisión realtime de pedidos de forma estricta
        async (
          payload: RealtimePostgresChangesPayload<{
            id: string;
            estado: PedidoData["estado"];
            cliente_nombre?: string | null;
          }>,
        ) => {
          if (payload.eventType === "INSERT" && payload.new) {
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

              const audio = new Audio("/sounds/new-order.mp3");
              audio.play().catch(() => {});

              toast.info("NUEVO PEDIDO ENTRANTE", {
                icon: <BellDot className="text-black animate-bounce" />,
                description: `Cliente: ${(fullPedido.cliente_nombre || "Anónimo").toUpperCase()}`,
              });
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
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

  const handleUpdateStatus = async (
    id: string,
    nuevoEstado: PedidoData["estado"],
  ) => {
    setLoadingId(id);
    const pedidoAfectado = pedidos.find((p) => p.id === id);

    try {
      await updateOrderStatusAction(id, nuevoEstado);

      if (pedidoAfectado) {
        // Solventamos el error de any mediante extracción segura de firmas
        enviarNotificacionWhatsApp(
          pedidoAfectado as unknown as Parameters<
            typeof enviarNotificacionWhatsApp
          >[0],
          nuevoEstado,
          negocioNombre,
        );
      }

      toast.success(`Pedido actualizado con éxito`);
    } catch {
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
      color: "bg-[#A3FF00]",
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
    <div className="space-y-8 pb-20 font-sans text-black">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="font-mono font-black uppercase text-[10px] tracking-widest opacity-50 block mb-1">
              Status: {item.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-mono font-black">
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
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            className="w-full bg-white border-4 border-black p-4 pl-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none font-bold text-xs uppercase"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
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
              onUpdateStatus={handleUpdateStatus}
              loadingId={loadingId}
            />
          ))}
      </div>

      {pedidos.filter(
        (p) => p.estado !== "entregado" && p.estado !== "cancelado",
      ).length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border-4 border-dashed border-black/10 bg-white">
          <ShoppingBag size={64} className="text-gray-200 mb-4" />
          <p className="font-black uppercase italic text-gray-400 tracking-widest text-xs">
            Radar despejado. Sin pedidos activos.
          </p>
        </div>
      )}
    </div>
  );
}
