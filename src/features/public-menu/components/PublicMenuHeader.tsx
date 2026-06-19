"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, MessageCircle, ChevronDown } from "lucide-react";
import { formatTurnos } from "@/features/public-menu/utils";
import { ScheduleGrid } from "@/features/public-menu/components/ScheduleGrid";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

import type { NegocioPublico } from "@/features/public-menu/types";
import { useEffect, useState } from "react";

export function PublicMenuHeader({
  negocio,
  isOpenNow,
  todayKey,
  showSchedule,
  setShowSchedule,
  recepcionPausada,
}: {
  negocio: NegocioPublico;
  isOpenNow: boolean;
  todayKey: string | null;
  showSchedule: boolean;
  setShowSchedule: (v: boolean) => void;
  recepcionPausada?: boolean;
}) {
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
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

  const hasSocials =
    negocio.whatsapp ||
    negocio.instagram_url ||
    negocio.facebook_url ||
    negocio.tiktok_url ||
    negocio.twitter_url ||
    negocio.youtube_url;

  // Dynamic card background: darken primary color, fallback to green
  const cardBgStyle = negocio.color_primary
    ? `color-mix(in srgb, ${negocio.color_primary}, black 75%)`
    : "#163B2D";

  const logoShape = negocio.logo_shape ?? "circle";
  const isRoundedShape = logoShape === "rounded";
  const isCircularShape = logoShape === "circle";
  const isSticker = logoShape === "none";
  const logoScale = negocio.logo_scale ?? 1;
  const logoPosicion = negocio.logo_posicion ?? "center";
  const logoFit = negocio.logo_fit ?? "contain";
  const STICKER_OFFSET: Record<string, string> = {
    top: "-16px",
    center: "0px",
    bottom: "16px",
  };
  const stickerMarginTop = isSticker
    ? (STICKER_OFFSET[logoPosicion] ?? "0px")
    : undefined;
  // Sincronizar transform-origin con object-position para que scale+position funcionen juntos
  const TRANSFORM_ORIGIN_MAP: Record<string, string> = {
    top: "center top",
    center: "center",
    bottom: "center bottom",
  };
  const logoTransformOrigin = TRANSFORM_ORIGIN_MAP[logoPosicion] ?? "center";

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

      {/* ── Header / Brand Card ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden pt-16 sm:pt-20 pb-20 sm:pb-24"
      >
        {/* Banner background */}
        {negocio.banner_url && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
            style={{
              height:
                negocio.banner_height === "compact"
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
                style={{
                  objectPosition: negocio.banner_posicion ?? "center",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}

        {/* ── Brand Card ── */}
        <div className="relative z-10 flex flex-col items-center px-4">
          <div className="relative w-[88%] max-w-[700px]">
            {/* Logo — protrudes from top of card */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-[52px] z-20">
              <motion.div
                initial={{ scale: 0, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 16,
                  delay: 0.1,
                }}
                className="relative"
              >
                <div
                  className={
                    isSticker
                      ? "relative flex items-center justify-center"
                      : `w-[104px] h-[104px] sm:w-[120px] sm:h-[120px] shadow-2xl overflow-hidden bg-white ${
                          isRoundedShape ? "rounded-2xl" : "rounded-full"
                        }`
                  }
                  style={
                    isSticker ? undefined : {
                      boxShadow: `0 0 0 6px ${cardBgStyle}, 0 25px 50px -12px rgba(0,0,0,0.5)`,
                    }
                  }
                >
                  {negocio.logo_url ? (
                    <Image
                      src={negocio.logo_url}
                      alt={negocio.nombre}
                      width={isSticker ? 200 : 200}
                      height={isSticker ? 200 : 200}
                      sizes="120px"
                      className={
                        isSticker
                          ? "max-h-32 max-w-32 sm:max-h-36 sm:max-w-36 drop-shadow-2xl"
                          : "h-full w-full"
                      }
                      style={
                        isSticker
                          ? {
                              objectPosition: logoPosicion,
                              transform: "scale(" + logoScale + ")",
                              transformOrigin: logoTransformOrigin,
                              marginTop: stickerMarginTop,
                            }
                          : {
                              objectPosition: logoPosicion,
                              transform: "scale(" + logoScale + ")",
                              transformOrigin: logoTransformOrigin,
                              objectFit: logoFit as "contain" | "cover",
                            }
                      }
                      priority
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center text-white font-black text-2xl sm:text-3xl ${
                        isSticker ? "w-[104px] h-[104px]" : "h-full w-full"
                      } ${
                        isCircularShape ? "rounded-full" : ""
                      }`}
                      style={{
                        background:
                          negocio.color_primary ?? "var(--color-custom-500)",
                      }}
                    >
                      {negocio.nombre
                        .split(" ")
                        .filter(Boolean)
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Card body */}
            <div
              className="backdrop-blur-xl rounded-[28px] shadow-2xl pt-[68px] pb-6 px-5 sm:px-8"
              style={{ backgroundColor: `color-mix(in srgb, ${cardBgStyle}, transparent 15%)` }}
            >
              {/* Business name */}
              {(negocio.mostrar_nombre ?? true) && (
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
                >
                  {negocio.nombre}
                </motion.h1>
              )}

              {/* Description / tagline */}
              {negocio.descripcion && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="text-center text-white/70 text-sm sm:text-base mt-2 max-w-[500px] mx-auto leading-relaxed"
                >
                  {negocio.descripcion}
                </motion.p>
              )}

              {/* Social media row */}
              {hasSocials && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex flex-wrap justify-center gap-2 mt-4"
                >
                  {negocio.whatsapp && (
                    <a
                      href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#25D366] hover:text-white hover:scale-110 active:scale-95"
                    >
                      <MessageCircle size={18} />
                    </a>
                  )}
                  {negocio.instagram_url && (
                    <a
                      href={negocio.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#E4405F] hover:text-white hover:scale-110 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  )}
                  {negocio.facebook_url && (
                    <a
                      href={negocio.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#1877F2] hover:text-white hover:scale-110 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {negocio.tiktok_url && (
                    <a
                      href={negocio.tiktok_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="TikTok"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#111] hover:text-white hover:scale-110 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    </a>
                  )}
                  {negocio.twitter_url && (
                    <a
                      href={negocio.twitter_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="X Twitter"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#000] hover:text-white hover:scale-110 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {negocio.youtube_url && (
                    <a
                      href={negocio.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="YouTube"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#FF0000] hover:text-white hover:scale-110 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                </motion.div>
              )}

              {/* Address & Schedule trigger buttons */}
              <div className="flex justify-center gap-2 mt-4">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 }}
                  onClick={() => setShowAddresses(!showAddresses)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs sm:text-sm transition-all hover:bg-white/20 active:scale-95"
                  aria-expanded={showAddresses}
                  aria-controls="addresses-panel"
                >
                  <MapPin size={15} />
                  <span className="max-w-[100px] sm:max-w-[140px] truncate">
                    {negocio.direcciones && negocio.direcciones.length > 0
                      ? negocio.direcciones[0]?.nombre ||
                        negocio.direcciones[0]?.direccion
                      : negocio.localidad || "Ubicación"}
                  </span>
                  {negocio.direcciones && negocio.direcciones.length > 1 && (
                    <ChevronDown
                      size={11}
                      className={`shrink-0 opacity-60 transition-transform ${
                        showAddresses ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.4 }}
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs sm:text-sm transition-all hover:bg-white/20 active:scale-95"
                  aria-expanded={showSchedule}
                  aria-controls="schedule-grid"
                >
                  <Clock size={15} />
                  <span>{showSchedule ? "Ocultar" : "Horarios"}</span>
                  <ChevronDown
                    size={11}
                    className={`shrink-0 opacity-60 transition-transform ${
                      showSchedule ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>
              </div>
            </div>
          </div>

          {/* ── Addresses dropdown (below brand card) ── */}
          <div className="w-[88%] max-w-[700px] mt-2">
            <AnimatePresence>
              {showAddresses &&
                negocio.direcciones &&
                negocio.direcciones.length > 0 && (
                  <motion.div
                    id="addresses-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="backdrop-blur-xl rounded-2xl p-4 text-sm text-white/90 shadow-lg mt-2"
                      style={{ backgroundColor: `color-mix(in srgb, ${cardBgStyle}, transparent 15%)` }}
                    >
                      {negocio.direcciones.map((dir) => (
                        <div key={dir.id} className="flex items-start gap-2.5 py-1.5">
                          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-white/30" />
                          <div>
                            <span className="font-semibold text-white">
                              {dir.nombre}
                            </span>
                            {", "}
                            {dir.direccion}
                            {dir.localidad && (
                              <span className="text-white/60">
                                , {dir.localidad}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* ── Schedule dropdown (below brand card) ── */}
            <AnimatePresence>
              {showSchedule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    id="schedule-grid"
                    className="backdrop-blur-xl rounded-2xl p-4 shadow-lg mt-2"
                    style={{ backgroundColor: `color-mix(in srgb, ${cardBgStyle}, transparent 15%)` }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <ScheduleGrid horarios={negocio.horarios} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>
    </>
  );
}

export default PublicMenuHeader;
