"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Search,
  ShoppingBag,
  BellDot,
  ChefHat,
} from "lucide-react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { PedidoCard } from "./PedidoCard";
import { updateOrderStatusAction } from "./actions";
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

              toast.info("Nuevo pedido entrante", {
                icon: <BellDot className="text-blue-500 animate-pulse" />,
                description: `Cliente: ${fullPedido.cliente_nombre || "Anónimo"}`,
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
      label: "Nuevos Pendientes",
      value: stats.nuevos,
      color: "bg-blue-500",
      border: "border-blue-100 dark:border-blue-900/30",
      icon: Clock,
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "En Cocina",
      value: stats.cocina,
      color: "bg-amber-500",

      border: "border-amber-100 dark:border-amber-900/30",
      icon: ChefHat,
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Entregados",
      value: stats.listos,
      color: "bg-green-500",

      border: "border-green-100 dark:border-green-900/30",
      icon: CheckCircle2,
      textColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className={`admin-card !p-5 border ${item.border} transition-all duration-300 rounded-2xl`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400">
                {item.label}
              </span>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm text-[var(--admin-text)]">
                <item.icon size={18} className={item.textColor} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${item.textColor}`}>
                {item.value}
              </span>
              {item.value > 0 && item.label !== "Entregados" && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${item.color} animate-pulse shadow-sm`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card !p-2 flex items-center bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl">
        <div className="pl-4 pr-3 text-gray-400 dark:text-zinc-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar pedido por cliente o código..."
          className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-medium text-[var(--admin-text)] placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="flex flex-col items-center justify-center py-20 admin-card bg-gray-50/50 dark:bg-zinc-900/30 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
          <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4 text-gray-400 dark:text-zinc-500">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-zinc-300 mb-1">
            Radar despejado
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-500">
            No hay pedidos activos en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
