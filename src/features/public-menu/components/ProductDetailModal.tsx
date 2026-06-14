"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus, Check, ShoppingBag, ImageIcon } from "lucide-react";
import type { CartExtra } from "@/features/public-menu/cart/useCartStore";
import { generateItemId } from "@/features/public-menu/cart/useCartStore";
import type { Producto } from "@/features/public-menu/types";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface ProductDetailModalProps {
  product: Producto;
  onConfirm: (item: {
    id: string;
    producto_id: string;
    nombre: string;
    imagen_url: string | null;
    precio: number;
    cantidad: number;
    detalles: string | null;
    extras: CartExtra[];
  }) => void;
  onCancel: () => void;
  simbolo?: string;
  isOpenNow?: boolean;
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

export function ProductDetailModal({
  product,
  onConfirm,
  onCancel,
  simbolo = "$",
  isOpenNow = true,
}: ProductDetailModalProps) {
  const isMobile = useIsMobile();
  useScrollLock(true);
  const config = product.configuracion;
  const variants = config?.variantes ?? [];
  const groups = config?.grupos_opciones ?? [];

  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(
    null,
  );
  const [selectedExtras, setSelectedExtras] = useState<
    Record<string, string[]>
  >(() => {
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
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");

  const basePrice =
    selectedVariantIdx !== null
      ? variants[selectedVariantIdx].precio
      : Number(product.precio);
  const variantName =
    selectedVariantIdx !== null
      ? variants[selectedVariantIdx].nombre
      : null;

  const toggleExtra = (
    groupId: string,
    itemId: string,
    multiple: boolean,
  ) => {
    setSelectedExtras((prev) => {
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

  const extraTotal = useMemo(() => {
    let total = 0;
    for (const g of groups) {
      const ids = selectedExtras[g.id] || [];
      for (const id of ids) {
        const item = g.items.find((i) => i.id === id);
        if (item) total += item.precio;
      }
    }
    return total;
  }, [groups, selectedExtras]);

  const total = basePrice + extraTotal;

  const hasRequiredError = useMemo(() => {
    for (const g of groups) {
      if (
        g.requerido &&
        (!selectedExtras[g.id] || selectedExtras[g.id].length === 0)
      ) {
        return `Seleccioná una opción de "${g.titulo}"`;
      }
    }
    return null;
  }, [groups, selectedExtras]);

  const buildExtras = (): CartExtra[] => {
    const result: CartExtra[] = [];
    for (const g of groups) {
      const ids = selectedExtras[g.id] || [];
      for (const id of ids) {
        const item = g.items.find((i) => i.id === id);
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

  const handleConfirm = () => {
    if (hasRequiredError) return;
    const extras = buildExtras();
    const id = generateItemId(product.id, extras, variantName ?? undefined);
    onConfirm({
      id,
      producto_id: product.id,
      nombre: product.nombre,
      imagen_url: product.imagen_url,
      precio: total,
      cantidad,
      detalles: nota || null,
      extras,
    });
  };

  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const containerRef = useFocusTrap(true);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      tabIndex={-1}
    >
      <div
        className="absolute inset-0 bg-black/50 sm:backdrop-blur-sm"
        aria-hidden="true"
      />
      <motion.div
        initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.92, y: 20 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[460px] sm:max-w-sm bg-[var(--color-custom-surface-strong)] shadow-2xl overflow-hidden flex flex-col max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:max-h-[92vh] sm:rounded-2xl sm:max-h-[85vh] lg:max-h-[80vh]"
      >
        {/* Image */}
        {product.imagen_url ? (
          <div className="aspect-video sm:aspect-[4/3] w-full shrink-0 overflow-hidden bg-[var(--color-custom-100)]">
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-video sm:aspect-[4/3] w-full shrink-0 items-center justify-center bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)]" role="img" aria-label={`${product.nombre} — sin imagen`}>
            <ImageIcon size={48} />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-custom-border)] px-4 sm:px-5 py-3 sm:py-4 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-base font-bold text-[var(--color-custom-900)]">
              {product.nombre}
            </h3>
            {product.descripcion && (
              <p className="mt-1 text-xs text-[var(--color-custom-text-muted)] leading-relaxed">
                {product.descripcion}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--color-custom-border)] text-[var(--color-custom-700)] transition-colors hover:bg-[var(--color-custom-100)] hover:text-[var(--color-custom-900)] active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-4 sm:space-y-5 flex-1 min-h-0">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[var(--color-custom-900)]">
              {simbolo}
              {formatMoney(basePrice + extraTotal)}
            </span>
            {extraTotal > 0 && (
              <span className="text-[10px] sm:text-xs text-[var(--color-custom-text-muted)] block sm:inline">
                ({simbolo}
                {formatMoney(basePrice)} + {simbolo}
                {formatMoney(extraTotal)} extras)
              </span>
            )}
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-custom-900)]">
                  Variante
                </span>
                <span className="text-[9px] text-[var(--color-custom-text-muted)]">
                  (opcional)
                </span>
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variante">
                {variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={selectedVariantIdx === idx}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all min-w-0 ${
                      selectedVariantIdx === idx
                        ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)]/5 text-[var(--color-custom-900)]"
                        : "border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-300)]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                        selectedVariantIdx === idx
                          ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)] text-white"
                          : "border-[var(--color-custom-300)]"
                      }`}
                    >
                      {selectedVariantIdx === idx && (
                        <span className="block h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="font-medium truncate">{v.nombre}</span>
                    <span className="text-xs font-semibold text-[var(--color-custom-600)]">
                      {simbolo}
                      {formatMoney(v.precio)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extras */}
          {groups.length > 0 && (
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
                  <div className="space-y-1.5" role={group.multiple ? "group" : "radiogroup"} aria-label={group.titulo}>
                    {group.items.map((item) => {
                      const isSelected = (
                        selectedExtras[group.id] || []
                      ).includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role={group.multiple ? "checkbox" : "radio"}
                          aria-checked={isSelected}
                          onClick={() =>
                            toggleExtra(
                              group.id,
                              item.id,
                              group.multiple,
                            )
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
          )}

          {/* Note */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-custom-900)] mb-2 block">
              Nota (opcional)
            </span>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Sin cebolla, bien cocido..."
              aria-label="Nota del pedido"
              className="w-full rounded-xl border border-[var(--color-custom-border)] bg-[var(--color-custom-surface)] px-4 py-2.5 text-sm text-[var(--color-custom-text)] placeholder:text-[var(--color-custom-text-muted)] outline-none focus:border-[var(--color-custom-500)] focus:ring-1 focus:ring-[var(--color-custom-500)]/20 resize-none h-20 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-custom-border)] px-4 sm:px-5 py-3 sm:py-4 space-y-3 shrink-0 pb-[env(safe-area-inset-bottom,0.75rem)]">
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-custom-900)]">
              Cantidad
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                aria-label="Reducir cantidad"
                className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30 active:scale-90"
              >
                <Minus size={15} />
              </button>
              <span className="w-10 sm:w-8 text-center text-sm font-bold tabular-nums text-[var(--color-custom-900)]" aria-live="polite" aria-atomic="true">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad(cantidad + 1)}
                aria-label="Aumentar cantidad"
                className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] active:scale-90"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-custom-text-muted)]">
              Total
            </span>
            <span className="text-lg font-black text-[var(--color-custom-900)]" aria-live="polite" aria-atomic="true">
              {simbolo}
              {formatMoney(total * cantidad)}
            </span>
          </div>

          {hasRequiredError && (
            <p className="text-xs text-red-500 text-center">
              {hasRequiredError}
            </p>
          )}

          <motion.button
            type="button"
            disabled={!!hasRequiredError || !product}
            onClick={(e) => {
              if (!isOpenNow) return;
              handleConfirm();
            }}
            whileHover={!hasRequiredError && isOpenNow ? { scale: 1.01 } : {}}
            whileTap={!hasRequiredError && isOpenNow ? { scale: 0.99 } : {}}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
              !isOpenNow
                ? "bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)] cursor-not-allowed opacity-40"
                : hasRequiredError
                ? "bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)] cursor-not-allowed"
                : "bg-[var(--color-custom-900)] text-white hover:bg-[var(--color-custom-800)]"
            }`}
          >
            <ShoppingBag size={16} className="shrink-0" />
            {isOpenNow ? (
              <span className="truncate">
                Agregar al pedido · {simbolo}
                {formatMoney(total * cantidad)}
              </span>
            ) : (
              <span className="truncate">Local cerrado</span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
