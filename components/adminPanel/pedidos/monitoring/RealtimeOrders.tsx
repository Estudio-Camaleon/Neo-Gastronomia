"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PedidoCard } from "../ui/PedidoCard";
import { toast } from "sonner";
import { PedidoData } from "@/components/adminPanel/pedidos/PedidosRadar"; // Importamos el tipo centralizado
import { enviarNotificacionWhatsApp } from "@/lib/utils/whatsappActions";

const playNotificationSound = () => {
  const audio = new Audio("/sounds/new-order.mp3");
  audio.play().catch((e) => console.log("Audio block: ", e));
};

// Añadimos negocioNombre para que WhatsApp funcione desde aquí también
export function RealtimeOrders({
  negocioId,
  negocioNombre,
}: {
  negocioId: string;
  negocioNombre: string;
}) {
  const [pedidos, setPedidos] = useState<PedidoData[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPedidos = useCallback(async () => {
    const { data } = await supabase
      .from("pedidos")
      .select(`*, pedido_items(*)`)
      .eq("negocio_id", negocioId)
      // Solo mostramos los que no están finalizados para no saturar el monitoreo
      .not("estado", "in", '("entregado","cancelado")')
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setPedidos(data as unknown as PedidoData[]);
    }
  }, [negocioId, supabase]);

  // 🛡️ GESTOR DE ESTADOS (Requerido por PedidoCard)
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

      // DISPARAR WHATSAPP
      if (pedidoAfectado) {
        enviarNotificacionWhatsApp(pedidoAfectado, nuevoEstado, negocioNombre);
      }

      toast.success("Estado actualizado");

      // Si el pedido se entrega o cancela, lo sacamos de esta vista "viva"
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
    const initializeRadar = async () => {
      await fetchPedidos();
    };

    initializeRadar();

    const channel = supabase
      .channel(`pedidos-vivos-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchamos todo para sincronizar estados entre dispositivos
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
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
              playNotificationSound();
              toast.info("¡NUEVO PEDIDO RECIBIDO!");
            }
          } else if (payload.eventType === "UPDATE") {
            // Si otro dispositivo lo actualizó, reflejamos el cambio
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
  }, [negocioId, supabase, fetchPedidos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pedidos.map((p) => (
        <PedidoCard
          key={p.id}
          pedido={p}
          onUpdateStatus={handleUpdateStatus} // 🚀 Props inyectadas
          loadingId={loadingId} // 🚀 Props inyectadas
        />
      ))}

      {pedidos.length === 0 && (
        <div className="col-span-full py-20 text-center border-4 border-dashed border-black/10 rounded-neo">
          <p className="font-black uppercase italic text-text-muted">
            Esperando nuevos pedidos...
          </p>
        </div>
      )}
    </div>
  );
}
