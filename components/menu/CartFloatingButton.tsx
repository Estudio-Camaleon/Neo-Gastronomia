"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "./store/useCartStore";

interface CartFloatingButtonProps {
  whatsapp: string;
  disabled?: boolean; // Agregamos la prop aquí
}

export function CartFloatingButton({
  whatsapp,
  disabled,
}: CartFloatingButtonProps) {
  const { items, total } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  // Si no hay items o el local está cerrado, no mostramos el botón flotante
  if (totalItems === 0 || disabled) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full px-4 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button className="w-full bg-black text-white h-16 rounded-2xl shadow-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-2 -right-2 bg-[var(--brand-color)] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
              {totalItems}
            </span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            Ver mi pedido
          </span>
        </div>

        <span className="font-black text-lg">
          ${total.toLocaleString("es-AR")}
        </span>
      </button>
    </div>
  );
}
