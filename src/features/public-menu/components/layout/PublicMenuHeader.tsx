"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import { formatTurnos } from "@/features/public-menu/utils";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";
import { BrandCard } from "@/features/public-menu/components/layout/BrandCard";

import type { NegocioPublico } from "@/features/public-menu/types";
import { useEffect, useState } from "react";

export function PublicMenuHeader({
  negocio,
  isOpenNow,
  todayKey,
  recepcionPausada,
}: {
  negocio: NegocioPublico;
  isOpenNow: boolean;
  todayKey: string | null;
  recepcionPausada?: boolean;
}) {
  const [showClosedModal, setShowClosedModal] = useState(false);
  const closedModalRef = useFocusTrap(
    showClosedModal && !isOpenNow,
  );

  useScrollLock(showClosedModal && !isOpenNow);

  useEffect(() => {
    if (!isOpenNow) {
      setShowClosedModal(true);
    } else {
      setShowClosedModal(false);
    }
  }, [isOpenNow]);

  return (
    <>
      {/* ── Closed modal ── */}
      <AnimatePresence>
        {showClosedModal && !isOpenNow && (
          <motion.div
            ref={closedModalRef}
            key="closed-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            tabIndex={-1}
          >
            <div
              className="absolute inset-0 bg-black/50"
              aria-hidden
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              role="dialog"
              aria-modal="true"
              className="relative max-w-xl w-full rounded-2xl bg-[var(--color-custom-surface-strong)] p-6 text-left shadow-2xl ring-1 ring-black/8"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ background: recepcionPausada ? "#dc2626" : (negocio.color_primary ?? "#fef2f2") }}
                    aria-hidden
                  >
                    {recepcionPausada ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    ) : (
                      <Clock size={22} className="text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-custom-900)]">
                    {recepcionPausada ? "Recepción pausada" : "Horario de atención"}
                  </h3>
                </div>

                <div className="text-sm text-[var(--color-custom-text)]">
                  {recepcionPausada ? (
                    <>El local pausó la recepción de pedidos por el momento. <strong>No se están tomando pedidos nuevos.</strong> Volvé a consultar más tarde.</>
                  ) : (
                    <>El local se encuentra actualmente fuera del horario de atención.
                    Podés seguir navegando el menú y consultar los horarios de atención
                    para hoy o días próximos.</>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-[var(--color-custom-text-muted)]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Hoy</span>
                    <span>
                      {negocio.horarios && todayKey
                        ? negocio.horarios[todayKey]
                          ? formatTurnos(negocio.horarios[todayKey])
                          : "Cerrado"
                        : "Sin horarios"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Localización</span>
                    <span>{negocio.localidad || "-"}</span>
                  </div>
                  {negocio.whatsapp && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">WhatsApp</span>
                      <span>{negocio.whatsapp}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClosedModal(false);
                      setTimeout(() => {
                        const el = document.getElementById("schedule-grid");
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 120;
                          window.scrollTo({ top: y, behavior: "smooth" });
                          const heading = el.querySelector("h3");
                          heading?.focus({ preventScroll: true });
                        }
                      }, 120);
                    }}
                    className="px-4 py-2 rounded-md border bg-[var(--color-custom-surface-strong)] text-sm"
                  >
                    Ver horarios
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClosedModal(false)}
                    className="px-4 py-2 rounded-md text-white text-sm"
                    style={{ background: negocio.color_primary ?? undefined }}
                  >
                    Seguir viendo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header / Brand Card ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-visible min-h-[36vh] sm:min-h-[38vh] pt-20 sm:pt-24 pb-0 z-20"
      >
        {/* Banner background */}
        {negocio.banner_url && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[100px]"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${negocio.banner_scale ?? 1})`,
                transformOrigin: "center top",
              }}
            >
              <Image
                src={negocio.banner_url}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
                style={{
                  objectPosition: negocio.banner_posicion ?? "center",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}

        {/* ── Brand Card: mitad fuera del banner ── */}
        <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 z-10">
          <BrandCard negocio={negocio} todayKey={todayKey} />
        </div>
      </motion.header>
    </>
  );
}

export default PublicMenuHeader;
