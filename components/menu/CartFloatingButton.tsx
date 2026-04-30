"use client";

import { useCartStore } from "./store/useCartStore";
import { ShoppingBag } from "lucide-react";

export function CartFloatingButton({ whatsapp }: { whatsapp: string }) {
  const { items, total } = useCartStore();

  // Si no hay items, no mostramos nada
  if (items.length === 0) return null;

  const handleCheckout = () => {
    // Generamos el mensaje para WhatsApp
    const mensaje = items
      .map((i) => `*${i.cantidad}x* ${i.nombre} ($${i.precio * i.cantidad})`)
      .join("%0A");

    const textoFinal = `¡Hola! Me gustaría realizar el siguiente pedido:%0A%0A${mensaje}%0A%0A*Total: $${total}*`;

    window.open(`https://wa.me/${whatsapp}?text=${textoFinal}`, "_blank");
  };

  return (
    /* 
       lg:hidden: Oculta el componente en pantallas grandes (Escritorio).
       z-50: Asegura que esté por encima de todo.
    */
    <div className="fixed bottom-6 left-0 w-full px-4 lg:hidden z-50 animate-in slide-in-from-bottom-10 duration-500">
      <button
        onClick={handleCheckout}
        className="w-full bg-[var(--brand-color)] text-white py-4 px-6 rounded-[2rem] shadow-2xl shadow-[var(--brand-color)]/40 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={22} strokeWidth={2.5} />
            <span className="absolute -top-2 -right-2 bg-white text-[var(--brand-color)] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {items.length}
            </span>
          </div>
          <span className="font-black uppercase text-xs tracking-widest">
            Ver mi pedido
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-4 w-[1px] bg-white/20 mx-1" />
          <span className="font-black text-sm">${total}</span>
        </div>
      </button>
    </div>
  );
}
