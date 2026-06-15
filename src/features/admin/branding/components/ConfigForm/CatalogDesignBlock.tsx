"use client";

import { Palette, Info, XCircle } from "lucide-react";
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
  logoFit?: string;
  logoShape?: string;
  mostrarNombre?: boolean;
  nombreForm?: string;
  logoScale?: number;
}

export function CatalogDesignBlock({
  colorPrimary,
  error,
  onChange,
}: CatalogDesignBlockProps) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
          <Palette size={14} className="text-[var(--admin-text-muted)]" />
          <h2 className="text-xs font-semibold text-[var(--admin-text)]">
            Color de Acento del Catálogo
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg border border-[var(--admin-border)] overflow-hidden relative cursor-pointer shadow-sm"
              style={{ backgroundColor: colorPrimary }}
            >
              <input
                type="color"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </div>
            <div className="flex-1 space-y-0.5">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
                Hexadecimal
                <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded not-uppercase tracking-normal">Obligatorio</span>
              </span>
              <input
                type="text"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className={`w-20 p-1 bg-[var(--admin-bg)] border rounded-md font-mono text-[11px] uppercase text-[var(--admin-text)] focus:outline-none focus:ring-1 ${
                  error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                }`}
                maxLength={7}
              />
              {error && (
                <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                  <XCircle size={10} />
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
              Paletas de Colores
            </span>
            {COLOR_PALETTES.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[10px] font-medium text-[var(--admin-text-muted)]/70 block">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onChange(color)}
                      className={`w-5 h-5 rounded-md border transition-all ${
                        colorPrimary.toLowerCase() === color.toLowerCase()
                          ? "border-[var(--admin-text)] scale-110 ring-2 ring-[var(--admin-border)] shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          La paleta se genera automáticamente y se inyecta como variables CSS{" "}
          <code>--color-custom-*</code> en el catálogo público.
        </p>
      </div>
    </div>
  );
}
