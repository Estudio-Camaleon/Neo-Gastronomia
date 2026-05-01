"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // Ahora sí coincide
import { toast } from "sonner";

export function RealtimeOrders({ negocioId }: { negocioId: string }) {
  // 1. Creamos el cliente dentro del componente
  const supabase = createClient();

  useEffect(() => {
    if (!negocioId) return;

    // 2. Escuchamos cambios en la tabla 'pedidos'
    const canal = supabase
      .channel("pedidos-en-vivo")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload: any) => {
          // Ponemos 'any' para que no marque rojo en payload.new
          console.log("¡Nuevo pedido detectado!", payload);

          // 3. Ejecutar sonido de notificación
          const audio = new Audio("/sounds/notification.mp3");
          audio
            .play()
            .catch(() =>
              console.log(
                "Audio bloqueado por el navegador. Haz clic en la página.",
              ),
            );

          // 4. Notificación visual con Sonner
          toast.success("¡ORDEN RECIBIDA! 🔔", {
            description: `Cliente: ${payload.new.cliente_nombre} - Total: $${payload.new.total}`,
            duration: 8000,
          });

          // 5. Refrescar la pantalla para mostrar el pedido en la lista
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [negocioId, supabase]);

  return null;
}
