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

// ── Audio Engine (Web Audio API) ──────────────────────────
const SOUND_SRC = "/sounds/new-order.mp3";
const AUDIO_VOLUME = 0.6;
const MAX_PLAY_RETRIES = 5;
const PLAY_RETRY_DELAY = 500;

let _audioCtx: AudioContext | null = null;
let _audioBuffer: AudioBuffer | null = null;
let _isUnlocked = false;
let _pendingPlayCount = 0;

function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      _audioCtx = new Ctor();
    }
    return _audioCtx;
  } catch {
    return null;
  }
}

async function ensureAudioResumed(): Promise<boolean> {
  const ctx = getAudioCtx();
  if (!ctx) return false;
  if (ctx.state === "running") return true;
  try {
    await ctx.resume();
    return (ctx.state as string) === "running";
  } catch {
    return false;
  }
}

async function preloadSound() {
  try {
    const res = await fetch(SOUND_SRC);
    const buf = await res.arrayBuffer();
    const ctx = getAudioCtx();
    if (!ctx) return;
    _audioBuffer = await ctx.decodeAudioData(buf);
    log("SOUND PRELOADED");
  } catch (err) {
    log("SOUND PRELOAD FAILED:", err);
  }
}

function playOrderSound() {
  _pendingPlayCount++;
  _playSoundInternal();
}

async function _playSoundInternal(attempt = 0) {
  if (!_isUnlocked) {
    log("PLAY SKIPPED — audio not unlocked yet");
    return;
  }

  const ctx = getAudioCtx();
  if (!ctx) {
    _fallbackPlay();
    return;
  }

  // Try to resume context if suspended
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  }

  // If still suspended (background tab), retry a few times
  if ((ctx.state as string) !== "running") {
    if (attempt < MAX_PLAY_RETRIES) {
      setTimeout(() => _playSoundInternal(attempt + 1), PLAY_RETRY_DELAY);
      log("PLAY RETRY", attempt + 1);
      return;
    }
    // Give up — will replay on visibilitychange
    log("PLAY GAVE UP after", attempt, "attempts — queued for visibility");
    return;
  }

  // Decode on demand if not preloaded
  if (!_audioBuffer) {
    try {
      const res = await fetch(SOUND_SRC);
      const buf = await res.arrayBuffer();
      _audioBuffer = await ctx.decodeAudioData(buf);
    } catch {
      _fallbackPlay();
      return;
    }
  }

  try {
    const source = ctx.createBufferSource();
    source.buffer = _audioBuffer;

    const gain = ctx.createGain();
    gain.gain.value = AUDIO_VOLUME;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);

    _pendingPlayCount = Math.max(0, _pendingPlayCount - 1);
    log("PLAY SOUND (Web Audio) — attempt", attempt);
  } catch (err) {
    log("PLAY SOUND FAILED:", err);
    _fallbackPlay();
  }
}

function _fallbackPlay() {
  try {
    const audio = new Audio(SOUND_SRC);
    audio.volume = AUDIO_VOLUME;
    audio.play().catch(() => {});
    log("PLAY SOUND (fallback)");
  } catch {
    log("FALLBACK PLAY EXCEPTION");
  }
}

function unlockAudio() {
  if (_isUnlocked) return;
  _isUnlocked = true;

  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  // Preload the sound for instant playback
  preloadSound();
  log("AUDIO UNLOCKED");
}

function replayPending() {
  if (_pendingPlayCount > 0 && _isUnlocked) {
    log("REPLAY pending for visibility change — count:", _pendingPlayCount);
    _pendingPlayCount = 0;
    // Play once (one sound is enough to alert user)
    _playSoundInternal();
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

  // ── Unlock audio on first user interaction ──
  useEffect(() => {
    const handler = () => unlockAudio();
    document.addEventListener("pointerdown", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, []);

  // ── Replay sound when tab becomes visible (catch up on background orders) ──
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        // Always try to resume AudioContext
        ensureAudioResumed();
        // Replay pending if there are unread orders
        const hasUnread = unreadCount > 0 || _pendingPlayCount > 0;
        if (hasUnread) {
          replayPending();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [unreadCount]);

  // ── Try to resume AudioContext periodically (Chrome suspends it in background) ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (_isUnlocked) {
        ensureAudioResumed();
      }
    }, 30_000); // every 30s
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

            // Play sound (works even in background tab via Web Audio API)
            if (soundEnabled) playOrderSound();

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
