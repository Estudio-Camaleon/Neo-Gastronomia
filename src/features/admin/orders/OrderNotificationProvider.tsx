"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { BellDot } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { PedidoData } from "@/core/types/domain";

// ── Debug ──────────────────────────────────────────────
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log("[NEO-NOTIFICATION]", ...args);
}

// ── Audio (simple HTMLAudioElement) ──
function playSound(src: string = "/sounds/new-order.mp3") {
  try {
    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {});
    log("PLAY SOUND", src);
  } catch (err) {
    log("PLAY SOUND FAILED:", err);
  }
}

// ── Context ────────────────────────────────────────────
interface NotificationContextValue {
  unreadCount: number;
  latestNewPedido: PedidoData | null;
  latestUpdateEvent: { id: string; estado: string } | null;
  acknowledgeNewOrders: () => void;
  acknowledgeUpdateEvent: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  latestNewPedido: null,
  latestUpdateEvent: null,
  acknowledgeNewOrders: () => {},
  acknowledgeUpdateEvent: () => {},
});

export function useOrderNotifications() {
  return useContext(NotificationContext);
}

// ── Provider ───────────────────────────────────────────
interface OrderNotificationProviderProps {
  negocioIds: string[];
  children: ReactNode;
}

export function OrderNotificationProvider({
  negocioIds,
  children,
}: OrderNotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNewPedido, setLatestNewPedido] = useState<PedidoData | null>(null);
  const [latestUpdateEvent, setLatestUpdateEvent] = useState<{ id: string; estado: string } | null>(null);
  const [soundEnabled] = useState(true);
  const lastPlayedRef = useRef<Set<string>>(new Set());
  const supabaseRef = useRef(createClient());
  const audioUnlockedRef = useRef(false);

  // ── Unlock audio on first user interaction ──
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctx.resume();
      ctx.close();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  // ── Periodic cleanup of lastPlayedRef (prevents memory leak) ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastPlayedRef.current.size > 500) {
        lastPlayedRef.current.clear();
        log("lastPlayedRef CLEARED (size > 500)");
      }
    }, 300_000); // every 5 min
    return () => clearInterval(interval);
  }, []);

  // ── Acknowledge new orders ──
  const acknowledgeNewOrders = useCallback(() => {
    setUnreadCount(0);
    setLatestNewPedido(null);
  }, []);

  const acknowledgeUpdateEvent = useCallback(() => {
    setLatestUpdateEvent(null);
  }, []);

  // ── Single Realtime channel for all pedidos events ──
  useEffect(() => {
    if (negocioIds.length === 0) return;

    const supabase = supabaseRef.current;
    const negFilter =
      negocioIds.length === 1
        ? `negocio_id=eq.${negocioIds[0]}`
        : `negocio_id=in.(${negocioIds.join(",")})`;

    const channel = supabase
      .channel(`pedidos-events-${negocioIds.join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: negFilter,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (payload.eventType === "INSERT") {
            const pedidoId = (payload.new as { id?: string }).id;
            if (!pedidoId) return;

            log("NEW ORDER EVENT");

            // Deduplication
            if (lastPlayedRef.current.has(pedidoId)) return;
            lastPlayedRef.current.add(pedidoId);

            // Fetch full data
            const { data: pedidos } = await supabase
              .from("pedidos")
              .select("*, pedido_items(*)")
              .eq("id", pedidoId)
              .limit(1)
              .returns<PedidoData[]>();

            const fullPedido = pedidos?.[0] ?? null;
            if (!fullPedido) return;

            // Update context
            setLatestNewPedido(fullPedido);
            setUnreadCount((prev) => prev + 1);

            // Play sound
            if (soundEnabled) playSound("/sounds/new-order.mp3");

            // Visual fallback: toast
            toast.info("Nuevo pedido entrante", {
              icon: <BellDot className="text-blue-500 animate-pulse" />,
              description: `Cliente: ${fullPedido.cliente_nombre || "Anónimo"}`,
            });
          } else if (payload.eventType === "UPDATE") {
            const updateId = (payload.new as { id?: string }).id;
            const updateEstado = (payload.new as { estado?: string }).estado;
            if (updateId && updateEstado) {
              setLatestUpdateEvent({ id: updateId, estado: updateEstado });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioIds.join(",")]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        latestNewPedido,
        latestUpdateEvent,
        acknowledgeNewOrders,
        acknowledgeUpdateEvent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
