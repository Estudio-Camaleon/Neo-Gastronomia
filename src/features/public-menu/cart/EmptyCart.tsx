"use client";

import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle2, Plus } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 180, damping: 18 },
  },
};

interface EmptyCartProps {
  showOrderForm: boolean;
  lastOrderId: string | null;
  onNewOrder: () => void;
}

export function EmptyCart({
  showOrderForm,
  lastOrderId,
  onNewOrder,
}: EmptyCartProps) {
  const isSuccess = showOrderForm && lastOrderId;

  return (
    <motion.div
      key="empty"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 14,
          delay: 0.12,
        }}
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${
          isSuccess
            ? "border-green-200 bg-green-50 text-green-500"
            : "border-dashed border-[var(--color-custom-200)] bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)]"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={26} strokeWidth={1.8} />
        ) : (
          <ShoppingBag size={26} strokeWidth={1.8} />
        )}
      </motion.div>

      {/* Title */}
      <p
        className={`text-sm font-bold ${
          isSuccess ? "text-green-600" : "text-[var(--color-custom-900)]"
        }`}
      >
        {isSuccess
          ? "Pedido Confirmado"
          : showOrderForm
            ? "Procesando..."
            : "Carrito Vacío"}
      </p>

      {/* Message */}
      <p className="mt-1 max-w-[220px] text-sm text-[var(--color-custom-text-muted)] leading-relaxed">
        {isSuccess
          ? "Gracias por tu compra. Pronto recibirás la confirmación."
          : "Agregá productos del menú para empezar"}
      </p>

      {/* Order ref */}
      {isSuccess && (
        <>
          <div className="mt-5 rounded-xl border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-custom-text-muted)]">
              Referencia
            </p>
            <p className="text-lg font-black text-[var(--color-custom-900)] tracking-tight">
              #{lastOrderId!.slice(0, 6).toUpperCase()}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={onNewOrder}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5 flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--color-custom-200)] px-5 py-2.5 text-xs font-semibold text-[var(--color-custom-text-muted)] transition-all hover:border-[var(--color-custom-500)] hover:text-[var(--color-custom-500)] hover:bg-[var(--color-custom-100)]"
          >
            <Plus size={14} />
            Nuevo Pedido
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
