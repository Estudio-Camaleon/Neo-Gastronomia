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

const supabase = createClient();

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
      glow: "shadow-blue-500/20",
      border: "border-blue-200/60 dark:border-blue-900/30",
      icon: Clock,
      textColor: "text-blue-600 dark:text-blue-400",
      bgLight: "bg-blue-50/50 dark:bg-blue-950/10",
    },
    {
      label: "En Cocina",
      value: stats.cocina,
      color: "bg-amber-500",
      glow: "shadow-amber-500/20",
      border: "border-amber-200/60 dark:border-amber-900/30",
      icon: ChefHat,
      textColor: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-50/50 dark:bg-amber-950/10",
    },
    {
      label: "Entregados",
      value: stats.listos,
      color: "bg-green-500",
      glow: "shadow-green-500/20",
      border: "border-green-200/60 dark:border-green-900/30",
      icon: CheckCircle2,
      textColor: "text-green-600 dark:text-green-400",
      bgLight: "bg-green-50/50 dark:bg-green-950/10",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className={`admin-card !p-5 border ${item.border} transition-all duration-300 rounded-2xl hover:shadow-lg ${item.glow}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--admin-text-muted)]">
                {item.label}
              </span>
              <div className={`p-2 rounded-xl ${item.bgLight} ${item.textColor} transition-all duration-200`}>
                <item.icon size={18} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-black tracking-tight ${item.textColor}`}>
                {item.value}
              </span>
              {item.value > 0 && item.label !== "Entregados" && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${item.color} animate-pulse shadow-sm ${item.glow}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card !p-1 flex items-center">
        <div className="pl-4 pr-3 text-[var(--admin-text-muted)]">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar pedido por cliente o código..."
          className="admin-input !border-none !shadow-none !bg-transparent"
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
        <div className="flex flex-col items-center justify-center py-20 admin-card border-dashed">
          <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-black tracking-tight text-[var(--admin-text)] mb-1">
            Radar despejado
          </p>
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">
            No hay pedidos activos en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
