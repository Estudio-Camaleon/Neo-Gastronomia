"use client";

import { Check, Flame, Plus, Minus } from "lucide-react";
import type { ExtraGroup } from "@/features/public-menu/types";
import { FOOD_ICONS } from "@/components/ui/food-icons";

interface ExtraGroupRendererProps {
  groups: ExtraGroup[];
  quantities: Record<string, Record<string, number>>;
  onToggle: (groupId: string, itemId: string) => void;
  onAdd: (groupId: string, itemId: string) => void;
  onRemove: (groupId: string, itemId: string) => void;
  getQuantity: (groupId: string, itemId: string) => number;
  simbolo?: string;
  formatMoney: (value: number, simbolo?: string) => string;
}

export function ExtraGroupRenderer({
  groups,
  quantities,
  onToggle,
  onAdd,
  onRemove,
  getQuantity,
  simbolo = "$",
  formatMoney: fmt,
}: ExtraGroupRendererProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-[var(--color-custom-900)]">
              {group.titulo}
            </span>
            {group.requerido && (
              <span className="rounded-full bg-[var(--color-custom-500)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--color-custom-600)]">
                Requerido
              </span>
            )}
          </div>

          {group.multiple ? (
            // ── Multiple selection with quantity ──
            <div className="space-y-1.5">
              {group.items.map((item, idx) => {
                const qty = getQuantity(group.id, item.id);
                const isRecomendado = idx === 0 && group.items.length > 1 && !group.requerido;
                const itemMax = item.max;
                const atMax = itemMax !== undefined && itemMax !== null && qty >= itemMax;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                      qty > 0
                        ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)]/5"
                        : "border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)]"
                    }`}
                  >
                    {/* Icon */}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-custom-100)] text-sm">
                      {item.icono && item.icono in FOOD_ICONS ? (
                        <img
                          src={FOOD_ICONS[item.icono as keyof typeof FOOD_ICONS].path}
                          alt={item.nombre}
                          className="size-5 object-contain"
                        />
                      ) : (
                        item.nombre.charAt(0)
                      )}
                    </span>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-[var(--color-custom-900)] leading-tight line-clamp-2">
                          {item.nombre}
                        </span>
                        {isRecomendado && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-[1px] text-[7px] font-bold text-white whitespace-nowrap shadow-xs">
                            <Flame size={7} />
                            Recomendado
                          </span>
                        )}
                      </div>
                      {item.precio > 0 ? (
                        <span className="text-[10px] font-bold text-[var(--color-custom-500)]">
                          +{fmt(item.precio, simbolo)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-green-600">
                          Incluido
                        </span>
                      )}
                    </div>

                    {/* + / - controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRemove(group.id, item.id)}
                        disabled={qty <= 0}
                        aria-label={`Quitar ${item.nombre}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30 active:scale-90"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-[var(--color-custom-900)]" aria-live="polite" aria-atomic="true">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAdd(group.id, item.id)}
                        disabled={atMax}
                        aria-label={atMax ? `Máximo ${itemMax} ${item.nombre}` : `Agregar ${item.nombre}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30 active:scale-90"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // ── Single selection (radio) ──
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label={group.titulo}
            >
              {group.items.map((item) => {
                const qty = getQuantity(group.id, item.id);
                const isSelected = qty > 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onToggle(group.id, item.id)}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition-all ${
                      isSelected
                        ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)]/5"
                        : "border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] hover:border-[var(--color-custom-300)] hover:shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-custom-500)] text-white">
                        <Check size={8} strokeWidth={3} />
                      </span>
                    )}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-custom-100)] text-sm">
                      {item.icono && item.icono in FOOD_ICONS ? (
                        <img
                          src={FOOD_ICONS[item.icono as keyof typeof FOOD_ICONS].path}
                          alt={item.nombre}
                          className="size-5 object-contain"
                        />
                      ) : (
                        item.nombre.charAt(0)
                      )}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--color-custom-900)] leading-tight line-clamp-2">
                      {item.nombre}
                    </span>
                    {item.precio > 0 ? (
                      <span className="text-[10px] font-bold text-[var(--color-custom-500)]">
                        +{fmt(item.precio, simbolo)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-green-600">
                        Incluido
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
