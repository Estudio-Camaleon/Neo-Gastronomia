"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

interface CartFloatingButtonProps {
  disabled?: boolean;
  onClick: () => void; // Recibe la acción reactiva de apertura directamente desde el layout superior
}

export function CartFloatingButton({
  disabled,
  onClick,
}: CartFloatingButtonProps) {
  // Selectores reactivos directo desde Zustand
  const cart = useCartStore((state) => state.cart);

  // Reducción eficiente del estado global
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  // Si no hay elementos o el local está cerrado/deshabilitado, no interrumpe la navegación
  if (totalItems === 0 || disabled) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full px-6 md:hidden animate-in fade-in slide-in-from-bottom-6 duration-500 font-sans">
      <button
        type="button"
        onClick={onClick}
        className="w-full bg-black text-white dark:bg-primary h-16 rounded-neo shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between px-6 active:scale-[0.98] transition-all border-t border-white/20 group select-none"
      >
        {/* Lado Izquierdo: Contador e Identificadores */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingBag
              size={24}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="absolute -top-2.5 -right-2.5 bg-primary dark:bg-black text-white text-[9px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-black dark:border-primary animate-bounce font-mono">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary dark:text-black mb-1">
              Check-out
            </span>
            <span className="text-xs font-black uppercase italic tracking-tight">
              Ver mi pedido
            </span>
          </div>
        </div>

        {/* Lado Derecho: Precio Acumulado */}
        <div className="flex flex-col items-end leading-none">
          <span className="text-[8px] font-bold uppercase opacity-50 mb-1">
            Subtotal
          </span>
          <span className="font-black text-lg italic tracking-tight font-mono">
            ${totalPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </button>
    </div>
  );
}
