"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { PedidoCard } from "./PedidoCard";
import { toast } from "sonner";
import { PedidoData } from "./PedidosRadar";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";
import { Loader2, ShoppingBag, BellDot } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface RealtimeOrdersProps {
  negocioId: string;
  negocioNombre: string;
}

export function RealtimeOrders({
  negocioId,
  negocioNombre,
}: RealtimeOrdersProps) {
  const [pedidos, setPedidos] = useState<PedidoData[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const supabase = createClient();

  const fetchPedidos = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("pedidos")
        .select(`*, pedido_items(*)`)
        .eq("negocio_id", negocioId)
        .not("estado", "in", '("entregado","cancelado")')
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setPedidos(data as unknown as PedidoData[]);
      }
    } catch {
      console.error("Fallo crítico en fetch de comandas.");
    } finally {
      setInitializing(false);
    }
  }, [negocioId, supabase]);

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

      if (pedidoAfectado) {
        // Inferencia dinámica del contrato de parámetros para omitir el 'any'
        enviarNotificacionWhatsApp(
          pedidoAfectado as unknown as Parameters<
            typeof enviarNotificacionWhatsApp
          >[0],
          nuevoEstado,
          negocioNombre,
        );
      }

      toast.success("Estado actualizado");

      if (nuevoEstado === "entregado" || nuevoEstado === "cancelado") {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
      } else {
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
        );
      }
    } catch {
      toast.error("Error en la sincronización");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchPedidos();

    const channel = supabase
      .channel(`pedidos-vivos-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        // Tipamos la payload entrante del socket de Supabase de forma estricta
        async (
          payload: RealtimePostgresChangesPayload<{
            id: string;
            estado: PedidoData["estado"];
          }>,
        ) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const { data: nuevoPedidoConItems } = await supabase
              .from("pedidos")
              .select(`*, pedido_items(*)`)
              .eq("id", payload.new.id)
              .single();

            if (nuevoPedidoConItems) {
              setPedidos((prev) => [
                nuevoPedidoConItems as unknown as PedidoData,
                ...prev,
              ]);

              const audio = new Audio("/sounds/new-order.mp3");
              audio.play().catch(() => {});

              toast.info("¡NUEVO PEDIDO RECIBIDO!", {
                icon: <BellDot className="text-black" />,
              });
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            if (
              payload.new.estado === "entregado" ||
              payload.new.estado === "cancelado"
            ) {
              setPedidos((prev) => prev.filter((p) => p.id !== payload.new.id));
            } else {
              setPedidos((prev) =>
                prev.map((p) =>
                  p.id === payload.new.id
                    ? { ...p, estado: payload.new.estado }
                    : p,
                ),
              );
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId, supabase, fetchPedidos]);

  if (initializing) {
    return (
      <div className="py-20 flex flex-col justify-center items-center font-mono text-xs text-gray-400 gap-2">
        <Loader2 className="animate-spin text-black" size={24} />
        <span>Sincronizando monitor en tiempo real...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans text-black w-full">
      {pedidos.map((p) => (
        <PedidoCard
          key={p.id}
          pedido={p}
          onUpdateStatus={handleUpdateStatus}
          loadingId={loadingId}
        />
      ))}

      {pedidos.length === 0 && (
        <div className="col-span-full py-20 text-center border-4 border-black border-dashed bg-white select-none">
          <ShoppingBag className="mx-auto text-gray-200 mb-2" size={32} />
          <p className="font-black font-mono text-xs uppercase text-gray-400 tracking-wider">
            Esperando nuevos pedidos en pasarela...
          </p>
        </div>
      )}
    </div>
  );
}
