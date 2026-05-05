"use client";

import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "../store/useCartStore"; // Conexión unificada al store global de Zustand

interface CartItemData {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartItemProps {
  item: CartItemData;
  isClosed?: boolean;
}

export function CartItem({ item, isClosed }: CartItemProps) {
  // SELECTORES SINCRONIZADOS: Usamos exactamente "updateCantidad" tal cual figura en tu useCartStore
  const updateCantidad = useCartStore((state) => state.updateCantidad);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-300 font-sans py-1.5 w-full text-text-primary dark:text-text-inverse">
      {/* Detalle del Producto y Subtotal */}
      <div className="flex justify-between items-start gap-4">
        <span className="uppercase flex-1 leading-tight text-[11px] font-black italic tracking-tight">
          {item.cantidad}x {item.nombre}
        </span>
        <span className="font-black font-mono whitespace-nowrap text-xs italic tracking-tight">
          $
          {(item.precio * item.cantidad).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Controladores de Cantidad Dinámicos */}
      <div className="flex items-center gap-4 mt-2 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2.5 border-2 border-border dark:border-border-dark px-2.5 py-1 rounded-neo bg-white dark:bg-bg-dark font-mono shadow-sm">
          {/* Botón: Decrementar cantidad (Usa delta -1) */}
          <button
            type="button"
            onClick={() => updateCantidad(item.id, -1)}
            className="hover:text-primary text-text-primary dark:text-text-inverse p-0.5 disabled:opacity-30 transition-colors"
            disabled={isClosed || item.cantidad <= 1} // Deshabilitado si ya está en el mínimo permitido por tu lógica
            title="Disminuir cantidad"
          >
            <Minus size={10} strokeWidth={3} />
          </button>

          <span className="text-[10px] min-w-[12px] text-center font-black">
            {item.cantidad}
          </span>

          {/* Botón: Incrementar cantidad (Usa delta 1) */}
          <button
            type="button"
            onClick={() => updateCantidad(item.id, 1)}
            className="hover:text-primary text-text-primary dark:text-text-inverse p-0.5 disabled:opacity-30 transition-colors"
            disabled={isClosed}
            title="Aumentar cantidad"
          >
            <Plus size={10} strokeWidth={3} />
          </button>
        </div>

        {/* Botón Detractor: Quitar Ítem */}
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="text-[9px] flex items-center gap-1 hover:text-error dark:hover:text-error/90 font-black uppercase tracking-tighter italic transition-colors select-none"
        >
          <Trash2 size={10} /> Quitar
        </button>
      </div>
    </div>
  );
}
