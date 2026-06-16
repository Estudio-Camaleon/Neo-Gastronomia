"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "./useCartStore";

export function CartFloatingButton() {
  const cart = useCartStore((state) => state.cart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <AnimatePresence>
      {totalItems > 0 && !isCartOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-5 z-[70] sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] safe-bottom"
        >
          <motion.button
            type="button"
            onClick={toggleCart}
            aria-label="Abrir carrito de compras"
            aria-expanded={false}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            className="group relative flex items-center gap-2.5 rounded-full bg-[var(--color-custom-900)] px-5 py-3.5 font-bold text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)] transition-colors hover:bg-[var(--color-custom-800)]"
          >
            {/* Glow ring */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-0"
            />

            <ShoppingBag size={17} aria-hidden="true" />
            <span className="text-xs tracking-wide">
              ${total.toLocaleString("es-AR")}
            </span>

            {/* Badge */}
            <motion.span
              key={totalItems}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -top-2 -right-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border-2 border-white bg-[var(--color-custom-500)] px-1 text-[10px] font-black text-white shadow-md"
              aria-live="polite"
              aria-atomic="true"
            >
              {totalItems}
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
