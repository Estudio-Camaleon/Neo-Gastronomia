"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RealtimeOrders({ negocioId }: { negocioId: string }) {
  const supabase = createClient();
  const router = useRouter();

  // Pre-cargamos el audio para evitar latencia al sonar
  const notificationAudio = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Audio("/sounds/notification.mp3");
    }
    return null;
  }, []);

  useEffect(() => {
    if (!negocioId) return;

    // 1. Suscripción al canal específico del negocio
    const canal = supabase
      .channel(`realtime-pedidos-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload: any) => {
          // 2. Feedback sonoro agresivo (estilo NEO)
          if (notificationAudio) {
            notificationAudio.currentTime = 0; // Reinicia si ya estaba sonando
            notificationAudio.play().catch(() => {
              console.warn(
                "Navegador bloqueó audio. Se requiere interacción previa.",
              );
            });
          }

          // 3. Notificación visual con Sonner (Diseño Premium)
          toast.success("¡ORDEN ENTRANTE! 🚀", {
            description: (
              <div className="flex flex-col gap-1">
                <span className="font-black uppercase tracking-tight italic">
                  {payload.new.cliente_nombre}
                </span>
                <span className="text-[10px] font-bold text-primary">
                  TOTAL: ${Number(payload.new.total).toLocaleString("es-AR")}
                </span>
              </div>
            ),
            duration: 10000,
            action: {
              label: "VER AHORA",
              onClick: () => router.refresh(),
            },
          });

          // 4. Actualización silenciosa de datos (Sin recargar la página)
          // Esto dispara el re-renderizado de los Server Components en PedidosPage
          router.refresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`📡 Radar NEO activo para negocio: ${negocioId}`);
        }
      });

    // Limpieza de canal al desmontar para evitar fugas de memoria
    return () => {
      supabase.removeChannel(canal);
    };
  }, [negocioId, supabase, router, notificationAudio]);

  return null;
}
