"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Flame, Star, PiggyBank } from "lucide-react";
import type { PromoRow } from "@/features/public-menu/types";
import { formatMoney } from "@/features/public-menu/utils";

function ComboCard({
  promo,
  onClick,
  badge,
}: {
  promo: PromoRow;
  onClick: () => void;
  badge?: "mas-vendido" | "mejor-valor";
}) {
  const items = (promo.items_combo as Array<{
    producto_id: string;
    nombre_producto: string;
    cantidad: number;
    precio: number;
  }> | null) ?? [];

  const realTotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const ahorro = realTotal - Number(promo.valor_descuento);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="relative flex items-stretch gap-0 overflow-hidden rounded-2xl border-2 border-[var(--color-custom-500)]/20 bg-gradient-to-br from-[var(--color-custom-surface-strong)] to-[var(--color-custom-100)] shadow-md cursor-pointer text-left transition-all hover:shadow-lg hover:border-[var(--color-custom-500)]/40 active:scale-[0.98] w-full"
    >
      {/* Badge superior */}
      {badge === "mas-vendido" && (
        <div className="absolute -top-px -right-px z-10 inline-flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
          <Flame size={11} />
          Más vendido
        </div>
      )}
      {badge === "mejor-valor" && (
        <div className="absolute -top-px -right-px z-10 inline-flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
          <Star size={11} />
          Mejor valor
        </div>
      )}

      {/* Image thumbnail */}
      {promo.imagen_url ? (
        <div className="w-20 sm:w-28 shrink-0 overflow-hidden bg-[var(--color-custom-100)] min-h-[80px] sm:min-h-[100px]">
          <img
            src={promo.imagen_url}
            alt={promo.nombre}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex w-14 sm:w-22 shrink-0 items-center justify-center bg-[var(--color-custom-500)]/10 text-[var(--color-custom-500)] min-h-[80px] sm:min-h-[100px]">
          <ShoppingBag size={24} />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-3.5 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="rounded-full bg-gradient-to-r from-[var(--color-custom-500)] to-[var(--color-custom-600)] px-2 py-[2px] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.08em] text-white">
              Combo
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--color-custom-900)] truncate leading-tight">
            {promo.nombre}
          </p>
          {items.length > 0 && (
            <p className="text-[10px] sm:text-xs text-[var(--color-custom-text-muted)] truncate mt-0.5">
              {items.map((i) => `${i.cantidad}x ${i.nombre_producto}`).join(" · ")}
            </p>
          )}

          {ahorro > 0 && (
            <div className="inline-flex items-center gap-0.5 mt-1.5 rounded-full bg-green-500/10 px-2 py-[2px] text-[9px] sm:text-[10px] font-bold text-green-600">
              <PiggyBank size={10} />
              Ahorrás {formatMoney(ahorro, "$")}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right ml-1 sm:ml-0">
          <p className="text-base sm:text-lg font-black text-[var(--color-custom-500)] leading-none whitespace-nowrap">
            {formatMoney(Number(promo.valor_descuento), "$")}
          </p>
          {items.length > 0 && (
            <p className="text-[10px] sm:text-xs text-[var(--color-custom-text-muted)] line-through leading-tight mt-0.5 whitespace-nowrap">
              {formatMoney(realTotal, "$")}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function CombosSection({
  promos,
  onComboClick,
}: {
  promos: PromoRow[];
  onComboClick?: (promo: PromoRow) => void;
}) {
  const combos = promos.filter((p) => p.tipo_descuento === "combo");
  if (combos.length === 0) return null;

  // First combo gets "Más vendido", second gets "Mejor valor" (if multiple)
  const badges: Array<"mas-vendido" | "mejor-valor" | undefined> = [
    "mas-vendido",
    "mejor-valor",
  ];

  return (
    <div className="mt-4 mb-6 space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-custom-500)] to-[var(--color-custom-600)] text-white text-xs">
          <Flame size={14} />
        </span>
        <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--color-custom-900)]">
          Combos que vuelan
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {combos.map((promo, idx) => (
          <ComboCard
            key={promo.id}
            promo={promo}
            badge={badges[idx]}
            onClick={() => onComboClick?.(promo)}
          />
        ))}
      </div>
    </div>
  );
}
