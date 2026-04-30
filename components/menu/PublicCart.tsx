"use client";

import { useCartStore } from "./store/useCartStore";
import { Trash2, ShoppingBag } from "lucide-react";

export function PublicCart() {
  const { items, total, updateQuantity, removeItem } = useCartStore();

  return (
    <aside className="w-[380px] relative group">
      {/* Efecto de borde dentado superior (opcional) */}
      <div
        className="absolute top-0 left-0 w-full h-2 bg-[var(--bg-public)] z-10"
        style={{
          maskImage: "radial-gradient(circle, transparent 4px, black 4px)",
          maskSize: "12px 12px",
          maskPosition: "top",
        }}
      />

      <div
        className="bg-[#fdfdfd] shadow-2xl p-8 pt-10 min-h-[400px] flex flex-col border-x border-gray-100 text-bg-dark"
        style={{ fontFamily: '"Receiptional Receipt", monospace' }}
      >
        {/* Encabezado del Ticket */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="border-2 border-black rounded-full p-2">
              <ShoppingBag size={24} className="text-black" />
            </div>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tighter">
            Resumen de Pedido
          </h2>
          <p className="text-[10px] opacity-70">
            ******************************************
          </p>
          <p className="text-[10px] uppercase">
            {new Date().toLocaleDateString()} -{" "}
            {new Date().toLocaleTimeString()}
          </p>
          <p className="text-[10px] opacity-70">
            ******************************************
          </p>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 space-y-4 mb-8 overflow-y-auto pr-2 scrollbar-hide">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs uppercase opacity-40 italic">
                Su carrito está vacío
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="text-md animate-in fade-in duration-300"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="uppercase flex-1 leading-tight">
                    {item.cantidad} {item.nombre}
                  </span>
                  <span className="font-bold whitespace-nowrap">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>

                {/* Controles de edición estilo Ticket */}
                <div className="flex items-center gap-4 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 border border-black/20 px-2 py-0.5 rounded">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="hover:font-black"
                    >
                      -
                    </button>
                    <span className="text-[9px]">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="hover:font-black"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[9px] flex items-center gap-1 hover:text-red-600"
                  >
                    <Trash2 size={10} /> ELIMINAR
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Ticket */}
        {items.length > 0 && (
          <div className="mt-auto">
            <p className="text-[10px] text-center opacity-70">
              ------------------------------------------
            </p>
            <div className="flex justify-between items-end my-4">
              <span className="text-sm font-bold uppercase">Total a pagar</span>
              <span className="text-3xl font-bold tracking-tighter">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-center opacity-70 mb-6">
              ------------------------------------------
            </p>

            <button className="w-full bg-black text-white py-4 rounded-none font-bold text-xs uppercase tracking-[0.2em] hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              CONFIRMAR PEDIDO [ENTER]
            </button>
            <p className="text-[8px] text-center mt-4 opacity-50 uppercase tracking-widest">
              Gracias por elegirnos
            </p>
          </div>
        )}
      </div>

      {/* Efecto de borde dentado inferior */}
      <div
        className="w-full h-4 bg-transparent"
        style={{
          backgroundImage:
            "linear-gradient(-45deg, #fdfdfd 8px, transparent 0), linear-gradient(45deg, #fdfdfd 8px, transparent 0)",
          backgroundSize: "16px 16px",
          backgroundPosition: "bottom",
        }}
      />
    </aside>
  );
}
