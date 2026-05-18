"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { PedidoCard } from "./PedidoCard";
import { toast } from "sonner";
import { PedidoData } from "./PedidosRadar";
import { updateOrderStatusAction } from "../actions";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";
import { Loader2 } from "lucide-react";

export function RealtimeOrders({
  negocioId,
  negocioNombre,
}: {
  negocioId: string;
  negocioNombre: string;
}) {
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

      if (data) setPedidos((data as any) || []);
    } catch (err) {
      console.error("Fallo Sync Realtime Comandas:", err);
    } finally {
      setInitializing(false);
    }
  }, [negocioId, supabase]);

  const handleUpdateStatus = async (
    id: string,
    nuevoEstado: PedidoData["estado"],
  ) => {
    setLoadingId(id);
    const pedidoTarget = pedidos.find((p) => p.id === id);

    try {
      await updateOrderStatusAction(id, nuevoEstado);

      if (pedidoTarget) {
        enviarNotificacionWhatsApp(
          pedidoTarget as any,
          nuevoEstado,
          negocioNombre,
        );
      }

      toast.success("ESTADO INTERNO ACTUALIZADO");
      if (nuevoEstado === "entregado" || nuevoEstado === "cancelado") {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
      } else {
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
        );
      }
    } catch (error: any) {
      toast.error("FALLO DE BASE DE DATOS", { description: error.message });
    } finally {
      setLoadingId(null);
    }
  };

  // 🚀 MOTOR REALTIME - INFRAESTRUCTURA DE ESCUCHA DE ALTA VELOCIDAD
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
        async (payload: {
          eventType: string;
          new: {
            id: string;
            estado: PedidoData["estado"];
            cliente_nombre?: string | null;
          };
        }) => {
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

              // Disparar audio por hardware nativo
              const audio = new Audio("/sounds/new-order.mp3");
              audio.play().catch(() => {});

              toast.info("NUEVO PEDIDO ENTRANTE", {
                icon: <BellDot className="text-black animate-bounce" />,
                description: `Cliente: ${(fullPedido.cliente_nombre || "Anónimo").toUpperCase()}`,
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

  if (initializing) {
    return (
      <div className="py-20 flex flex-col justify-center items-center font-mono text-xs text-gray-400 gap-2">
        <Loader2 className="animate-spin text-black" size={24} />
        <span>Iniciando escucha de sockets activos...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
      {pedidos.map((p) => (
        <PedidoCard
          key={p.id}
          pedido={p}
          onUpdateStatus={handleUpdateStatus}
          loadingId={loadingId}
        />
      ))}

      {pedidos.length === 0 && (
        <div className="col-span-full py-20 text-center border-4 border-black border-dashed bg-gray-50 select-none">
          <p className="font-black uppercase font-mono text-xs tracking-widest text-gray-400 animate-pulse">
            📡 Terminal a la escucha. Esperando comisiones entrantes...
          </p>
        </div>
      )}
    </div>
  );
}
