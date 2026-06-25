"use client";

import { Palette, Info, Check } from "lucide-react";
import { COLOR_PALETTES } from "../../types";

export interface CatalogDesignBlockProps {
  colorPrimary: string;
  error?: string;
  onChange: (val: string) => void;
}

export function CatalogDesignBlock({
  colorPrimary,
  onChange,
}: CatalogDesignBlockProps) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between gap-4">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <Palette size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-[15px] font-semibold text-[var(--admin-text)]">
          Color de Acento del Catálogo
        </h2>
      </div>

      {/* ── PALETTES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <span className="col-span-full text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
          Seleccionar color
        </span>
        {COLOR_PALETTES.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <span className="text-[13px] font-medium text-[var(--admin-text-muted)]/70 block">
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
                    aria-label={`Color primario: ${color}`}
                    aria-pressed={isSelected}
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
        <p className="text-[13px] text-[var(--admin-text-muted)] leading-normal">
          La paleta se genera automáticamente y se inyecta como variables CSS{" "}
          <code className="text-[12px] bg-[var(--admin-surface)] px-1 py-0.5 rounded border border-[var(--admin-border)]">
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
