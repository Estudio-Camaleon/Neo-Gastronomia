"use client";

import { Camera, ImageIcon, Upload, MapPin, Clock, MessageCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { FoodMini } from "@/components/ui/food-loading";
import {
  LOGO_SHAPE_OPTIONS,
  LOGO_FIT_OPTIONS,
  LOGO_POSITION_OPTIONS,
  BANNER_HEIGHT_OPTIONS,
  BANNER_VERTICAL_OPTIONS,
} from "../../types";
import type { DireccionFisica } from "@/core/types/domain";

export interface BrandingBlockProps {
  logoUrl: string;
  bannerUrl: string;
  bannerPosicion: string;
  bannerHeight: string;
  bannerScale: number;
  logoScale: number;
  logoPosicion: string;
  logoFit: string;
  logoShape: string;
  nombre: string;
  descripcion?: string;
  mostrarNombre: boolean;
  colorPrimary: string;
  whatsapp?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  direcciones?: DireccionFisica[];
  localidad?: string;
  uploading: string | null;
  imageError?: string;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => void;
  onLogoScaleChange: (val: number) => void;
  onLogoPosicionChange: (val: string) => void;
  onLogoFitChange: (val: string) => void;
  onLogoShapeChange: (val: string) => void;
  onBannerPosicionChange: (val: string) => void;
  onBannerScaleChange: (val: number) => void;
  onBannerHeightChange: (val: string) => void;
}

export function BrandingBlock({
  logoUrl,
  bannerUrl,
  bannerPosicion,
  bannerHeight,
  bannerScale,
  logoScale,
  logoPosicion,
  logoFit,
  logoShape,
  nombre,
  descripcion,
  mostrarNombre,
  colorPrimary,
  whatsapp,
  instagram_url,
  facebook_url,
  tiktok_url,
  twitter_url,
  youtube_url,
  direcciones,
  localidad,
  uploading,
  imageError,
  onImageUpload,
  onLogoScaleChange,
  onLogoPosicionChange,
  onLogoFitChange,
  onLogoShapeChange,
  onBannerPosicionChange,
  onBannerScaleChange,
  onBannerHeightChange,
}: BrandingBlockProps) {
  const isSticker = logoShape === "none";
  const isRoundedShape = logoShape === "rounded";
  const isCircularShape = logoShape === "circle";
  const STICKER_OFFSET: Record<string, string> = {
    top: "-16px",
    center: "0px",
    bottom: "16px",
  };
  const stickerMarginTop =
    isSticker
      ? (STICKER_OFFSET[logoPosicion] ?? "0px")
      : undefined;
  const TRANSFORM_ORIGIN_MAP: Record<string, string> = {
    top: "center top",
    center: "center",
    bottom: "center bottom",
  };
  const logoTransformOrigin = TRANSFORM_ORIGIN_MAP[logoPosicion] ?? "center";
  const logoStyle: React.CSSProperties = {
    objectPosition: logoPosicion,
    transform: "scale(" + logoScale + ")",
    transformOrigin: logoTransformOrigin,
    marginTop: stickerMarginTop,
    objectFit: isSticker ? "contain" : (logoFit as "contain" | "cover"),
  };
  const fallbackStyle: React.CSSProperties = {
    background: colorPrimary || "var(--color-custom-500)",
  };
  if (isSticker && stickerMarginTop) {
    fallbackStyle.marginTop = stickerMarginTop;
  }

  // Dynamic card background
  const cardBgStyle = colorPrimary
    ? `color-mix(in srgb, ${colorPrimary}, black 75%)`
    : "#163B2D";

  const hasSocials =
    whatsapp ||
    instagram_url ||
    facebook_url ||
    tiktok_url ||
    twitter_url ||
    youtube_url;

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 flex items-center gap-2.5">
        <Camera size={16} className="text-[var(--admin-text-muted)]" />
        <div>
          <h2 className="font-semibold text-xs text-[var(--admin-text)]">
            Previsualización en vivo del encabezado
          </h2>
          <p className="text-[10px] text-[var(--admin-text-muted)]">
            Todos los cambios se reflejan instantáneamente como se verán en el menú público.
          </p>
        </div>
      </div>

      {/* ── Live preview ── */}
      <div className="relative overflow-hidden bg-[var(--admin-bg)]">
        {/* Banner background */}
        <div
          className="relative w-full"
          style={{
            aspectRatio:
              bannerHeight === "compact"
                ? "21/6"
                : bannerHeight === "large"
                  ? "21/10"
                  : "21/8",
          }}
        >
          {bannerUrl ? (
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${bannerScale ?? 1})`,
                transformOrigin: "center top",
              }}
            >
              {bannerUrl.startsWith("blob:") ? (
                <img
                  src={bannerUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: bannerPosicion }}
                />
              ) : (
                <Image
                  src={bannerUrl}
                  fill
                  className="object-cover"
                  style={{ objectPosition: bannerPosicion }}
                  alt=""
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)] opacity-30">
              <ImageIcon size={36} />
            </div>
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* ── Brand Card floating on banner ── */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="relative w-[280px] sm:w-[380px]">
              {/* Logo — protrudes from top of card */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-[52px] z-20">
                <div
                  className={
                    isSticker
                      ? "relative flex items-center justify-center"
                      : "w-[104px] h-[104px] sm:w-[120px] sm:h-[120px] overflow-hidden bg-white " +
                        (isRoundedShape ? "rounded-2xl" : "rounded-full")
                  }
                  style={
                    isSticker
                      ? undefined
                      : ({
                          boxShadow: "0 0 0 6px " + cardBgStyle + ", 0 25px 50px -12px rgba(0,0,0,0.5)",
                        } as React.CSSProperties)
                  }
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={nombre}
                      className={
                        isSticker
                          ? "max-h-32 max-w-32 sm:max-h-36 sm:max-w-36 drop-shadow-2xl"
                          : "h-full w-full object-cover"
                      }
                      style={logoStyle}
                    />
                  ) : (
                    <div
                      className={
                        "flex items-center justify-center text-white font-black text-2xl sm:text-3xl " +
                        (isSticker ? "w-[104px] h-[104px]" : "h-full w-full") +
                        (isCircularShape ? " rounded-full" : "")
                      }
                      style={fallbackStyle}
                    >
                      {nombre
                        ? nombre
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                        : "?"}
                    </div>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div
                className="backdrop-blur-xl rounded-[28px] shadow-2xl pt-[68px] pb-6 px-5 sm:px-8"
                style={{
                  backgroundColor: "color-mix(in srgb, " + cardBgStyle + ", transparent 15%)",
                }}
              >
                {/* Business name */}
                {mostrarNombre && (
                  <h1 className="text-center text-white text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
                    {nombre || "Nombre del negocio"}
                  </h1>
                )}

                {/* Description */}
                {descripcion && (
                  <p className="text-center text-white/70 text-xs sm:text-sm mt-1.5 max-w-[500px] mx-auto leading-relaxed">
                    {descripcion}
                  </p>
                )}

                {/* Social media row */}
                {hasSocials && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {whatsapp && (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <MessageCircle size={18} />
                      </span>
                    )}
                    {instagram_url && (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </span>
                    )}
                    {facebook_url && (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </span>
                    )}
                    {tiktok_url && (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </svg>
                      </span>
                    )}
                    {twitter_url && (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </span>
                    )}
                    {youtube_url && (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}

                {/* Address & Schedule pill buttons */}
                <div className="flex justify-center gap-2 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] sm:text-xs">
                    <MapPin size={13} />
                    <span className="truncate max-w-[80px]">
                      {direcciones && direcciones.length > 0
                        ? direcciones[0]?.nombre || direcciones[0]?.direccion
                        : localidad || "Ubicación"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] sm:text-xs">
                    <Clock size={13} />
                    <span>Horarios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload overlay for banner */}
          {uploading === "banner_url" && (
            <div className="absolute inset-0 bg-[var(--admin-surface)]/80 backdrop-blur-sm flex items-center justify-center z-30">
              <FoodMini size={22} />
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LOGO CONTROLS */}
        <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[var(--admin-border)] pb-5 md:pb-0 md:pr-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
              Logo
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)] not-uppercase tracking-normal">Valores por defecto</span>
            </span>
            <label className="text-[10px] font-medium text-[var(--admin-text-muted)] bg-[var(--admin-surface)] border border-[var(--admin-border)] px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:bg-[var(--admin-accent)]/10 hover:border-[var(--admin-accent)]/30 hover:text-[var(--admin-accent)]">
              <Upload size={10} /> Subir
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg, image/webp, .jpg, .jpeg, .png, .webp"
                onChange={(e) => onImageUpload(e, "logo_url")}
                disabled={!!uploading}
              />
            </label>
          </div>
          <p className="text-[9px] text-[var(--admin-text-muted)]/60 -mt-2 mb-1">Máx. 5MB — JPG, PNG, WEBP</p>

          <div className="space-y-3">
            {/* Shape selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Forma del contenedor
              </span>
              <div className="flex gap-1">
                {LOGO_SHAPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoShapeChange(opt.value)}
                    className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                      logoShape === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit selector - solo si NO es sticker */}
            {!isSticker && (
              <div className="space-y-1">
                <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                  Ajuste de imagen
                </span>
                <div className="flex gap-1">
                  {LOGO_FIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onLogoFitChange(opt.value)}
                      className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                        logoFit === opt.value
                          ? "bg-[var(--admin-accent)] text-white shadow-sm"
                          : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Position selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Posición vertical
              </span>
              <div className="flex gap-1">
                {LOGO_POSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoPosicionChange(opt.value)}
                    className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                      logoPosicion === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom slider */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Escala
                </span>
                <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">
                  {logoScale.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={logoScale}
                onChange={(e) => onLogoScaleChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--admin-bg)] rounded-full appearance-none cursor-pointer accent-[var(--admin-accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--admin-accent)] [&::-webkit-slider-thumb]:shadow-sm"
              />
            </div>

            <p className="text-[9px] text-[var(--admin-text-muted)] leading-normal pt-1">
              {isSticker
                ? "Sin contenedor. El logo flota libremente."
                : `Espacio ${logoShape === "circle" ? "1:1" : "flexible"}.`}
              {!isSticker &&
                (logoFit === "contain"
                  ? " Muestra el logo completo sin recortes."
                  : " Llena el contenedor. Puede recortar bordes.")}
            </p>
          </div>
        </div>

        {/* BANNER CONTROLS */}
        <div className="md:col-span-7 flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
              Banner de Cabecera
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)] not-uppercase tracking-normal">Valores por defecto</span>
            </span>
            <label className="text-[10px] font-medium text-[var(--admin-text)] bg-[var(--admin-surface)] border border-[var(--admin-border)] px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:bg-[var(--admin-bg)]">
              <Upload size={10} /> Subir
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg, image/webp, .jpg, .jpeg, .png, .webp"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={!!uploading}
              />
            </label>
          </div>
          <p className="text-[9px] text-[var(--admin-text-muted)]/60 -mt-2">Máx. 5MB — JPG, PNG, WEBP</p>

          {/* Banner controls */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Altura del banner
              </span>
              <div className="flex gap-1">
                {BANNER_HEIGHT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onBannerHeightChange(opt.value)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                      bannerHeight === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Posición vertical
              </span>
              <div className="flex gap-1">
                {BANNER_VERTICAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onBannerPosicionChange(opt.value)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                      bannerPosicion === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Banner zoom slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Escala del banner
              </span>
              <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">
                {bannerScale.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={bannerScale}
              onChange={(e) => onBannerScaleChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--admin-bg)] rounded-full appearance-none cursor-pointer accent-[var(--admin-accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--admin-accent)] [&::-webkit-slider-thumb]:shadow-sm"
            />
          </div>

          {imageError && (
            <p className="text-[11px] text-red-500 flex items-center gap-1">
              <XCircle size={12} />
              {imageError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

