"use client";

import { Check } from "lucide-react";
import type { ExtraGroup } from "@/features/public-menu/types";

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
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-custom-900)]">
              {group.titulo}
            </span>
            {group.requerido && (
              <span className="rounded-full bg-[var(--color-custom-500)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--color-custom-600)]">
                Requerido
              </span>
            )}
            {!group.multiple && group.items.length > 1 && (
              <span className="text-[9px] text-[var(--color-custom-text-muted)]">
                (elegí 1)
              </span>
            )}
          </div>
          <div
            className="space-y-1.5"
            role={group.multiple ? "group" : "radiogroup"}
            aria-label={group.titulo}
          >
            {group.items.map((item) => {
              const isSelected = (selected[group.id] || []).includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role={group.multiple ? "checkbox" : "radio"}
                  aria-checked={isSelected}
                  onClick={() => onToggle(group.id, item.id, group.multiple)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all ${
                    isSelected
                      ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)]/5 text-[var(--color-custom-900)]"
                      : "border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-300)]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                      isSelected
                        ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)] text-white"
                        : "border-[var(--color-custom-300)]"
                    }`}
                  >
                    {isSelected && group.multiple ? (
                      <Check size={10} strokeWidth={3} />
                    ) : isSelected ? (
                      <span className="block h-2 w-2 rounded-full bg-white" />
                    ) : null}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">
                    {item.nombre}
                  </span>
                  {item.precio > 0 && (
                    <span className="text-xs font-semibold text-[var(--color-custom-600)]">
                      +{fmt(item.precio, simbolo)}
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
