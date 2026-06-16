"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronDown } from "lucide-react";
import { ScheduleGrid } from "@/features/public-menu/components/ScheduleGrid";
import type { NegocioPublico } from "@/features/public-menu/types";

interface MenuFooterProps {
  negocio: NegocioPublico;
  showSchedule: boolean;
  setShowSchedule: (v: boolean) => void;
}

export function MenuFooter({
  negocio,
  showSchedule,
  setShowSchedule,
}: MenuFooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[var(--color-custom-950)] "
    >
      <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between sm:gap-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/95 sm:text-[11px] sm:tracking-[0.18em] cursor-pointer"
              aria-expanded={showSchedule}
              aria-controls="schedule-grid"
            >
              <Clock className="h-3.5 w-3.5" />
              Horarios
              <ChevronDown
                size={14}
                className={`sm:hidden transition-transform duration-200 ${
                  showSchedule ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile version — hidden on desktop (sm+), animated accordion */}
        <div className="sm:hidden">
          <AnimatePresence initial={false}>
            {showSchedule && (
              <motion.div
                id="schedule-grid-mobile"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid gap-2 grid-cols-2 overflow-hidden"
              >
                <ScheduleGrid horarios={negocio.horarios} withMotion />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop version — always visible, hidden on mobile */}
        <div
          id="schedule-grid"
          className="hidden sm:grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <ScheduleGrid horarios={negocio.horarios} withMotion />
        </div>

        {/* DIRECCIONES */}
        {negocio.direcciones && negocio.direcciones.length > 0 && (
          <div className="border-t border-white/10 pt-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/95 sm:text-[11px] sm:tracking-[0.18em] mb-4">
              <MapPin className="h-3.5 w-3.5" />
              Sucursales
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {negocio.direcciones.map((dir) => (
                <div
                  key={dir.id}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-custom-500)]/20 text-[var(--color-custom-500)]">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-white truncate">
                      {dir.nombre || "Sucursal"}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {dir.direccion}
                    </p>
                    {dir.localidad && (
                      <p className="text-[11px] text-white/40">
                        {dir.localidad}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.footer>
  );
}
