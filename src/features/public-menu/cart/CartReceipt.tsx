"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  AlertCircle,
  ShoppingBag,
  Percent,
  Tag,
  Sparkles,
} from "lucide-react";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import {
  formatMoney,
  getDiscountLabel,
  getPromoSubtotal,
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

  let autoDiscountAmount = 0;
  const promoDetails: { nombre: string; label: string; monto: number }[] = [];
  for (const promo of discountPromos) {
    const applicableSubtotal = getPromoSubtotal(promo, cart, productCategoryMap);
    if (applicableSubtotal <= 0) continue;
    let monto = 0;
    if (promo.tipo_descuento === "porcentaje") {
      monto = Math.round(applicableSubtotal * (promo.valor_descuento / 100));
    } else {
      monto = Math.min(Number(promo.valor_descuento), applicableSubtotal);
    }
    autoDiscountAmount += monto;
    promoDetails.push({ nombre: promo.nombre, label: getDiscountLabel(promo), monto });
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
      className="flex flex-1 flex-col"
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
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pr-1 receipt-scrollbar space-y-1">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="group rounded-xl border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] px-3 py-2.5 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                {/* Left: quantity + name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-custom-500)] text-[10px] font-bold text-white">
                      {item.cantidad}
                    </span>
                    <span className="truncate text-[13px] font-bold text-[var(--color-custom-900)]">
                      {item.nombre}
                    </span>
                  </div>

                  {/* Extras */}
                  {item.extras && item.extras.length > 0 && (
                    <div className="ml-8 mt-1 space-y-0.5">
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

                  {/* Unit price */}
                  <p className="ml-8 mt-0.5 text-[11px] text-[var(--color-custom-text-muted)]">
                    {formatMoney(item.precio, simbolo)} c/u
                  </p>
                </div>

                {/* Right: total per item */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[var(--color-custom-900)] tabular-nums">
                    {formatMoney(item.precio * item.cantidad, simbolo)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-px bg-[var(--color-custom-200)] my-3" />

      {/* Totals */}
      <motion.div variants={lineVariants} className="space-y-2">
        {/* Auto-applied promo banners */}
        {promoDetails.length > 0 && (
          <div className="space-y-1">
            {promoDetails.map((pd, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-green-200/60 bg-green-50/80 px-3 py-2 text-xs"
              >
                {pd.label.includes("%") ? (
                  <Percent size={13} className="shrink-0 text-green-600" />
                ) : (
                  <Tag size={13} className="shrink-0 text-green-600" />
                )}
                <span className="font-semibold text-green-800 truncate">
                  {pd.nombre}
                </span>
                <span className="shrink-0 ml-auto rounded-full bg-green-500 px-2 py-[1px] text-[9px] font-bold text-white">
                  {pd.label}
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

        {/* Discounts breakdown */}
        {autoDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-green-600 font-semibold">
              <Sparkles size={14} />
              Descuento
            </span>
            <span className="font-semibold text-green-600 tabular-nums">
              -{formatMoney(autoDiscountAmount, simbolo)}
            </span>
          </div>
        )}

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
    </motion.div>
  );
}
