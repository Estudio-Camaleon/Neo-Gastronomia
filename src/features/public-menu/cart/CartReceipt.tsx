"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Scissors,
  Printer,
  ShoppingBag,
} from "lucide-react";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import { formatMoney } from "@/features/public-menu/utils";

/* ── Animations ─────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 } as const,
  },
} as const;

const lineVariants = {
  hidden: { opacity: 0, x: -12, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 200, damping: 28 },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.12 } as const },
} as const;

/* ── Dividers ───────────────────────────────────── */
function DashedDivider() {
  return (
    <div
      aria-hidden="true"
      className="relative my-3 flex items-center justify-center"
    >
      <div className="h-px w-full bg-[length:6px_1px] bg-[repeating-linear-gradient(90deg,#bbb_0px,#bbb_3px,transparent_3px,transparent_6px)]" />
      <Scissors size={10} className="absolute text-[#bbb]" />
    </div>
  );
}

function DottedDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-2 h-px bg-[length:4px_1px] bg-[repeating-linear-gradient(90deg,#ccc_0px,#ccc_2px,transparent_2px,transparent_4px)]"
    />
  );
}

/* ── Receipt Header ──────────────────────────────── */
function ReceiptHeader() {
  return (
    <motion.div variants={lineVariants} className="text-center pb-1">
      <Printer size={13} className="mx-auto mb-1 text-[#999]" />
      <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-[#999]">
        Comprobante
      </p>
      <DottedDivider />
    </motion.div>
  );
}

/* ── Receipt Footer ──────────────────────────────── */
function ReceiptFooter() {
  return (
    <motion.div variants={lineVariants} className="text-center pt-2 space-y-0.5">
      <DottedDivider />
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#999]">
        Gracias por tu compra
      </p>
      <div className="flex justify-center gap-0.5 mt-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="h-1 w-1 rounded-full bg-[#ddd]" />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Props ────────────────────────────────────────── */
interface CartReceiptProps {
  cart: CartItem[];
  subtotal: number;
  config: {
    moneda_simbolo?: string;
    pedido_minimo?: number;
    costo_envio?: number;
  };
  onVaciar: () => void;
  onConfirmar: () => void;
}

/* ── Main Component ──────────────────────────────── */
export function CartReceipt({
  cart,
  subtotal,
  config,
  onVaciar,
  onConfirmar,
}: CartReceiptProps) {
  const minimaFalta = (config.pedido_minimo || 0) - subtotal;
  const esValido = subtotal >= (config.pedido_minimo || 0);
  const simbolo = config.moneda_simbolo || "$";

  return (
    <motion.div
      key="receipt"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col"
    >
      {/* TOP CUT */}
      <div className="flex justify-between px-0.5 mb-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="h-[3px] w-[3px] rounded-full bg-[#ddd]" />
        ))}
      </div>

      <ReceiptHeader />

      {/* Items */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 receipt-scrollbar space-y-0.5">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="group rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f5f0ea]"
            >
              <div className="flex items-start justify-between gap-2">
                {/* Left: quantity + name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-[#888] tabular-nums">
                      {String(item.cantidad).padStart(2, "0")}
                    </span>
                    <span className="truncate text-[12px] font-bold text-[#222]">
                      {item.nombre}
                    </span>
                  </div>

                  {/* Extras */}
                  {item.extras && item.extras.length > 0 && (
                    <div className="ml-[22px] mt-0.5 space-y-0.5">
                      {item.extras.map((e, ei) => (
                        <p key={ei} className="text-[10px] text-[#888]">
                          + {e.item_nombre}
                          {e.item_precio > 0 &&
                            ` (${formatMoney(e.item_precio, simbolo)})`}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Unit price */}
                  <p className="ml-[22px] text-[10px] text-[#999]">
                    {formatMoney(item.precio, simbolo)} c/u
                  </p>
                </div>

                {/* Right: total per item */}
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-bold text-[#222] tabular-nums">
                    {formatMoney(item.precio * item.cantidad, simbolo)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <DashedDivider />

      {/* Totals */}
      <motion.div variants={lineVariants} className="space-y-2 pt-0.5">
        {/* Minimum order warning */}
        {!esValido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-800"
          >
            <AlertCircle size={13} className="shrink-0 text-amber-500" />
            <span>
              Mínimo:{" "}
              <strong>
                {formatMoney(config.pedido_minimo || 0, simbolo)}
              </strong>
              &nbsp;(falta {formatMoney(minimaFalta, simbolo)})
            </span>
          </motion.div>
        )}

        {/* Subtotal line */}
        <div className="flex items-center justify-between px-1 text-[11px] text-[#888]">
          <span>SUBTOTAL</span>
          <span className="tabular-nums font-semibold text-[#444]">
            {formatMoney(subtotal, simbolo)}
          </span>
        </div>

        <DashedDivider />

        {/* Total */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#111]">
            TOTAL
          </span>
          <motion.span
            key={subtotal}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            className="text-xl font-black tabular-nums text-[#111]"
          >
            {formatMoney(subtotal, simbolo)}
          </motion.span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        variants={lineVariants}
        className="mt-4 flex gap-2"
      >
        <motion.button
          type="button"
          aria-label="Vaciar carrito"
          onClick={onVaciar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#ddd] px-2 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-[#888] transition-all hover:border-[#ccc] hover:bg-[#f5f0ea] hover:text-[#555]"
        >
          <Trash2 size={12} />
          Vaciar
        </motion.button>
        <motion.button
          type="button"
          aria-label="Finalizar pedido"
          disabled={!esValido}
          onClick={onConfirmar}
          whileHover={esValido ? { scale: 1.02 } : {}}
          whileTap={esValido ? { scale: 0.97 } : {}}
          className={`flex-[2] flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-mono font-bold uppercase tracking-[0.12em] transition-all ${
            esValido
              ? "bg-[#222] text-white shadow-sm hover:bg-[#111]"
              : "bg-[#eee] text-[#bbb] cursor-not-allowed"
          }`}
        >
          <ShoppingBag size={14} />
          Confirmar Pedido
        </motion.button>
      </motion.div>

      <ReceiptFooter />
    </motion.div>
  );
}
