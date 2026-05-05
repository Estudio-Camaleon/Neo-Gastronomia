"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

// Interfaz estricta para garantizar un payload seguro y tipado
interface NuevoPedidoRecord {
  id: string;
  negocio_id: string;
  cliente_nombre: string;
  total: number | string;
  estado: string;
  [key: string]: unknown;
}

interface RealtimeOrdersProps {
  negocioId: string;
}

export function RealtimeOrders({ negocioId }: RealtimeOrdersProps) {
  const supabase = createClient();
  const router = useRouter();

  // Pre-cargamos el asset de audio controlando que se ejecute solo en el cliente (browser)
  const notificationAudio = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Audio("/sounds/notification.mp3");
    }
    return null;
  }, []);

  useEffect(() => {
    if (!negocioId) return;

    // 1. Registro del canal dedicado para alertas transaccionales usando tipo estricto de canal
    const canal: RealtimeChannel = supabase
      .channel(`realtime-pedidos-${negocioId}`)
      .on(
        "postgres_changes", // Removido casting 'as any'
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload: RealtimePostgresChangesPayload<NuevoPedidoRecord>) => {
          // Extraemos de forma segura el registro inyectado por Postgres
          const newRecord = payload.new as NuevoPedidoRecord;
          if (!newRecord) return;

          // 2. Feedback sonoro instantáneo estilo NEO
          if (notificationAudio) {
            notificationAudio.currentTime = 0; // Reinicia el puntero si ya estaba reproduciéndose
            notificationAudio.play().catch(() => {
              console.warn(
                "El navegador bloqueó la alerta de audio. Se requiere interacción previa (click) en el panel.",
              );
            });
          }

          // 3. Alerta visual flotante con Sonner (Estética Premium de Estudio Camaleón)
          toast.success("¡ORDEN ENTRANTE! 🚀", {
            description: (
              <div className="flex flex-col gap-1 font-sans">
                <span className="font-black uppercase tracking-tight italic text-text-primary">
                  {newRecord.cliente_nombre}
                </span>
                <span className="text-[10px] font-black text-primary font-mono">
                  TOTAL: ${Number(newRecord.total).toLocaleString("es-AR")}
                </span>
              </div>
            ),
            duration: 10000,
            action: {
              label: "VER AHORA",
              onClick: () => router.refresh(),
            },
          });

          // 4. Actualización silenciosa de los Server Components adyacentes
          router.refresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `📡 Radar acústico NEO activo para negocio: ${negocioId}`,
          );
        }
      });

    // Desuscripción e higiene de memoria al desmontar el panel
    return () => {
      supabase.removeChannel(canal);
    };
  }, [negocioId, router, notificationAudio, supabase]); // Agregado 'supabase' para corregir react-hooks/exhaustive-deps

  return null;
}
