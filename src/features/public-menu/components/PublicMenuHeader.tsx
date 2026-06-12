"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, MessageCircle, ChevronDown } from "lucide-react";
import { formatTurnos } from "@/features/public-menu/utils";

import type { NegocioPublico } from "@/features/public-menu/types";
import { useEffect, useState } from "react";

export function PublicMenuHeader({
  negocio,
  isOpenNow,
  todayKey,
  showSchedule,
  setShowSchedule,
}: {
  negocio: NegocioPublico;
  isOpenNow: boolean;
  todayKey: string | null;
  showSchedule: boolean;
  setShowSchedule: (v: boolean) => void;
}) {
  // Show modal on every page load if the business is closed
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);

  useEffect(() => {
    if (!isOpenNow) {
      // always show when component mounts and negocio is closed
      setShowClosedModal(true);
    } else {
      setShowClosedModal(false);
    }
  }, [isOpenNow]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden pt-20 pb-10"
    >
      {negocio.banner_url && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden
          style={{
            height: negocio.banner_height === "compact"
              ? "60%"
              : negocio.banner_height === "large"
                ? "120%"
                : "100%",
          }}
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
              loading="eager"
              style={{
                objectPosition: negocio.banner_posicion ?? "center",
              }}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,var(--color-custom-surface)_95%)]" />
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6">
        <AnimatePresence>
          {showClosedModal && !isOpenNow && (
            <motion.div
              key="closed-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowClosedModal(false)}
                aria-hidden
              />

              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                role="dialog"
                aria-modal="true"
                className="relative max-w-xl w-full rounded-2xl bg-white p-6 text-left shadow-2xl ring-1 ring-black/8"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{ background: negocio.color_primary ?? "#fef2f2" }}
                      aria-hidden
                    >
                      <Clock size={22} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111]">Horario de atención</h3>
                  </div>

                  <div className="text-sm text-[#444]">El local se encuentra actualmente fuera del horario de atención. Podés seguir navegando el menú y consultar los horarios de atención para hoy o días próximos.</div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-[var(--color-custom-text-muted)]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Hoy</span>
                      <span>
                        {negocio.horarios && todayKey ? (
                          negocio.horarios[todayKey]
                            ? formatTurnos(negocio.horarios[todayKey])
                            : "Cerrado"
                        ) : (
                          "Sin horarios"
                        )}
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
                        // open schedule section in footer and scroll to it
                        setShowSchedule(true);
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
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -140 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.03, rotate: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className={`relative flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 lg:h-40 lg:w-40 overflow-hidden ring-2 ring-white/10 shadow-2xl bg-white/5 ${
                (negocio.logo_shape ?? "circle") === "circle"
                  ? "rounded-full"
                  : (negocio.logo_shape ?? "circle") === "rounded"
                    ? "rounded-2xl"
                    : ""
              }`}
            >
              {negocio.logo_url ? (
                <Image
                  src={negocio.logo_url}
                  alt={negocio.nombre}
                  width={160}
                  height={160}
                  className={`h-full w-full ${
                    (negocio.logo_shape ?? "circle") === "circle"
                      ? "rounded-full"
                      : (negocio.logo_shape ?? "circle") === "rounded"
                        ? "rounded-2xl"
                        : ""
                  }`}
                  style={{
                    objectFit: (negocio.logo_fit ?? "contain") as "contain" | "cover",
                    objectPosition: negocio.logo_posicion ?? "center",
                    transform: `scale(${negocio.logo_scale ?? 1})`,
                  }}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-[var(--color-custom-500)] text-white font-black text-xl">
                  {negocio.nombre
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              )}
              <div className="absolute -inset-2 rounded-full opacity-40 blur-2xl" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent)' }} />
            </motion.div>

            <div className="text-center sm:text-left">
              {(negocio.mostrar_nombre ?? true) && (
                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-[var(--color-custom-900)]"
                  style={{ WebkitFontSmoothing: "antialiased" }}
                >
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,var(--color-custom-700),var(--color-custom-500))' }}>
                    {negocio.nombre}
                  </span>
                </motion.h1>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-2 flex items-center gap-3">
                <div aria-hidden className={`relative flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${isOpenNow ? "bg-[color:var(--color-custom-500)/0.12] text-[var(--color-custom-700)]" : "bg-[rgba(190,36,20,0.08)] text-[#be2414]"}`} title={isOpenNow ? "Abierto ahora" : "Cerrado ahora"}>
                  <motion.span animate={isOpenNow ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ repeat: Infinity, duration: 1.8 }} className={`mr-2 h-2.5 w-2.5 rounded-full ${isOpenNow ? "bg-[var(--color-custom-500)]" : "bg-white"}`} />
                  {isOpenNow ? "Abierto" : "Cerrado"}
                </div>

                <div className="text-sm text-[var(--color-custom-text-muted)]">
                  <span className="font-medium">Hoy:</span>{" "}
                  {negocio.horarios && todayKey ? (
                    <span>
                      {negocio.horarios[todayKey]
                        ? formatTurnos(negocio.horarios[todayKey])
                        : "Cerrado"}
                    </span>
                  ) : (
                    <span>Sin horarios</span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.3 }} className="flex flex-col items-center gap-3 sm:items-end">
            <div className="flex flex-wrap justify-center gap-2">
              <motion.div
                whileHover={{ y: -3 }}
                className="relative flex items-center gap-2 rounded-2xl bg-[var(--color-custom-900)]/70 p-2 text-sm text-white cursor-pointer"
                onClick={() => setShowAddresses(!showAddresses)}
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline max-w-[160px] truncate">
                  {negocio.direcciones && negocio.direcciones.length > 0
                    ? negocio.direcciones[0]?.nombre || negocio.direcciones[0]?.direccion
                    : negocio.localidad || "Sucursal Centro"}
                </span>
                {negocio.direcciones && negocio.direcciones.length > 1 && (
                  <ChevronDown size={12} className={`shrink-0 opacity-60 transition-transform ${showAddresses ? "rotate-180" : ""}`} />
                )}
              </motion.div>

              <motion.button onClick={() => setShowSchedule(!showSchedule)} whileHover={{ scale: 1.03 }} className="flex items-center gap-2 rounded-2xl bg-[var(--color-custom-800)]/80 p-2 text-sm text-white" aria-expanded={showSchedule}>
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{showSchedule ? "Ocultar horarios" : "Ver horarios"}</span>
              </motion.button>
            </div>

            {/* Addresses dropdown */}
            <AnimatePresence>
              {showAddresses && negocio.direcciones && negocio.direcciones.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full max-w-sm overflow-hidden"
                >
                  <div className="flex flex-col gap-2 rounded-2xl bg-[var(--color-custom-900)]/70 p-3 text-sm text-white/90">
                    {negocio.direcciones.map((dir) => (
                      <div key={dir.id} className="flex items-start gap-2">
                        <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-custom-500)]" />
                        <div>
                          <span className="font-semibold text-white">{dir.nombre}</span>
                          {", "}
                          {dir.direccion}
                          {dir.localidad && <span className="text-white/60">, {dir.localidad}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Schedule dropdown */}
            <AnimatePresence>
              {showSchedule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full max-w-sm overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--color-custom-900)]/70 p-3 text-sm">
                    {(() => {
                      const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
                      const labels: Record<string, string> = {
                        lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
                      };
                      return days.map((day) => {
                        const config = negocio.horarios?.[day] || null;
                        const isToday = day === todayKey;
                        return (
                          <div
                            key={day}
                            className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 ${
                              isToday
                                ? "bg-[var(--color-custom-500)]/20 ring-1 ring-[var(--color-custom-500)]/40"
                                : "bg-white/5"
                            }`}
                          >
                            <span className="font-semibold text-[11px] text-white/90 uppercase tracking-wider">
                              {labels[day]}
                              {isToday && (
                                <span className="ml-1.5 text-[9px] text-[var(--color-custom-400)] font-bold">
                                  HOY
                                </span>
                              )}
                            </span>
                            {config ? (
                              <span className="text-[11px] text-white/60">{formatTurnos(config)}</span>
                            ) : (
                              <span className="text-[11px] text-white/30 italic">Cerrado</span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(negocio.whatsapp || negocio.instagram_url || negocio.facebook_url) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="flex gap-2">
                {negocio.whatsapp && (
                  <a href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-custom-900)]/50 text-white/90 transition-all hover:bg-[var(--color-custom-500)] hover:text-white">
                    <MessageCircle size={18} />
                  </a>
                )}
                {negocio.instagram_url && (
                  <a href={negocio.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-custom-900)]/50 text-white/90 transition-all hover:bg-[var(--color-custom-500)] hover:text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {negocio.facebook_url && (
                  <a href={negocio.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-custom-900)]/50 text-white/90 transition-all hover:bg-[var(--color-custom-500)] hover:text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default PublicMenuHeader;
