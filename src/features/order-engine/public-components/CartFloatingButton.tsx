"use client";

import { useCartStore } from "./useCartStore";
import { ShoppingBag } from "lucide-react";

interface CartFloatingButtonProps {
  onClick: () => void;
}

export function CartFloatingButton({ onClick }: CartFloatingButtonProps) {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 md:right-8 md:bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center justify-center gap-2 bg-[var(--admin-accent,#34a35f)] text-white px-5 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      >
        <ShoppingBag
          size={18}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
        <span className="text-sm">Ver Pedido</span>

        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 shadow-sm animate-in zoom-in">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}
