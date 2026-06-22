"use client";

import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import type { CartExtra } from "@/features/public-menu/cart/useCartStore";
import type { ExtraGroup } from "@/features/public-menu/types";
import { formatMoney } from "@/features/public-menu/utils";
import { ExtraGroupRenderer } from "@/features/public-menu/components/ExtraGroupRenderer";
import { useExtrasSelection } from "@/features/public-menu/hooks/useExtrasSelection";
import { useScrollLock } from "@/core/hooks/useScrollLock";

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
  const {
    quantities,
    hasError,
    extraTotal,
    toggleItem,
    addItem,
    removeItem,
    getQuantity,
    buildExtras,
  } = useExtrasSelection(groups);

  useScrollLock(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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

        <div className="max-h-[50vh] overflow-y-auto overscroll-y-contain px-5 py-4 space-y-5">
          <ExtraGroupRenderer
            groups={groups}
            quantities={quantities}
            onToggle={toggleItem}
            onAdd={addItem}
            onRemove={removeItem}
            getQuantity={getQuantity}
            simbolo={simbolo}
            formatMoney={formatMoney}
          />
        </div>

        <div className="border-t border-[var(--color-custom-border)] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-custom-text-muted)]">
              Subtotal
            </span>
            <span className="font-semibold text-[var(--color-custom-900)]">
              {formatMoney(basePrice + extraTotal, simbolo)}
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
