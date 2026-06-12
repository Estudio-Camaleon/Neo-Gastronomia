"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import type { CartExtra } from "@/features/public-menu/cart/useCartStore";
import type { ExtraGroup } from "@/features/public-menu/types";

interface ExtrasSelectorProps {
  productName: string;
  basePrice: number;
  groups: ExtraGroup[];
  onConfirm: (extras: CartExtra[], extraTotal: number) => void;
  onCancel: () => void;
  simbolo?: string;
}

export function ExtrasSelector({
  productName,
  basePrice,
  groups,
  onConfirm,
  onCancel,
  simbolo = "$",
}: ExtrasSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const g of groups) {
      if (g.requerido && !g.multiple && g.items.length > 0) {
        initial[g.id] = [g.items[0].id];
      } else {
        initial[g.id] = [];
      }
    }
    return initial;
  });

  const toggleItem = (groupId: string, itemId: string, multiple: boolean) => {
    setSelected((prev) => {
      const current = prev[groupId] || [];
      if (multiple) {
        const exists = current.includes(itemId);
        return {
          ...prev,
          [groupId]: exists
            ? current.filter((id) => id !== itemId)
            : [...current, itemId],
        };
      }
      return { ...prev, [groupId]: [itemId] };
    });
  };

  const hasError = useMemo(() => {
    for (const g of groups) {
      if (g.requerido && (!selected[g.id] || selected[g.id].length === 0)) {
        return `Seleccioná una opción de "${g.titulo}"`;
      }
    }
    return null;
  }, [groups, selected]);

  const extraTotal = useMemo(() => {
    let total = 0;
    for (const g of groups) {
      const ids = selected[g.id] || [];
      for (const id of ids) {
        const item = g.items.find((i: ExtraGroup["items"][0]) => i.id === id);
        if (item) total += item.precio;
      }
    }
    return total;
  }, [groups, selected]);

  const buildExtras = (): CartExtra[] => {
    const result: CartExtra[] = [];
    for (const g of groups) {
      const ids = selected[g.id] || [];
      for (const id of ids) {
        const item = g.items.find((i: ExtraGroup["items"][0]) => i.id === id);
        if (item) {
          result.push({
            grupo_id: g.id,
            grupo_titulo: g.titulo,
            item_id: item.id,
            item_nombre: item.nombre,
            item_precio: item.precio,
          });
        }
      }
    }
    return result;
  };

  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        className="relative w-[calc(100vw-2rem)] max-w-md sm:max-w-sm rounded-2xl bg-[var(--color-custom-surface-strong)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-custom-border)] px-5 py-4">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-custom-text-muted)]">
              Personalizar
            </p>
            <h3 className="truncate text-base font-bold text-[var(--color-custom-900)]">
              {productName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-5 py-4 space-y-5">
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
              <div className="space-y-1.5">
                {group.items.map((item: ExtraGroup["items"][0]) => {
                  const isSelected = (selected[group.id] || []).includes(
                    item.id,
                  );
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        toggleItem(group.id, item.id, group.multiple)
                      }
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
                          +{simbolo}
                          {formatMoney(item.precio)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-custom-border)] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-custom-text-muted)]">
              Subtotal
            </span>
            <span className="font-semibold text-[var(--color-custom-900)]">
              {simbolo}
              {formatMoney(basePrice + extraTotal)}
            </span>
          </div>
          {hasError && (
            <p className="text-xs text-red-500 text-center">{hasError}</p>
          )}
          <motion.button
            type="button"
            disabled={!!hasError}
            onClick={() => onConfirm(buildExtras(), extraTotal)}
            whileHover={!hasError ? { scale: 1.01 } : {}}
            whileTap={!hasError ? { scale: 0.99 } : {}}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
              hasError
                ? "bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)] cursor-not-allowed"
                : "bg-[var(--color-custom-900)] text-white hover:bg-[var(--color-custom-800)]"
            }`}
          >
            <Plus size={16} />
            Agregar al pedido
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
