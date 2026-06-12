"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "./useCartStore";

export function CartFloatingButton() {
  const cart = useCartStore((state) => state.cart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <AnimatePresence>
      {totalItems > 0 && !isCartOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-5 right-8 z-[70] sm:right-12 sm:bottom-6 safe-bottom"
        >
          <motion.button
            type="button"
            onClick={toggleCart}
            aria-label="Abrir o cerrar carrito de compras"
            aria-expanded={isCartOpen}
            whileHover={{ y: -3, boxShadow: "0 18px 36px rgba(0,0,0,0.24)" }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center gap-2 rounded-full bg-[var(--color-custom-900)] px-5 py-3.5 font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition-colors duration-300 group"
          >
            <motion.div
              whileHover={{ rotate: 12 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ShoppingBag size={18} aria-hidden="true" />
            </motion.div>
            <span className="text-xs sm:text-sm">Ver pedido</span>

            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--color-custom-500)] text-[11px] font-black text-white shadow-sm"
                aria-live="polite"
                aria-atomic="true"
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
