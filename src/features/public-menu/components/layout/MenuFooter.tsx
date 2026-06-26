"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  ChevronDown,
  MessageCircle,
  ExternalLink,
  ShoppingBag,
  Truck,
  Info,
  Phone,
} from "lucide-react";
import { ScheduleGrid } from "@/features/public-menu/components/layout/ScheduleGrid";
import { formatMoney } from "@/features/public-menu/utils";
import type { NegocioPublico } from "@/features/public-menu/types";

interface MenuFooterProps {
  negocio: NegocioPublico;
  showSchedule: boolean;
  setShowSchedule: (v: boolean) => void;
}

const socLinks = (negocio: NegocioPublico) =>
  [
    negocio.instagram_url
      ? { href: negocio.instagram_url, label: "Instagram", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> }
      : null,
    negocio.facebook_url
      ? { href: negocio.facebook_url, label: "Facebook", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> }
      : null,
    negocio.tiktok_url
      ? { href: negocio.tiktok_url, label: "TikTok", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> }
      : null,
    negocio.twitter_url
      ? { href: negocio.twitter_url, label: "X", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> }
      : null,
    negocio.youtube_url
      ? { href: negocio.youtube_url, label: "YouTube", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
      : null,
    negocio.tripadvisor_url
      ? { href: negocio.tripadvisor_url, label: "TripAdvisor", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12.006 9.044c-2.06 0-3.729 1.67-3.729 3.729s1.67 3.729 3.729 3.729 3.729-1.67 3.729-3.729-1.669-3.729-3.729-3.729zm0 5.958c-1.23 0-2.229-.998-2.229-2.229s.998-2.229 2.229-2.229 2.229.998 2.229 2.229-.999 2.229-2.229 2.229zm5.626-5.958c-2.06 0-3.729 1.67-3.729 3.729s1.67 3.729 3.729 3.729S21.36 14.773 21.36 12.773s-1.669-3.729-3.729-3.729zm0 5.958c-1.23 0-2.229-.998-2.229-2.229s.998-2.229 2.229-2.229 2.229.998 2.229 2.229-.999 2.229-2.229 2.229zm-11.264 0c-1.23 0-2.229-.998-2.229-2.229s.998-2.229 2.229-2.229 2.229.998 2.229 2.229-.998 2.229-2.229 2.229zM18.52 3.433c-3.577 0-6.515 2.928-6.515 6.515s2.938 6.515 6.515 6.515 6.515-2.938 6.515-6.515-2.938-6.515-6.515-6.515zm-13.04 0C1.903 3.433-1.035 6.361-1.035 9.948s2.938 6.515 6.515 6.515 6.515-2.938 6.515-6.515S8.057 3.433 5.48 3.433zM12.006.946c-5.419 0-9.838 4.419-9.838 9.838s4.419 9.838 9.838 9.838 9.838-4.419 9.838-9.838-4.419-9.838-9.838-9.838zM.5 10.804c0-3.079 2.492-5.571 5.571-5.571s5.571 2.492 5.571 5.571-2.492 5.571-5.571 5.571S.5 13.883.5 10.804zm22 0c0 3.079-2.492 5.571-5.571 5.571s-5.571-2.492-5.571-5.571 2.492-5.571 5.571-5.571S22.5 7.725 22.5 10.804z"/></svg> }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ReactNode }>;

const labelClass =
  "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/90";

export function MenuFooter({
  negocio,
  showSchedule,
  setShowSchedule,
}: MenuFooterProps) {
  const links = socLinks(negocio);
  const hasDelivery =
    (negocio.pedido_minimo ?? 0) > 0 || (negocio.costo_envio ?? 0) > 0;

  const colHeader =
    "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/90";

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[var(--color-custom-950)]"
    >
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4 lg:space-y-0">

        {/* ── Sobre nosotros + Delivery + WhatsApp (compact row, mobile only) ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/70 lg:hidden">
          {negocio.descripcion && (
            <span className="flex items-center gap-1.5">
              <Info size={12} className="shrink-0 text-white/40" />
              <span className="line-clamp-1 max-w-xs">{negocio.descripcion}</span>
            </span>
          )}
          {hasDelivery && (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Truck size={12} className="shrink-0 text-white/40" />
              {(negocio.pedido_minimo ?? 0) > 0 && (
                <span>Mín: {formatMoney(negocio.pedido_minimo!, negocio.moneda_simbolo ?? "$")}</span>
              )}
              {(negocio.costo_envio ?? 0) > 0 && (
                <span>Envío: {formatMoney(negocio.costo_envio!, negocio.moneda_simbolo ?? "$")}</span>
              )}
            </span>
          )}
          {negocio.whatsapp && (
            <a
              href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle size={12} />
              <Phone size={11} />
              <span>{negocio.whatsapp}</span>
            </a>
          )}
        </div>

        {/* ── 3-column grid on lg+ ── */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:mx-auto lg:max-w-5xl">

          {/* ── Col 1: Horarios ── */}
          <div className="flex flex-col items-center lg:text-center w-full">
            {/* Mobile: toggle + accordion */}
            <div className="lg:hidden flex flex-col items-center w-full">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className={labelClass}
                aria-expanded={showSchedule}
                aria-controls="schedule-grid"
              >
                <Clock className="h-3 w-3" />
                Horarios
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    showSchedule ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className="w-full mt-2">
                <AnimatePresence initial={false}>
                  {showSchedule && (
                    <motion.div
                      id="schedule-grid-mobile"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <ScheduleGrid horarios={negocio.horarios} simple />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop: always visible simple list */}
            <div id="schedule-grid" className="hidden lg:flex lg:flex-col lg:items-center w-full">
              <div className={colHeader}>
                <Clock className="h-3 w-3" />
                Horarios
              </div>
              <div className="mt-2 w-full max-w-[220px]">
                <ScheduleGrid horarios={negocio.horarios} simple />
              </div>
            </div>
          </div>

          {/* ── Col 2: Sucursales ── */}
          {negocio.direcciones && negocio.direcciones.length > 0 && (
            <div className="flex flex-col items-center lg:text-center w-full">
              {/* Mobile */}
              <div className="lg:hidden flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                <span className={labelClass}><MapPin className="h-3 w-3" /> Sucursales</span>
                {negocio.direcciones.map((dir) => (
                  <span key={dir.id} className="text-xs text-white/50">
                    {dir.nombre || "Sucursal"}
                    {dir.direccion && <span className="text-white/30"> · </span>}
                    {dir.direccion && <span>{dir.direccion}</span>}
                    {dir.localidad && <span className="text-white/30">, </span>}
                    {dir.localidad && <span>{dir.localidad}</span>}
                  </span>
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden lg:flex lg:flex-col lg:items-center">
                <div className={colHeader}>
                  <MapPin className="h-3 w-3" />
                  Sucursales
                </div>
                <div className="mt-2 space-y-2">
                  {negocio.direcciones.map((dir) => (
                    <div key={dir.id} className="text-xs text-white/60 leading-relaxed">
                      {dir.nombre && (
                        <span className="font-semibold text-white/80">{dir.nombre}</span>
                      )}
                      {dir.nombre && dir.direccion && <br />}
                      {dir.direccion && <span>{dir.direccion}</span>}
                      {dir.localidad && (
                        <span className="text-white/40">, {dir.localidad}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Col 3: Redes + Contacto ── */}
          <div className="flex flex-col items-center lg:text-center w-full">
            {/* Mobile */}
            <div className="lg:hidden space-y-3 w-full">
              {links.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className={labelClass}><ExternalLink className="h-3 w-3" /> Redes</span>
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* Desktop */}
            <div className="hidden lg:flex lg:flex-col lg:items-center space-y-3">
              <div className={colHeader}>
                <ExternalLink className="h-3 w-3" />
                Contacto
              </div>

              {links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {negocio.whatsapp && (
                <a
                  href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors text-xs"
                >
                  <MessageCircle size={14} />
                  <Phone size={12} />
                  <span>{negocio.whatsapp}</span>
                </a>
              )}

              {hasDelivery && (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-white/50">
                  {(negocio.pedido_minimo ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={12} className="text-white/30" />
                      Mín: {formatMoney(negocio.pedido_minimo!, negocio.moneda_simbolo ?? "$")}
                    </span>
                  )}
                  {(negocio.costo_envio ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Truck size={12} className="text-white/30" />
                      Envío: {formatMoney(negocio.costo_envio!, negocio.moneda_simbolo ?? "$")}
                    </span>
                  )}
                </div>
              )}

              {negocio.descripcion && (
                <p className="text-xs text-white/50 leading-relaxed line-clamp-3 max-w-[240px]">
                  {negocio.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Branding ── */}
        <div className="flex items-center justify-center gap-2 pt-3 lg:pt-4 border-t border-white/10 text-[10px] text-white/20">
          <ShoppingBag size={11} />
          <span className="font-semibold">{negocio.nombre}</span>
          <span className="text-white/10">·</span>
          <span>Powered by <span className="font-semibold text-white/30">NEO</span></span>
        </div>
      </div>
    </motion.footer>
  );
}
