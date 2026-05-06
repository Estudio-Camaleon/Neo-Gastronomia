"use client";

import { useCartStore } from "../store/useCartStore";
import { ShoppingBag } from "lucide-react";

interface CartFloatingButtonProps {
  onClick: () => void;
}

export function CartFloatingButton({ onClick }: CartFloatingButtonProps) {
  const cart = useCartStore((state) => state.cart);

  // Calculamos la cantidad total de productos en el carrito en tiempo real
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // Si no hay productos en el pedido, mantenemos el botón oculto para no estorbar la navegación inicial
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans md:right-8 md:bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        onClick={onClick}
        // Explicación de Clases:
        // bg-custom y border-custom muerden la variable de la base de datos de Tailwind v4.
        // Agregamos un borde inferior negro grueso (border-b-4 border-black) para darle el toque Neo-Brutalista definitivo.
        className="relative flex items-center justify-center gap-3 bg-custom text-white p-5 rounded-2xl border-2 border-black border-b-6 shadow-xl hover:-translate-y-1 active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer select-none group"
      >
        {/* Ícono de bolsa con micro-rotación al hacer hover */}
        <ShoppingBag
          size={20}
          strokeWidth={2.5}
          className="group-hover:rotate-12 transition-transform duration-300"
        />

        <span className="font-black uppercase italic text-xs tracking-wider">
          Ver mi Pedido
        </span>

        {/* Burbuja Flotante con el Contador de Ítems */}
        <span className="absolute -top-2 -right-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black text-[10px] font-black font-mono h-6 w-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
          {totalItems}
        </span>
      </button>
    </div>
  );
}
