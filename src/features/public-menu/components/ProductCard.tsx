"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Minus, Plus, ImageIcon, ShoppingBag, Percent, Tag } from "lucide-react";
import { cardVariants } from "./variants";
import { formatMoney } from "@/features/public-menu/utils";
import type { Producto } from "@/features/public-menu/types";

interface ProductDiscountInfo {
  label: string;
  type: "porcentaje" | "monto_fijo";
  valor: number;
}

interface ProductCardProps {
  product: Producto;
  cantidad: number;
  isOpenNow: boolean;
  simbolo?: string;
  isInCombo?: boolean;
  productDiscount?: ProductDiscountInfo | null;
  hasCodePromo?: boolean;
  onSelect: (product: Producto) => void;
  onQuickAdd: (product: Producto) => void;
  onRemove: (productId: string) => void;
}

export function ProductCard({
  product,
  cantidad,
  isOpenNow,
  simbolo = "$",
  isInCombo = false,
  productDiscount,
  hasCodePromo,
  onSelect,
  onQuickAdd,
  onRemove,
}: ProductCardProps) {
  const hasVariants =
    product.configuracion?.variantes &&
    product.configuracion.variantes.length > 0;
  const hasExtras =
    product.configuracion?.grupos_opciones &&
    product.configuracion.grupos_opciones.length > 0 &&
    product.configuracion.grupos_opciones.some((g) => g.items.length > 0);

  const showSuggestion = isInCombo || productDiscount || hasCodePromo;
  const showComboBadge = isInCombo && product.disponible;

  // Precio con descuento
  const discountedPrice = productDiscount
    ? productDiscount.type === "porcentaje"
      ? Math.round(product.precio * (1 - productDiscount.valor / 100))
      : Math.max(0, product.precio - productDiscount.valor)
    : null;

  return (
    <motion.article
      variants={cardVariants}
      layout
      onClick={(e) => {
        if (product.disponible && !(e.target as HTMLElement).closest("[data-image-area]")) onSelect(product);
      }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--color-custom-surface-strong)] to-[var(--color-custom-100)] shadow-sm ring-1 transition-shadow hover:shadow-lg hover:ring-black/[0.08] h-full flex flex-col ${
        productDiscount && product.disponible
          ? "ring-purple-300/40 dark:ring-purple-700/40"
          : "ring-black/[0.04]"
      } ${
        !product.disponible ? "opacity-50 grayscale" : "cursor-pointer"
      }`}
      aria-disabled={!product.disponible}
    >
      {/* Image area */}
      <div data-image-area className="relative aspect-[5/4] sm:aspect-[4/3] w-full overflow-hidden bg-[var(--color-custom-100)]">
        {product.imagen_url ? (
          <>
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              draggable={false}
              loading="eager"
              className="object-cover transition-transform duration-500 group-hover:scale-105 select-none"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient overlay for depth/volume */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-custom-text-muted)]" aria-hidden="true">
            <div className="flex flex-col items-center gap-1 opacity-50">
              <ImageIcon size={24} />
              <span className="text-[8px] font-mono uppercase tracking-[0.1em]">Sin imagen</span>
            </div>
          </div>
        )}

        {/* ── RIBBON / BADGES DE PROMOCIONES ── */}
        {product.disponible && (
          <>
            {/* Prominent ribbon: OFERTA / descuento */}
            {productDiscount && (
              <div
                className={`absolute top-0 left-0 right-0 px-3 py-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-white ${
                  productDiscount.type === "porcentaje"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500"
                    : "bg-gradient-to-r from-amber-600 to-amber-500"
                }`}
              >
                {productDiscount.type === "porcentaje" ? (
                  <Percent size={12} />
                ) : (
                  <Tag size={12} />
                )}
                <span className="uppercase tracking-[0.08em]">{productDiscount.label}</span>
              </div>
            )}

            {/* Badge: En combo (small pill, below ribbon or top-left) */}
            {showComboBadge && (
              <div className={`absolute ${productDiscount ? "top-9 right-2" : "top-2 left-2"}`}>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2 py-[3px] text-[9px] font-bold text-white shadow-sm backdrop-blur-[2px]">
                  <ShoppingBag size={10} />
                  En combo
                </span>
              </div>
            )}
          </>
        )}

        {/* Agotado badge */}
        {!product.disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#555] shadow-sm">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-3 p-4 sm:p-5 sm:pt-3.5">
        {/* Title + description + sugerencia */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-[14px] font-bold leading-tight text-[var(--color-custom-900)]">
            {product.nombre}
          </h3>
          {product.descripcion && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--color-custom-text-muted)]">
              {product.descripcion}
            </p>
          )}

          {/* ── SUGERENCIA DE PROMO ── */}
          {showSuggestion && product.disponible && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
              {isInCombo && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                  <ShoppingBag size={11} />
                  Disponible en combo
                </span>
              )}
              {productDiscount && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  productDiscount.type === "porcentaje" ? "text-purple-600" : "text-amber-600"
                }`}>
                  {productDiscount.type === "porcentaje" ? (
                    <Percent size={11} />
                  ) : (
                    <Tag size={11} />
                  )}
                  {productDiscount.label}
                </span>
              )}
              {hasCodePromo && !isInCombo && !productDiscount && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Tag size={11} />
                  Usá un código y ahorrá
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price — pushed to bottom via mt-auto */}
        <div className="mt-auto space-y-2">
          {discountedPrice !== null ? (
            <div className="flex items-center gap-2.5">
              <span className="text-[15px] sm:text-[16px] font-black tracking-tight text-[var(--color-custom-text-muted)] line-through decoration-2">
                {formatMoney(product.precio, simbolo)}
              </span>
              <span className={`text-[15px] sm:text-[16px] font-black tracking-tight ${
                productDiscount!.type === "porcentaje"
                  ? "text-purple-600"
                  : "text-amber-600"
              }`}>
                {formatMoney(discountedPrice, simbolo)}
              </span>
            </div>
          ) : (
            <span className="text-[15px] sm:text-[16px] font-black tracking-tight text-[var(--color-custom-900)]">
              {formatMoney(product.precio, simbolo)}
            </span>
          )}

          <div className="flex justify-end">
            {product.disponible ? (
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center overflow-hidden rounded-full bg-[var(--color-custom-500)] text-white shadow-sm"
              >
                <button
                  type="button"
                  aria-label={`Disminuir cantidad de ${product.nombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(product.id);
                  }}
                  className="flex h-11 w-11 items-center justify-center transition-all hover:bg-black/10 disabled:opacity-30"
                  disabled={cantidad === 0}
                >
                  <Minus size={18} />
                </button>
                <motion.span
                  key={cantidad}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="inline-flex min-w-[2.25rem] items-center justify-center text-sm font-bold tabular-nums"
                >
                  {cantidad}
                </motion.span>
                <button
                  type="button"
                  aria-label={`Aumentar cantidad de ${product.nombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOpenNow) return;
                    if (hasVariants || hasExtras) {
                      onSelect(product);
                    } else {
                      onQuickAdd(product);
                    }
                  }}
                  className={`flex h-11 w-11 items-center justify-center transition-all hover:bg-black/10 ${
                    !isOpenNow ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  disabled={!isOpenNow}
                >
                  <Plus size={18} />
                </button>
              </motion.div>
            ) : (
              <span className="rounded-full bg-[var(--color-custom-100)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-custom-text-muted)]">
                Agotado
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
