"use client";

import { Palette, Info, Check } from "lucide-react";
import { COLOR_PALETTES } from "../../types";

export interface CatalogDesignBlockProps {
  colorPrimary: string;
  error?: string;
  onChange: (val: string) => void;
  bannerUrl?: string | null;
  bannerPosicion?: string;
  bannerHeight?: string;
  bannerScale?: number;
  logoUrl?: string | null;
  logoPosicion?: string;
  logoShape?: string;
  mostrarNombre?: boolean;
  nombreForm?: string;
  logoScale?: number;
}

export function CatalogDesignBlock({
  colorPrimary,
  nombreForm,
  onChange,
}: CatalogDesignBlockProps) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between gap-4">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <Palette size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)]">
          Color de Acento del Catálogo
        </h2>
      </div>

      {/* ── LIVE PREVIEW CARD ── */}
      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="h-12" style={{ backgroundColor: colorPrimary }} />
        <div className="p-3 space-y-2">
          <p className="text-sm font-bold text-[var(--admin-text)] leading-tight">
            {nombreForm || "Nombre del negocio"}
          </p>
          <div className="flex gap-1.5">
            <span
              className="text-[10px] font-medium text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: colorPrimary }}
            >
              Ver menú
            </span>
            <span className="text-[10px] font-medium text-[var(--admin-text-muted)] bg-[var(--admin-surface)] border border-[var(--admin-border)] px-2 py-0.5 rounded-full">
              Pedir
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--admin-border)]">
            <span
              className="w-3 h-3 rounded inline-block shrink-0 border border-[var(--admin-border)]"
              style={{ backgroundColor: colorPrimary }}
            />
            <span className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase">
              {colorPrimary}
            </span>
          </div>
        </div>
      </div>

      {/* ── PALETTES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <span className="col-span-full text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
          Seleccionar color
        </span>
        {COLOR_PALETTES.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <span className="text-[10px] font-medium text-[var(--admin-text-muted)]/70 block">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.colors.map((color) => {
                const isSelected =
                  colorPrimary.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className="relative"
                    title={color}
                  >
                    <span
                      className={`block w-7 h-7 rounded-lg border transition-all ${
                        isSelected
                          ? "border-[var(--admin-text)] ring-2 ring-[var(--admin-border)] shadow-sm"
                          : "border-transparent hover:scale-110 hover:shadow-sm"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={14}
                          className={
                            isLightColor(color)
                              ? "text-black"
                              : "text-white"
                          }
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── INFO ── */}
      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          La paleta se genera automáticamente y se inyecta como variables CSS{" "}
          <code className="text-[9px] bg-[var(--admin-surface)] px-1 py-0.5 rounded border border-[var(--admin-border)]">
            --color-custom-*
          </code>{" "}
          en el catálogo público.
        </p>
      </div>
    </div>
  );
}

function isLightColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}
