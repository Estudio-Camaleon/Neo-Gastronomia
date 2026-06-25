"use client";

import { useState } from "react";
import { Camera, Upload, ArrowUp, ArrowDown, Minus, Smartphone, X, XCircle } from "lucide-react";
import {
  LOGO_SHAPE_OPTIONS,
  LOGO_POSITION_OPTIONS,
  BANNER_VERTICAL_OPTIONS,
} from "../../types";
import type { DireccionFisica } from "@/core/types/domain";
import { HeaderPreview } from "./HeaderPreview";

export interface BrandingBlockProps {
  logoUrl: string;
  bannerUrl: string;
  bannerPosicion: string;
  bannerScale: number;
  logoScale: number;
  logoPosicion: string;
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
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: "logo_url" | "banner_url") => void;
  onLogoScaleChange: (val: number) => void;
  onLogoPosicionChange: (val: string) => void;
  onLogoShapeChange: (val: string) => void;
  onBannerPosicionChange: (val: string) => void;
  onBannerScaleChange: (val: number) => void;
}

export function BrandingBlock({
  logoUrl,
  bannerUrl,
  bannerPosicion,
  bannerScale,
  logoScale,
  logoPosicion,
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
  onLogoShapeChange,
  onBannerPosicionChange,
  onBannerScaleChange,
}: BrandingBlockProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const socials = [
    { id: "whatsapp" as const, url: whatsapp },
    { id: "instagram" as const, url: instagram_url },
    { id: "facebook" as const, url: facebook_url },
    { id: "tiktok" as const, url: tiktok_url },
    { id: "twitter" as const, url: twitter_url },
    { id: "youtube" as const, url: youtube_url },
  ].filter((s) => s.url);

  const previewProps = {
    bannerUrl,
    bannerPosicion,
    bannerScale,
    logoUrl,
    logoScale,
    logoPosicion,
    logoShape,
    nombre,
    descripcion,
    mostrarNombre,
    colorPrimary,
    socials,
    direcciones,
    localidad,
    uploading,
  };

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 flex items-center gap-2.5">
        <Camera size={16} className="text-[var(--admin-text-muted)]" />
        <div>
          <h2 className="font-semibold text-[15px] text-[var(--admin-text)]">
            Previsualizaci&oacute;n en vivo del encabezado
          </h2>
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            Vista aproximada de c&oacute;mo se ver&aacute; el encabezado en el men&uacute; p&uacute;blico.
          </p>
        </div>
      </div>

      {/* Desktop: inline preview */}
      <div className="hidden md:block">
        <HeaderPreview variant="desktop" {...previewProps} />
      </div>

      {/* Mobile/Tablet: trigger card */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="w-full flex items-center gap-3 p-4 bg-[var(--admin-bg)] border border-dashed border-[var(--admin-border)] rounded-lg text-left transition-all hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 active:scale-[0.99]"
        >
          <div className="w-10 h-12 rounded-lg border border-[var(--admin-border)] flex items-center justify-center bg-[var(--admin-surface)]">
            <Smartphone size={18} className="text-[var(--admin-text-muted)]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[14px] font-semibold text-[var(--admin-text)] block">
              Toc&aacute; para previsualizar
            </span>
            <span className="text-[13px] text-[var(--admin-text-muted)] block truncate">
              {nombre || "Nombre del negocio"}
            </span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--admin-text-muted)] shrink-0">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Mobile: modal with phone mockup */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-2.5 -right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-all"
            >
              <X size={14} />
            </button>

            <div className="bg-black rounded-[38px] p-2.5 shadow-2xl">
              <div className="bg-[var(--admin-bg)] rounded-[30px] overflow-hidden w-full max-w-[280px]">
                <HeaderPreview variant="mobile" {...previewProps} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LOGO CONTROLS */}
        <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[var(--admin-border)] pb-5 md:pb-0 md:pr-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
              Logo
              <span className="text-[12px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)] not-uppercase tracking-normal">Valores por defecto</span>
            </span>
            <label className="text-[13px] font-medium bg-[var(--admin-surface)] border border-[var(--admin-border)] px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:bg-[var(--admin-accent)]/10 hover:border-[var(--admin-accent)]/30 hover:text-[var(--admin-accent)]">
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
          <p className="text-[12px] text-[var(--admin-text-muted)]/60 -mt-2 mb-1">M&aacute;x. 5MB — JPG, PNG, WEBP</p>

          <div className="space-y-3">
            {/* Shape selector */}
            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Forma del contenedor
              </span>
              <div className="flex flex-wrap gap-1">
                {LOGO_SHAPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoShapeChange(opt.value)}
                    className={`flex items-center justify-center gap-1.5 flex-1 px-2 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                      logoShape === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    <span
                      className={`shrink-0 border border-current ${
                        opt.value === "none"
                          ? "w-2.5 h-2.5 rotate-45 rounded-sm"
                          : opt.value === "circle"
                            ? "w-2.5 h-2.5 rounded-full"
                            : opt.value === "rounded"
                              ? "w-2.5 h-2.5 rounded-[3px]"
                              : "w-2.5 h-2.5"
                      }`}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position selector */}
            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Posici&oacute;n vertical
              </span>
              <div className="flex flex-wrap gap-1">
                {LOGO_POSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoPosicionChange(opt.value)}
                    className={`flex items-center justify-center gap-1 flex-1 px-2 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                      logoPosicion === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.value === "top" && <ArrowUp size={11} />}
                    {opt.value === "center" && <Minus size={11} />}
                    {opt.value === "bottom" && <ArrowDown size={11} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[12px] text-[var(--admin-text-muted)] leading-normal pt-1">
              {logoShape === "none"
                ? "Sin contenedor. El logo flota libremente."
                : "El logo se ajusta para llenar el contenedor."}
            </p>
          </div>
        </div>

        {/* BANNER CONTROLS */}
        <div className="md:col-span-7 flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
              Banner de Cabecera
              <span className="text-[12px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)] not-uppercase tracking-normal">Valores por defecto</span>
            </span>
            <label className="text-[13px] font-medium text-[var(--admin-text)] bg-[var(--admin-surface)] border border-[var(--admin-border)] px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:bg-[var(--admin-bg)]">
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
          <p className="text-[12px] text-[var(--admin-text-muted)]/60 -mt-2">M&aacute;x. 5MB — JPG, PNG, WEBP</p>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Posici&oacute;n vertical
              </span>
              <div className="flex flex-wrap gap-1">
                {BANNER_VERTICAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onBannerPosicionChange(opt.value)}
                    className={`flex items-center justify-center gap-1 px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                      bannerPosicion === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.value === "top" && <ArrowUp size={11} />}
                    {opt.value === "center" && <Minus size={11} />}
                    {opt.value === "bottom" && <ArrowDown size={11} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Escala del logo
              </span>
              <span className="text-[13px] font-mono text-[var(--admin-text-muted)]">
                {logoScale.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--admin-text-muted)]/60 font-mono">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={logoScale}
                onChange={(e) => onLogoScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-[var(--admin-bg)] rounded-full appearance-none cursor-pointer accent-[var(--admin-accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--admin-accent)] [&::-webkit-slider-thumb]:shadow-sm"
              />
              <span className="text-[12px] text-[var(--admin-text-muted)]/60 font-mono">2x</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Escala del banner
              </span>
              <span className="text-[13px] font-mono text-[var(--admin-text-muted)]">
                {bannerScale.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--admin-text-muted)]/60 font-mono">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={bannerScale}
                onChange={(e) => onBannerScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-[var(--admin-bg)] rounded-full appearance-none cursor-pointer accent-[var(--admin-accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--admin-accent)] [&::-webkit-slider-thumb]:shadow-sm"
              />
              <span className="text-[12px] text-[var(--admin-text-muted)]/60 font-mono">2x</span>
            </div>
          </div>

          {imageError && (
            <p className="text-[14px] text-red-500 flex items-center gap-1">
              <XCircle size={12} />
              {imageError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
