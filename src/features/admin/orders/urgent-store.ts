import { create } from "zustand";

interface UrgentStore {
  /** Cantidad de pedidos pendientes con más de 15 min de espera */
  urgentCount: number;
  setUrgentCount: (count: number) => void;
}

/**
 * Store compartido para propagar el conteo de pedidos retrasados
 * desde PedidosRadar hacia NotificationBell (shake animation).
 */
export const useUrgentStore = create<UrgentStore>((set) => ({
  urgentCount: 0,
  setUrgentCount: (count) => set({ urgentCount: count }),
}));

// ── Sonido de alerta para pedidos retrasados ──

/**
 * Genera un pitido de alerta triple usando Web Audio API.
 * No requiere archivo .mp3 — se genera sintéticamente.
 */
export function playUrgentAlert(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();

    const beep = (startTime: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Triple pitido: agudo-agudo-más agudo (patrón de alarma)
    beep(now, 880, 0.12);
    beep(now + 0.18, 880, 0.12);
    beep(now + 0.36, 1047, 0.18);

    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Fallo silencioso — el sonido no es crítico
  }
}
