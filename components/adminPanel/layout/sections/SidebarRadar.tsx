"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bell, BellRing, X } from "lucide-react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface SidebarRadarProps {
  negocioId: string | null;
}

export function SidebarRadar({ negocioId }: SidebarRadarProps) {
  const supabase = createClient();
  const router = useRouter();
  const [nuevoPedidoAlert, setNuevoPedidoAlert] = useState<{
    id: string;
    cliente: string;
  } | null>(null);

  useEffect(() => {
    if (!negocioId) return;

    const canal: RealtimeChannel = supabase
      .channel(`sidebar-radar-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const nuevoPedido = payload.new as {
            id: string;
            cliente_nombre?: string;
          };

          if (typeof window !== "undefined") {
            const audio = new Audio("/sounds/notification.mp3");
            audio.volume = 0.4;
            audio.play().catch((err) => {
              console.warn(
                "🔊 Autoplay bloqueado temporalmente por el navegador:",
                err,
              );
            });
          }

          setNuevoPedidoAlert({
            id: nuevoPedido.id,
            cliente: nuevoPedido.cliente_nombre || "Cliente Nuevo",
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase, negocioId]);

  const handleAlertClick = () => {
    setNuevoPedidoAlert(null);
    router.push("/pedidos");
  };

  if (nuevoPedidoAlert) {
    return (
      <div className="mb-8 min-h-[76px]">
        {/* SOLUCIÓN: Cambiado de <button> a <div> interactivo para evitar anidamiento inválido */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleAlertClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleAlertClick();
            }
          }}
          className="w-full text-left bg-amber-500 text-black border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-2 animate-bounce cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all select-none font-sans outline-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <BellRing className="animate-pulse shrink-0 w-4 h-4 text-black" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-black tracking-widest leading-none">
                ¡ENTRÓ PEDIDO!
              </p>
              <p className="font-black text-xs truncate italic uppercase tracking-tight mt-0.5">
                {nuevoPedidoAlert.cliente}
              </p>
            </div>
          </div>

          {/* Este botón ahora vive adentro de un <div>, lo cual es 100% legal en HTML */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Frena el burbujeo para que no ejecute el onClick del div padre
              setNuevoPedidoAlert(null);
            }}
            className="p-1 hover:bg-black/20 rounded-md transition-colors shrink-0 cursor-pointer"
            title="Limpiar Alerta"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 min-h-[76px] bg-bg-main dark:bg-bg-darker p-3 rounded-xl border border-border dark:border-border-dark flex items-center gap-3 opacity-60 select-none font-sans">
      <Bell size={16} className="text-text-muted shrink-0" />
      <div>
        <p className="text-[9px] uppercase font-black tracking-widest text-text-muted leading-none">
          Canal de Escucha
        </p>
        <p className="text-[11px] font-bold text-text-secondary dark:text-text-inverse tracking-tight mt-0.5">
          Sin alertas pendientes
        </p>
      </div>
    </div>
  );
}
