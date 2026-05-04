"use client";

import { Plus, Minus, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext"; // Cambiamos a nuestro nuevo Context

interface MenuCardProps {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  isClosed?: boolean;
}

export function MenuCard({
  id,
  nombre,
  descripcion,
  precio,
  imagen_url,
  isClosed,
}: MenuCardProps) {
  // Usamos el nuevo Context centralizado
  const { cart, addToCart, updateQuantity } = useCart();

  // Sincronizamos con el estado del carrito
  const itemEnCarrito = cart.find((i) => i.id === id);

  return (
    <div
      className={`flex gap-5 p-4 bg-white dark:bg-bg-darker rounded-super border-2 border-border dark:border-border-dark transition-all duration-300 group ${
        isClosed
          ? "opacity-60 grayscale-[0.5]"
          : "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
      }`}
    >
      {/* Imagen con Aspecto Square */}
      <div className="relative w-28 h-28 rounded-neo overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-border/50">
        <img
          src={imagen_url || "/placeholder-food.png"}
          alt={nombre}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
            isClosed ? "brightness-75" : ""
          }`}
        />
        {isClosed && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <Clock className="text-white w-10 h-10 opacity-80" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="font-black text-[var(--text-public)] text-lg uppercase italic tracking-tighter leading-none">
            {nombre}
          </h3>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-tight mt-2 line-clamp-2 leading-tight opacity-80">
            {descripcion}
          </p>
        </div>

        <div className="flex justify-between items-end mt-4">
          <span className="font-black text-2xl text-[var(--text-public)] tracking-tighter italic">
            ${precio.toLocaleString("es-AR")}
          </span>

          <div className="flex items-center">
            {isClosed ? (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full border border-border">
                Cerrado
              </span>
            ) : itemEnCarrito ? (
              /* Selector de Cantidad Estilo NEO */
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-full p-1 border-2 border-primary/20 animate-in zoom-in duration-300">
                <button
                  onClick={() => updateQuantity(id, -1)}
                  className="w-8 h-8 flex items-center justify-center font-black text-text-muted hover:text-error transition-colors"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span className="font-black text-sm px-2 min-w-[24px] text-center text-primary italic">
                  {itemEnCarrito.cantidad}
                </span>
                <button
                  onClick={() => updateQuantity(id, 1)}
                  className="w-8 h-8 flex items-center justify-center font-black text-primary hover:scale-110 transition-transform"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            ) : (
              /* Botón Agregar Estilo NEO */
              <button
                onClick={() => addToCart({ id, nombre, precio, cantidad: 1 })}
                className="bg-primary text-white w-12 h-12 rounded-neo flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 hover:scale-105 transition-all border-b-4 border-primary-active"
              >
                <Plus size={22} strokeWidth={4} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
