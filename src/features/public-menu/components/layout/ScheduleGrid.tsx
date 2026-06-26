"use client";

import { motion } from "framer-motion";
import {
  DAYS_ORDER,
  DAY_LABELS,
  getTodayKey,
  formatTurnos,
} from "@/features/public-menu/utils";
import type { HorarioDia } from "@/features/public-menu/types";

interface ScheduleGridProps {
  horarios: Record<string, HorarioDia | null> | null;
  withMotion?: boolean;
  simple?: boolean;
}

export function ScheduleGrid({ horarios, withMotion = false, simple = false }: ScheduleGridProps) {
  const todayKey = getTodayKey();

  if (!horarios) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-sm text-[var(--color-custom-text-muted)]">
          Sin horarios disponibles
        </p>
      </div>
    );
  }

  if (simple) {
    return (
      <div className="divide-y divide-white/5">
        {DAYS_ORDER.map((dayId) => {
          const label = DAY_LABELS[dayId];
          const config = horarios[dayId] ?? null;
          const isToday = dayId === todayKey;
          return (
            <div key={dayId} className="flex items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0">
              <span
                className={`font-semibold uppercase tracking-wider text-[11px] ${
                  isToday ? "text-white" : "text-white/60"
                }`}
              >
                {label}
                {isToday && (
                  <span className="ml-1.5 text-[9px] text-white/40 font-bold">
                    HOY
                  </span>
                )}
              </span>
              {config ? (
                <span className="text-[11px] text-white/80 text-right leading-snug">
                  {formatTurnos(config)}
                </span>
              ) : (
                <span className="text-[11px] text-white/30 italic">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const cells = DAYS_ORDER.map((dayId) => {
    const label = DAY_LABELS[dayId];
    const config = horarios[dayId] ?? null;
    const isToday = dayId === todayKey;

    if (withMotion) {
      return (
        <motion.div
          key={dayId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl border px-3 py-2 text-sm transition-all ${
            isToday
              ? "border-[var(--color-custom-500)] bg-white text-[var(--color-custom-900)]"
              : "border-white/10 bg-white/5 text-white/85"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-black uppercase tracking-[0.12em] text-[11px]">
              {label}
            </span>
            {isToday && (
              <span className="rounded-full bg-[var(--color-custom-500)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                Hoy
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-snug opacity-90">
            {formatTurnos(config)}
          </p>
        </motion.div>
      );
    }

    return (
      <div
        key={dayId}
        className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 ${
          isToday ? "bg-white/15 ring-1 ring-white/25" : "bg-white/5"
        }`}
      >
        <span className="font-semibold text-[11px] text-white uppercase tracking-wider">
          {label}
          {isToday && (
            <span className="ml-1.5 text-[9px] text-white/60 font-bold">
              HOY
            </span>
          )}
        </span>
        {config ? (
          <span className="text-[11px] text-white/60">
            {formatTurnos(config)}
          </span>
        ) : (
          <span className="text-[11px] text-white/30 italic">Cerrado</span>
        )}
      </div>
    );
  });

  return <>{cells}</>;
}
