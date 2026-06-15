"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Minus, Plus, ImageIcon } from "lucide-react";
import { cardVariants } from "./variants";
import { formatMoney } from "@/features/public-menu/utils";
import type { Producto } from "@/features/public-menu/types";

interface ProductCardProps {
  product: Producto;
  cantidad: number;
  isOpenNow: boolean;
  simbolo?: string;
  onSelect: (product: Producto) => void;
  onQuickAdd: (product: Producto) => void;
  onRemove: (productId: string) => void;
}

export function ProductCard({
  product,
  cantidad,
  isOpenNow,
  simbolo = "$",
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

  return (
    <motion.article
      variants={cardVariants}
      layout
      onClick={() => {
        if (product.disponible) onSelect(product);
      }}
      className={`group relative overflow-hidden rounded-2xl bg-[var(--color-custom-surface-strong)] shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg hover:ring-black/[0.08] ${
        !product.disponible ? "opacity-50 grayscale" : "cursor-pointer"
      }`}
      aria-disabled={!product.disponible}
    >
      {/* Image area */}
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-[var(--color-custom-100)]">
        {product.imagen_url ? (
          <>
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              loading="eager"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient overlay at bottom for text legibility */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-custom-text-muted)]" aria-hidden="true">
            <div className="flex flex-col items-center gap-1 opacity-50">
              <ImageIcon size={28} />
              <span className="text-[9px] font-mono uppercase tracking-[0.1em]">Sin imagen</span>
            </div>
          </div>
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
      <div className="flex flex-col gap-3 p-4">
        {/* Title + description */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold leading-tight text-[var(--color-custom-900)]">
            {product.nombre}
          </h3>
          {product.descripcion && (
            <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--color-custom-text-muted)]">
              {product.descripcion}
            </p>
          )}
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-black tracking-tight text-[var(--color-custom-900)]">
            {formatMoney(product.precio, simbolo)}
          </span>

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
                className="flex h-10 w-10 items-center justify-center transition-all hover:bg-black/10 disabled:opacity-30 sm:h-9 sm:w-9"
                disabled={cantidad === 0}
              >
                <Minus size={15} />
              </button>
              <motion.span
                key={cantidad}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="inline-flex min-w-[2.25rem] items-center justify-center text-sm font-bold tabular-nums sm:min-w-[2rem]"
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
                className={`flex h-10 w-10 items-center justify-center transition-all hover:bg-black/10 sm:h-9 sm:w-9 ${
                  !isOpenNow ? "opacity-40 cursor-not-allowed" : ""
                }`}
                disabled={!isOpenNow}
              >
                <Plus size={15} />
              </button>
            </motion.div>
          ) : (
            <span className="rounded-full bg-[var(--color-custom-100)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-custom-text-muted)]">
              Agotado
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
