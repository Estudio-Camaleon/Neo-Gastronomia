"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShoppingBag, ImageIcon, Plus, Minus } from "lucide-react";
import type { PromoRow } from "@/features/public-menu/types";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";

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

  const realTotal = items.reduce(
    (sum, i) => sum + i.precio * i.cantidad,
    0,
  );

  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
        {/* Image */}
        {promo.imagen_url ? (
          <div className="aspect-video w-full overflow-hidden bg-[var(--color-custom-100)]">
            <img
              src={promo.imagen_url}
              alt={promo.nombre}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)]">
            <ImageIcon size={48} />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-custom-border)] px-5 py-4">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-custom-500)] text-white">
                <ShoppingBag size={12} />
              </div>
              <span className="rounded-full bg-[var(--color-custom-500)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--color-custom-600)]">
                Combo
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--color-custom-900)]">
              {promo.nombre}
            </h3>
            {promo.descripcion && (
              <p className="mt-1 text-xs text-[var(--color-custom-text-muted)] leading-relaxed">
                {promo.descripcion}
              </p>
            )}
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

        {/* Items */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-custom-700)] mb-3">
              Incluye
            </p>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-[var(--color-custom-border)] px-4 py-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-custom-500)]/15 text-[11px] font-bold text-[var(--color-custom-700)]">
                    {item.cantidad}
                  </span>
                  <span className="flex-1 text-sm font-medium text-[var(--color-custom-900)] truncate">
                    {item.nombre_producto}
                  </span>
                  {item.precio > 0 && (
                    <span className="text-xs text-[var(--color-custom-text-muted)]">
                      {simbolo}
                      {formatMoney(item.precio)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price comparison */}
          <div className="rounded-xl border border-[var(--color-custom-border)] bg-[var(--color-custom-100)]/50 px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-custom-text-muted)]">
                Valor real
              </span>
              <span className="line-through text-[var(--color-custom-text-muted)]">
                {simbolo}
                {formatMoney(realTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[var(--color-custom-900)]">
                Precio combo
              </span>
              <span className="text-lg font-black text-[var(--color-custom-500)]">
                {simbolo}
                {formatMoney(Number(promo.valor_descuento))}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 font-semibold">
                Ahorrás
              </span>
              <span className="text-green-600 font-bold">
                {simbolo}
                {formatMoney(realTotal - Number(promo.valor_descuento))}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-custom-border)] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-custom-900)]">
              Cantidad
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold tabular-nums text-[var(--color-custom-900)]">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad(cantidad + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)]"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleAdd}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-custom-900)] py-3 text-sm font-bold text-white hover:bg-[var(--color-custom-800)] transition-colors"
          >
            <ShoppingBag size={16} />
            Agregar al pedido · {simbolo}
            {formatMoney(Number(promo.valor_descuento) * cantidad)}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
