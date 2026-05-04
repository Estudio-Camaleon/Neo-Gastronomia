"use client";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartItem({
  item,
  isClosed,
}: {
  item: any;
  isClosed?: boolean;
}) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="flex justify-between items-start gap-4">
        <span className="uppercase flex-1 leading-tight text-[11px] font-black italic">
          {item.cantidad}X {item.nombre}
        </span>
        <span className="font-black whitespace-nowrap text-[11px] italic">
          ${(item.precio * item.cantidad).toLocaleString("es-AR")}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-2 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3 border border-black/10 px-2 py-0.5 rounded-sm">
          <button
            onClick={() => updateQuantity(item.id, -1)}
            className="hover:font-black text-xs px-1"
            disabled={isClosed}
          >
            -
          </button>
          <span className="text-[9px] min-w-[10px] text-center font-bold">
            {item.cantidad}
          </span>
          <button
            onClick={() => updateQuantity(item.id, 1)}
            className="hover:font-black text-xs px-1"
            disabled={isClosed}
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-[8px] flex items-center gap-1 hover:text-red-600 font-black uppercase tracking-tighter italic"
        >
          <Trash2 size={10} /> Quitar
        </button>
      </div>
    </div>
  );
}
