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

// ── Audio (module-level, shared across all instances) ──
let audioBufferCache: AudioBuffer | null = null;
let audioCtx: AudioContext | null = null;
let audioInitialized = false;

async function initAudio() {
  if (audioInitialized) return;
  audioInitialized = true;
  log("INIT AUDIO");

  const AudioCtor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) {
    log("NO AUDIO CTOR AVAILABLE");
    return;
  }

  try {
    audioCtx = new AudioCtor();
    await audioCtx.resume();
    log("AUDIO CONTEXT STATE:", audioCtx.state);
  } catch {
    log("AUDIO INIT FAILED");
  }
}

async function playSound() {
  if (!audioCtx) {
    log("PLAY SOUND SKIPPED — no audio context");
    return;
  }

  try {
    if (audioCtx.state === "suspended") {
      log("AUDIO CONTEXT SUSPENDED — resuming");
      await audioCtx.resume();
    }

    if (!audioBufferCache) {
      log("FETCHING AUDIO");
      const res = await fetch("/sounds/new-order.mp3");
      const buf = await res.arrayBuffer();
      audioBufferCache = await audioCtx.decodeAudioData(buf);
      log("AUDIO DECODED");
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBufferCache;
    source.connect(audioCtx.destination);
    source.start();
    log("PLAY SOUND");
  } catch (err) {
    log("PLAY SOUND FAILED:", err);
  }
}

// ── Context ────────────────────────────────────────────
interface NotificationContextValue {
  unreadCount: number;
  latestNewPedido: PedidoData | null;
  acknowledgeNewOrders: () => void;
  audioUnlocked: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  latestNewPedido: null,
  acknowledgeNewOrders: () => {},
  audioUnlocked: false,
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
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const lastPlayedRef = useRef<Set<string>>(new Set());
  const supabaseRef = useRef(createClient());

  // ── Initialize audio on first user interaction ──
  useEffect(() => {
    const controller = new AbortController();
    const unlock = async () => {
      if (audioInitialized) return;
      await initAudio();
      setAudioUnlocked(true);
      log("AUDIO UNLOCKED");
    };

    document.addEventListener("click", unlock, { signal: controller.signal, once: true });
    document.addEventListener("touchstart", unlock, { signal: controller.signal, once: true });
    document.addEventListener("keydown", unlock, { signal: controller.signal, once: true });

    return () => controller.abort();
  }, []);

  // ── Resume audio on visibility change ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && audioCtx?.state === "suspended") {
        log("VISIBILITY CHANGE — resuming audio context");
        audioCtx.resume().then(() => {
          log("AUDIO CONTEXT STATE:", audioCtx?.state);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── Acknowledge new orders ──
  const acknowledgeNewOrders = useCallback(() => {
    setUnreadCount(0);
    setLatestNewPedido(null);
  }, []);

  // ── Realtime subscription (INSERT only) ──
  useEffect(() => {
    if (negocioIds.length === 0) return;

    const supabase = supabaseRef.current;
    const negFilter =
      negocioIds.length === 1
        ? `negocio_id=eq.${negocioIds[0]}`
        : `negocio_id=in.(${negocioIds.join(",")})`;

    const channel = supabase
      .channel(`order-notifications-${negocioIds.join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          filter: negFilter,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
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
          await playSound();

          // Visual fallback: toast
          toast.info("Nuevo pedido entrante", {
            icon: <BellDot className="text-blue-500 animate-pulse" />,
            description: `Cliente: ${fullPedido.cliente_nombre || "Anónimo"}`,
          });
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
        acknowledgeNewOrders,
        audioUnlocked,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
