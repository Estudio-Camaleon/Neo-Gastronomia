"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Check, ImageIcon } from "lucide-react";
import type { PromoConGaleria } from "@/features/public-menu/types";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import { formatMoney } from "@/features/public-menu/utils";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface ComboDetailModalProps {
  promo: PromoConGaleria;
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
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  useScrollLock(true);

  const images = [promo.imagen_url, ...(promo.imagenes_extra ?? [])].filter(
    (u): u is string => !!u,
  );

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
        cantidad: 1,
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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[460px] sm:max-w-4xl bg-[var(--color-custom-surface-strong)] shadow-2xl overflow-hidden flex flex-col sm:flex-row max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:max-h-[92vh] sm:rounded-2xl sm:max-h-[85vh] lg:max-h-[80vh]"
      >
        {/* Image - left side on desktop */}
        <div className="relative sm:w-2/5 shrink-0 overflow-hidden bg-[var(--color-custom-100)] max-sm:aspect-video sm:flex sm:items-center sm:justify-center">
          {images.length > 0 ? (
            <div className="w-full h-full min-h-[140px] sm:min-h-full sm:flex sm:items-center sm:justify-center">
              <img
                src={images[selectedImageIdx]}
                alt={promo.nombre}
                className="h-full w-full object-cover sm:object-contain sm:h-auto sm:max-h-full"
              />
            </div>
          ) : (
            <div className="flex h-full w-full min-h-[140px] sm:min-h-full items-center justify-center text-[var(--color-custom-text-muted)]" role="img" aria-label={`${promo.nombre} — sin imagen`}>
              <ImageIcon size={48} />
            </div>
          )}

          {/* Gallery dots */}
          {images.length > 1 && (
            <div className="absolute left-0 right-0 bottom-16 z-10 flex items-center justify-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  aria-label={`Imagen ${idx + 1}`}
                  className={`rounded-full transition-all ${
                    idx === selectedImageIdx
                      ? "h-2 w-5 bg-white"
                      : "h-2 w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Gradient overlay + name/description on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-custom-900)]/70 via-[var(--color-custom-900)]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-lg bg-white/20 text-white shrink-0">
                <ShoppingBag size={9} />
              </div>
              <span className="rounded-full bg-white/20 px-1.5 py-[1px] text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.1em] text-white">
                Combo
              </span>
            </div>
            <h3 className="text-base font-bold text-white drop-shadow-sm">
              {promo.nombre}
            </h3>
            {promo.descripcion && (
              <p className="mt-0.5 text-xs text-white/80 leading-relaxed drop-shadow-sm line-clamp-2">
                {promo.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Close button - top right of modal */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-90"
        >
          <X size={18} />
        </button>

        {/* Content - right side on desktop */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Scrollable content (items + price) */}
          <div className="overflow-y-auto overscroll-y-contain flex-1 min-h-0">
            <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">
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
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-custom-border)] px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
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
            Agendar combo · {formatMoney(Number(promo.valor_descuento) * cantidad, simbolo)}
          </motion.button>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
