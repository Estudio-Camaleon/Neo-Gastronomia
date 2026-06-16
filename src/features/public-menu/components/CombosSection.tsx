"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Tag, Percent } from "lucide-react";
import type { PromoRow } from "@/features/public-menu/types";

function ComboCard({
  promo,
  onClick,
}: {
  promo: PromoRow;
  onClick: () => void;
}) {
  const items = (promo.items_combo as Array<{
    producto_id: string;
    nombre_producto: string;
    cantidad: number;
    precio: number;
  }> | null) ?? [];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] shadow-xs cursor-pointer text-left transition-all hover:shadow-md hover:border-[var(--color-custom-500)]/30 active:scale-[0.99] w-full"
    >
      {/* Image thumbnail */}
      {promo.imagen_url ? (
        <div className="w-16 sm:w-24 shrink-0 overflow-hidden bg-[var(--color-custom-100)] min-h-[68px] sm:min-h-[88px]">
          <img
            src={promo.imagen_url}
            alt={promo.nombre}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex w-12 sm:w-20 shrink-0 items-center justify-center bg-[var(--color-custom-500)]/10 text-[var(--color-custom-500)]">
          <ShoppingBag size={20} />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="rounded-full bg-[var(--color-custom-500)]/10 px-1.5 py-[1px] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--color-custom-600)]">
              Combo
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--color-custom-900)] truncate leading-tight">
            {promo.nombre}
          </p>
          {items.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-[var(--color-custom-text-muted)] truncate mt-0.5">
              {items.map((i) => `${i.cantidad}x ${i.nombre_producto}`).join(" · ")}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right ml-1 sm:ml-0">
          <p className="text-sm sm:text-base font-black text-[var(--color-custom-500)] leading-none whitespace-nowrap">
            ${Number(promo.valor_descuento).toLocaleString("es-AR")}
          </p>
          {items.length > 0 && (
            <p className="text-[9px] sm:text-[10px] text-[var(--color-custom-text-muted)] line-through leading-tight mt-0.5 whitespace-nowrap">
              ${items.reduce((s, i) => s + i.precio * i.cantidad, 0).toLocaleString("es-AR")}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function PromoBadge({ promo }: { promo: PromoRow }) {
  const isPorcentaje = promo.tipo_descuento === "porcentaje";
  const label = isPorcentaje
    ? `${promo.valor_descuento}% OFF`
    : `$${Number(promo.valor_descuento).toLocaleString("es-AR")} OFF`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-lg border border-amber-200/60 bg-amber-50/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs"
    >
      {isPorcentaje ? (
        <Percent size={12} className="shrink-0 text-amber-600" />
      ) : (
        <Tag size={12} className="shrink-0 text-amber-600" />
      )}
      <span className="font-semibold text-amber-800 truncate text-[11px] sm:text-xs">
        {promo.nombre}
      </span>
      {promo.descripcion && (
        <span className="hidden sm:inline text-amber-600 truncate text-[11px]">
          — {promo.descripcion}
        </span>
      )}
      <span className="shrink-0 rounded-full bg-amber-500 px-2 py-[1px] text-[9px] sm:text-[10px] font-bold text-white ml-auto">
        {label}
      </span>
      {promo.codigo && (
        <code className="hidden sm:inline-flex rounded bg-amber-100 px-1.5 py-[1px] text-[8px] sm:text-[9px] font-mono font-bold text-amber-700">
          {promo.codigo}
        </code>
      )}
    </motion.div>
  );
}

export function CombosSection({
  promos,
  onComboClick,
}: {
  promos: PromoRow[];
  onComboClick?: (promo: PromoRow) => void;
}) {
  if (promos.length === 0) return null;

  const combos = promos.filter((p) => p.tipo_descuento === "combo");
  const others = promos.filter((p) => p.tipo_descuento !== "combo");

  return (
    <div className="mt-3 mb-4 space-y-2">
      {/* Discount banners — compact */}
      {others.length > 0 && (
        <div className="space-y-1.5">
          {others.map((promo) => (
            <PromoBadge key={promo.id} promo={promo} />
          ))}
        </div>
      )}

      {/* Combo cards — compact horizontal */}
      {combos.length > 0 && (
        <div className="space-y-1.5">
          {combos.map((promo) => (
            <ComboCard
              key={promo.id}
              promo={promo}
              onClick={() => onComboClick?.(promo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
