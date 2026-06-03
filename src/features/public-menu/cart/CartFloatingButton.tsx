"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "./useCartStore";

export function CartFloatingButton() {
  const cart = useCartStore((state) => state.cart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  if (totalItems === 0 || isCartOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 sm:right-6 sm:bottom-6">
      <button
        type="button"
        onClick={toggleCart}
        aria-label="Abrir o cerrar carrito de compras"
        aria-expanded={isCartOpen}
        className="relative flex items-center justify-center gap-2 rounded-full bg-[var(--color-custom-900)] px-5 py-3.5 font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.24)] group"
      >
        <ShoppingBag
          size={18}
          className="group-hover:rotate-12 transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
          aria-hidden="true"
        />
        <span className="text-xs sm:text-sm">Ver pedido</span>

        {totalItems > 0 && (
          <span
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--color-custom-500)] text-[11px] font-black text-white shadow-sm motion-reduce:animate-none animate-in zoom-in"
            aria-live="polite"
            aria-atomic="true"
          >
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}
