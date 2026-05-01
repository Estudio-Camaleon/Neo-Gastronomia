"use client";

import { Plus, Minus, Clock } from "lucide-react"; // Añadimos Clock para el feedback
import { useCartStore } from "./store/useCartStore";

interface MenuCardProps {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  isClosed?: boolean; // Nueva prop para manejar el estado del local
}

export function MenuCard({
  id,
  nombre,
  descripcion,
  precio,
  imagen_url,
  isClosed,
}: MenuCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();

  // Buscamos si este producto ya está en el carrito
  const itemEnCarrito = items.find((i) => i.id === id);

  return (
    <div
      className={`flex gap-4 p-3 bg-white rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-all group overflow-hidden ${isClosed ? "opacity-75" : ""}`}
    >
      {/* Imagen con filtro si está cerrado */}
      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
        <img
          src={imagen_url || "/placeholder-food.png"}
          alt={nombre}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isClosed ? "grayscale contrast-75" : ""}`}
        />
        {isClosed && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Clock className="text-white w-8 h-8 opacity-60" />
          </div>
        )}
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
            ${precio.toLocaleString("es-AR")}
          </span>

          <div className="flex items-center gap-1">
            {isClosed ? (
              // Badge de "Cerrado" en lugar de botones
              <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 border border-gray-200 px-3 py-2 rounded-xl bg-gray-50">
                No disponible
              </span>
            ) : itemEnCarrito ? (
              // Selector de cantidad (Abierto)
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
              // Botón de agregar (Abierto)
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
