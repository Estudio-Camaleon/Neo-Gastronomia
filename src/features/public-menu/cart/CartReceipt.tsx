"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import {
  formatMoney,
  getDiscountLabel,
  getPromoSubtotal,
  calculateDiscounts,
} from "@/features/public-menu/utils";
import type { PromoRow } from "@/features/public-menu/types";

/* ── Animations ─────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 } as const,
  },
} as const;

const lineVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 28 },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.12 } as const },
} as const;

/* ── Props ────────────────────────────────────────── */
interface CartReceiptProps {
  cart: CartItem[];
  subtotal: number;
  negocioNombre?: string;
  config: {
    moneda_simbolo?: string;
    pedido_minimo?: number;
    costo_envio?: number;
  };
  promos?: PromoRow[];
  productCategoryMap?: Record<string, string>;
  onVaciar: () => void;
  onConfirmar: () => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveEntry?: (id: string) => void;
}

/* ── Main Component ──────────────────────────────── */
export function CartReceipt({
  cart,
  subtotal,
  negocioNombre,
  config,
  promos = [],
  productCategoryMap = {},
  onVaciar,
  onConfirmar,
  onUpdateQuantity,
  onRemoveEntry,
}: CartReceiptProps) {
  const simbolo = config.moneda_simbolo || "$";
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // Auto-applied discounts
  const discountPromos = promos.filter(
    (p) =>
      p.tipo_descuento !== "combo" &&
      !p.codigo &&
      getPromoSubtotal(p, cart, productCategoryMap) > 0,
  );

  // Per‑item discount info for visual badge
  const itemPromoMap = new Map<string, { label: string }[]>();
  const { total: autoDiscountAmount, details: promoDetails } =
    calculateDiscounts(discountPromos, cart, productCategoryMap);

  // Build per‑item badge map from promo details
  for (const promo of discountPromos) {
    const aplicarA = promo.aplicar_a as
      | { productos?: string[]; categorias?: string[] }
      | null
      | undefined;
    const label = getDiscountLabel(promo);
    for (const item of cart) {
      let affected = false;
      if (!aplicarA) {
        affected = true;
      } else {
        if ((aplicarA.productos ?? []).includes(item.producto_id)) affected = true;
        if (!affected) {
          const catIds = aplicarA.categorias ?? [];
          for (const catId of catIds) {
            if (productCategoryMap[item.producto_id] === catId) {
              affected = true;
              break;
            }
          }
        }
      }
      if (affected) {
        const arr = itemPromoMap.get(item.producto_id) ?? [];
        arr.push({ label });
        itemPromoMap.set(item.producto_id, arr);
      }
    }
  }

  const totalConDescuento = subtotal - autoDiscountAmount;
  const minimoConDescuento = (config.pedido_minimo || 0) - totalConDescuento;
  const esValidoConDescuento = totalConDescuento >= (config.pedido_minimo || 0);

  return (
    <motion.div
      key="receipt"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <h3 className="text-xs font-semibold text-[var(--color-custom-text-muted)] uppercase tracking-wider">
          Tu pedido · {totalItems} producto{totalItems !== 1 ? "s" : ""}
        </h3>
        {negocioNombre && (
          <span className="text-[10px] font-medium text-[var(--color-custom-text-muted)]">
            {negocioNombre}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 min-h-0 max-h-[70vh] overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 receipt-scrollbar space-y-1">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="group relative rounded-xl border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] px-3 py-2.5 transition-colors"
            >
              {onRemoveEntry && (
                <button
                  type="button"
                  onClick={() => onRemoveEntry(item.id)}
                  aria-label={`Eliminar ${item.nombre} del carrito`}
                  className="absolute -top-1.5 -right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[var(--color-custom-200)] text-[var(--color-custom-text-muted)] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <div className="flex items-start gap-2.5">
                {/* Image thumbnail */}
                {item.imagen_url && (
                  <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-[var(--color-custom-100)] mt-0.5">
                    <Image
                      src={item.imagen_url}
                      alt={item.nombre}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {/* Center: name + extras + controls */}
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-[13px] font-bold text-[var(--color-custom-900)]">
                    {item.nombre}
                  </span>

                  {/* Extras */}
                  {item.extras && item.extras.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {item.extras.map((e, ei) => (
                        <p key={ei} className="text-[11px] text-[var(--color-custom-text-muted)]">
                          + {e.item_nombre}
                          {(e.cantidad ?? 1) > 1 && ` x${e.cantidad}`}
                          {e.item_precio > 0 &&
                            ` (${formatMoney(e.item_precio * (e.cantidad ?? 1), simbolo)})`}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Nota del cliente (solo texto plano, no JSON de combo) */}
                  {item.detalles && !item.detalles.startsWith("[") && (
                    <p className="mt-0.5 text-[11px] italic text-[var(--color-custom-text-muted)] leading-tight">
                      “{item.detalles}”
                    </p>
                  )}

                  {/* Badge de descuento */}
                  {itemPromoMap.get(item.producto_id)?.map((p, pi) => (
                    <span
                      key={pi}
                      className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-[2px] text-[10px] font-semibold text-green-700"
                    >
                      <Sparkles size={10} />
                      {p.label}
                    </span>
                  ))}

                  {/* Unit price & quantity controls */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      {onUpdateQuantity && (
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label={`Reducir cantidad de ${item.nombre}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-custom-200)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] hover:text-[var(--color-custom-900)]"
                        >
                          <Minus size={12} />
                        </button>
                      )}
                      <span className="w-7 text-center text-xs font-bold text-[var(--color-custom-900)] tabular-nums">
                        {item.cantidad}
                      </span>
                      {onUpdateQuantity && (
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-custom-200)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] hover:text-[var(--color-custom-900)]"
                        >
                          <Plus size={12} />
                        </button>
                      )}
                      
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[var(--color-custom-900)] tabular-nums">
                        {formatMoney(item.precio * item.cantidad, simbolo)} c/u
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom section: separator + totals + actions (always pinned to bottom) */}
      <div className="mt-auto shrink-0">
        <div className="h-px bg-[var(--color-custom-200)] my-3" />

        {/* Totals */}
        <motion.div variants={lineVariants} className="space-y-2">
          {/* Auto-applied promo banners */}
          {promoDetails.length > 0 && (
            <div className="space-y-1">
              {promoDetails.map((pd, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-green-200/60 bg-green-50/80 px-3 py-2 text-ls"
                >
                  <span className="font-semibold text-green-800 truncate">
                    {pd.nombre}
                  </span>
                  <span className="shrink-0 ml-auto rounded-full bg-green-500 px-2 py-[1px] text-[12px] font-bold text-white">
                    -{formatMoney(pd.monto, simbolo)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Minimum order warning (checking actual total after discounts) */}
          {!esValidoConDescuento && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/80 px-3 py-2 text-xs text-amber-800"
            >
              <AlertCircle size={14} className="shrink-0 text-amber-500" />
              <span>
                Mínimo:{" "}
                <strong>
                  {formatMoney(config.pedido_minimo || 0, simbolo)}
                </strong>
                &nbsp;(falta{" "}
                {formatMoney(Math.max(0, minimoConDescuento), simbolo)})
              </span>
            </motion.div>
          )}

          {/* Subtotal line */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-custom-text-muted)]">Subtotal</span>
            <span className="font-semibold text-[var(--color-custom-900)] tabular-nums">
              {formatMoney(subtotal, simbolo)}
            </span>
          </div>

          {/* Total after discounts */}
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-[var(--color-custom-200)]">
            <span className="text-base font-bold text-[var(--color-custom-900)]">
              Total
            </span>
            <motion.span
              key={totalConDescuento}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              className="text-xl font-black tabular-nums text-[var(--color-custom-900)]"
            >
              {formatMoney(totalConDescuento, simbolo)}
            </motion.span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={lineVariants}
          className="mt-5 flex gap-2"
        >
          <motion.button
            type="button"
            aria-label="Vaciar carrito"
            onClick={onVaciar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-custom-200)] px-3 py-3 text-xs font-semibold text-[var(--color-custom-text-muted)] transition-all hover:bg-[var(--color-custom-100)]"
          >
            <Trash2 size={14} />
            Vaciar
          </motion.button>
          <motion.button
            type="button"
            aria-label="Finalizar pedido"
            disabled={!esValidoConDescuento}
            onClick={onConfirmar}
            whileHover={esValidoConDescuento ? { scale: 1.02 } : {}}
            whileTap={esValidoConDescuento ? { scale: 0.97 } : {}}
            className={`flex-[2] flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              esValidoConDescuento
                ? "bg-[var(--color-custom-500)] text-white shadow-sm hover:opacity-90"
                : "bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)] cursor-not-allowed opacity-60"
            }`}
          >
            <ShoppingBag size={16} />
            Ir al pedido
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
