"use client";

import { Check, Flame, Plus } from "lucide-react";
import type { ExtraGroup } from "@/features/public-menu/types";
import { FOOD_ICONS } from "@/components/ui/food-icons";

interface ExtraGroupRendererProps {
  groups: ExtraGroup[];
  selected: Record<string, string[]>;
  onToggle: (groupId: string, itemId: string, multiple: boolean) => void;
  simbolo?: string;
  formatMoney: (value: number, simbolo?: string) => string;
}

export function ExtraGroupRenderer({
  groups,
  selected,
  onToggle,
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
          <div
            className="grid grid-cols-2 gap-2"
            role={group.multiple ? "group" : "radiogroup"}
            aria-label={group.titulo}
          >
            {group.items.map((item, idx) => {
              const isSelected = (selected[group.id] || []).includes(item.id);
              const isRecomendado = idx === 0 && group.items.length > 1 && !group.requerido;
              return (
                <button
                  key={item.id}
                  type="button"
                  role={group.multiple ? "checkbox" : "radio"}
                  aria-checked={isSelected}
                  onClick={() => onToggle(group.id, item.id, group.multiple)}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition-all ${
                    isSelected
                      ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)]/5"
                      : "border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] hover:border-[var(--color-custom-300)] hover:shadow-sm"
                  }`}
                >
                  {isRecomendado && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-[1px] text-[7px] font-bold text-white whitespace-nowrap shadow-xs">
                      <Flame size={8} />
                      Recomendado
                    </span>
                  )}
                  <span className="relative">
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
                  {!isSelected && item.precio > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--color-custom-500)] mt-0.5">
                      <Plus size={9} /> Agregar
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
