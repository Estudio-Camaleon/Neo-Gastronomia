"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Tag } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="overflow-hidden rounded-2xl border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] shadow-sm cursor-pointer"
    >
      {promo.imagen_url && (
        <div className="aspect-[2/1] overflow-hidden">
          <img
            src={promo.imagen_url}
            alt={promo.nombre}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-3 bg-[var(--color-custom-500)]/10 px-4 py-3 border-b border-[var(--color-custom-200)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-custom-500)] text-white">
          <ShoppingBag size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--color-custom-900)] truncate">
            {promo.nombre}
          </p>
          {promo.descripcion && (
            <p className="text-xs text-[var(--color-custom-text-muted)] line-clamp-1">
              {promo.descripcion}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-full bg-[var(--color-custom-500)] px-3 py-1 text-xs font-bold text-white">
          ${Number(promo.valor_descuento).toLocaleString("es-AR")}
        </div>
      </div>

      {items.length > 0 && (
        <div className="divide-y divide-[var(--color-custom-100)] px-4 py-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1.5 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-custom-500)]/15 text-[10px] font-bold text-[var(--color-custom-700)]">
                {item.cantidad}
              </span>
              <span className="text-[var(--color-custom-text)] truncate">
                {item.nombre_producto}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PromoBanner({ promo }: { promo: PromoRow }) {
  const isPorcentaje = promo.tipo_descuento === "porcentaje";
  const label = isPorcentaje
    ? `${promo.valor_descuento}% OFF`
    : `$${Number(promo.valor_descuento).toLocaleString("es-AR")} OFF`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm"
    >
      <Tag size={16} className="shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-amber-800">{promo.nombre}</span>
        {promo.descripcion && (
          <span className="ml-1 text-amber-600">— {promo.descripcion}</span>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
        {label}
      </span>
      {promo.codigo && (
        <code className="hidden sm:block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700">
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
    <div className="mt-6 space-y-3">
      {others.length > 0 && (
        <div className="space-y-2">
          {others.map((promo) => (
            <PromoBanner key={promo.id} promo={promo} />
          ))}
        </div>
      )}

      {combos.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-custom-700)]">
            Combos
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {combos.map((promo) => (
              <ComboCard
                key={promo.id}
                promo={promo}
                onClick={() => onComboClick?.(promo)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
