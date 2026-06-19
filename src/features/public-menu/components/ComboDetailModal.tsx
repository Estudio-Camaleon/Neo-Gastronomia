"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Check } from "lucide-react";
import type { PromoRow } from "@/features/public-menu/types";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import { formatMoney } from "@/features/public-menu/utils";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface ComboDetailModalProps {
  promo: PromoRow;
  onConfirm: (item: CartItem) => void;
  onCancel: () => void;
  simbolo?: string;
}

export function ComboDetailModal({
  promo,
  onConfirm,
  onCancel,
  simbolo = "$",
}: ComboDetailModalProps) {
  const items = (promo.items_combo as Array<{
    producto_id: string;
    nombre_producto: string;
    cantidad: number;
    precio: number;
  }> | null) ?? [];

  const [cantidad, setCantidad] = useState(1);
  useScrollLock(true);

  const realTotal = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const ahorro = realTotal - Number(promo.valor_descuento);

  const handleAdd = () => {
    const comboKey = `combo-${promo.id}`;
    onConfirm({
      id: comboKey,
      producto_id: comboKey,
      nombre: promo.nombre,
      imagen_url: promo.imagen_url,
      precio: Number(promo.valor_descuento),
      cantidad,
      detalles: JSON.stringify(items),
      extras: items.map((i) => ({
        grupo_id: "combo_items",
        grupo_titulo: "Incluye",
        item_id: i.producto_id,
        item_nombre: `${i.cantidad}x ${i.nombre_producto}`,
        item_precio: 0,
      })),
    });
  };

  const containerRef = useFocusTrap(true);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      tabIndex={-1}
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
        className="relative w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-[var(--color-custom-surface-strong)] shadow-2xl overflow-hidden"
      >
        {/* Compact header with optional image */}
        <div className="flex items-stretch gap-0">
          {promo.imagen_url && (
            <div className="w-20 sm:w-24 shrink-0 overflow-hidden bg-[var(--color-custom-100)] min-h-[68px] sm:min-h-[88px]">
              <img
                src={promo.imagen_url}
                alt={promo.nombre}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 px-3 sm:px-4 py-3 sm:py-3.5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-lg bg-[var(--color-custom-500)] text-white shrink-0">
                <ShoppingBag size={9} />
              </div>
              <span className="rounded-full bg-[var(--color-custom-500)]/10 px-1.5 py-[1px] text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--color-custom-600)]">
                Combo
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[var(--color-custom-900)] leading-tight">
              {promo.nombre}
            </h3>
            {promo.descripcion && (
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-[var(--color-custom-text-muted)] leading-relaxed line-clamp-2">
                {promo.descripcion}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg m-2 sm:m-3 text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)]"
          >
            <X size={12} />
          </button>
        </div>

        {/* Items list */}
        <div className="px-3 sm:px-4 pb-2 space-y-2 sm:space-y-3">
          <div className="divide-y divide-[var(--color-custom-border)] rounded-xl border border-[var(--color-custom-border)] overflow-hidden">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-custom-500)]/15 text-[8px] sm:text-[10px] font-bold text-[var(--color-custom-700)]">
                  {item.cantidad}
                </span>
                <span className="flex-1 text-[10px] sm:text-xs font-medium text-[var(--color-custom-900)] truncate">
                  {item.nombre_producto}
                </span>
              </div>
            ))}
          </div>

          {/* Price summary — inline, compact */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-xl border border-[var(--color-custom-border)] bg-[var(--color-custom-100)]/50 px-3 sm:px-3.5 py-2 sm:py-2.5">
            <div className="space-y-0.5">
              <p className="text-[9px] sm:text-[10px] text-[var(--color-custom-text-muted)] line-through">
                {formatMoney(realTotal, simbolo)}
              </p>
              <p className="text-base sm:text-lg font-black text-[var(--color-custom-500)] leading-none">
                {formatMoney(Number(promo.valor_descuento), simbolo)}
              </p>
            </div>
            {ahorro > 0 && (
              <div className="shrink-0 rounded-full bg-green-500/10 px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-green-600 whitespace-nowrap">
                Ahorrás {formatMoney(ahorro, simbolo)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-custom-border)] px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-medium text-[var(--color-custom-900)]">
              Cant.
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30"
              >
                <Minus size={12} />
              </button>
              <span className="w-6 text-center text-sm font-bold tabular-nums text-[var(--color-custom-900)]">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad(cantidad + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)]"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleAdd}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--color-custom-500)] to-[var(--color-custom-600)] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition-all shadow-md w-full sm:w-auto"
          >
            <ShoppingBag size={16} />
            Agendar combo 🚀 · {formatMoney(Number(promo.valor_descuento) * cantidad, simbolo)}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
