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
            : "border-dashed border-[#ddd] bg-[#f8f5f0] text-[#bbb]"
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
        className={`text-[11px] font-mono font-bold uppercase tracking-[0.18em] ${
          isSuccess ? "text-green-600" : "text-[#999]"
        }`}
      >
        {isSuccess
          ? "Pedido Confirmado"
          : showOrderForm
            ? "Procesando..."
            : "Carrito Vacío"}
      </p>

      {/* Message */}
      <p className="mt-2 max-w-[200px] text-[11px] font-mono text-[#aaa] leading-relaxed">
        {isSuccess
          ? "Gracias por tu compra. Pronto recibirás la confirmación."
          : "Agregá productos del menú para empezar"}
      </p>

      {/* Order ref */}
      {isSuccess && (
        <>
          <div className="mt-4 rounded-lg border border-dashed border-[#ddd] bg-[#f8f5f0] px-4 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#999]">
              Referencia
            </p>
            <p className="font-mono text-[13px] font-bold text-[#333]">
              #{lastOrderId!.slice(0, 6).toUpperCase()}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={onNewOrder}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5 flex items-center gap-1.5 rounded-lg border border-dashed border-[#ddd] px-5 py-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-[#888] transition-all hover:border-[#ccc] hover:bg-[#f8f5f0] hover:text-[#555]"
          >
            <Plus size={13} />
            Nuevo Pedido
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
