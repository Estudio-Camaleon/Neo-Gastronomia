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
    <div className="fixed bottom-6 right-6 z-40 font-sans md:right-8 md:bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center justify-center gap-2 bg-black text-[#A3FF00] border-4 border-black p-4 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(163,255,0,1)] hover:bg-[#A3FF00] hover:text-black transition-all cursor-pointer select-none group"
      >
        <ShoppingBag
          size={16}
          strokeWidth={3}
          className="group-hover:rotate-12 transition-transform"
        />
        <span>REVISAR PEDIDO</span>
        <span className="ml-1 bg-[#A3FF00] text-black group-hover:bg-black group-hover:text-[#A3FF00] font-mono font-black border border-black text-[10px] h-5 w-5 flex items-center justify-center transition-colors">
          {totalItems}
        </span>
      </button>
    </div>
  );
}
