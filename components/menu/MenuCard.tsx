"use client";

import { Plus, Minus } from "lucide-react";
import { useCartStore } from "./store/useCartStore";

export function MenuCard({ id, nombre, descripcion, precio, imagen_url }: any) {
  const { items, addItem, updateQuantity } = useCartStore();

  // Buscamos si este producto ya está en el carrito
  const itemEnCarrito = items.find((i) => i.id === id);

  return (
    <div className="flex gap-4 p-3 bg-white rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
        <img
          src={imagen_url || "/placeholder-food.png"}
          alt={nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="font-bold text-[var(--text-public)] text-sm leading-tight">
            {nombre}
          </h3>
          <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {descripcion}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="font-black text-lg text-[var(--text-public)] tracking-tight">
            ${precio}
          </span>

          <div className="flex items-center gap-1">
            {itemEnCarrito ? (
              <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-3 border border-black/5 animate-in fade-in zoom-in duration-300">
                <button
                  onClick={() => updateQuantity(id, -1)}
                  className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:text-black transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-black text-xs min-w-[12px] text-center">
                  {itemEnCarrito.cantidad}
                </span>
                <button
                  onClick={() => updateQuantity(id, 1)}
                  className="w-7 h-7 flex items-center justify-center font-bold text-[var(--brand-color)] hover:brightness-75 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem({ id, nombre, precio })}
                className="bg-[var(--brand-color)] text-white w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--brand-color)]/20 active:scale-90 transition-all"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
