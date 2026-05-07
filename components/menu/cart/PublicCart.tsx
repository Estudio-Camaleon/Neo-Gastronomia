"use client";

import { useCartStore } from "../store/useCartStore";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { OrderForm } from "./OrderForm";

interface PublicCartProps {
  negocioId: string;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}



export function PublicCart({
  negocioId,
  isDrawer = false,
  onCloseDrawer,
}: PublicCartProps) {
  const { cart, addItem, removeItem, clearCart } = useCartStore(
    (state) => state,
  );
  const [showOrderForm, setShowOrderForm] = useState(false);

  const totalImporte = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleVaciar = () => {
    clearCart();
    toast.success("CARRITO VACIADO", {
      description: "Se eliminaron todos los productos de tu pedido.",
    });
    if (isDrawer && onCloseDrawer) onCloseDrawer();
  };

  const renderCartContent = () => (
    <div className="flex flex-col h-full justify-between flex-1">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 flex-1 select-none animate-in fade-in duration-300">
          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-full border-2 border-dashed border-border dark:border-border-dark mb-4 text-text-muted/60">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <h4 className="font-black uppercase italic text-sm tracking-tight text-text-primary dark:text-text-inverse">
            Tu pedido está vacío
          </h4>
          <p className="text-text-secondary dark:text-text-muted text-xs font-medium max-w-[200px] mt-1 leading-normal">
            Explorá nuestro catálogo y sumá tus productos favoritos.
          </p>
        </div>
      ) : !showOrderForm ? (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div className="divide-y-2 divide-dashed divide-border/60 dark:divide-border-dark/60 overflow-y-auto max-h-[350px] lg:max-h-[500px] pr-1 mt-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="py-4 flex items-center justify-between gap-2 animate-in fade-in duration-200"
              >
                <div className="space-y-0.5 flex-1 pr-2">
                  <p className="font-black uppercase italic text-xs tracking-tight text-text-primary dark:text-text-inverse line-clamp-1">
                    {item.nombre}
                  </p>

                  {/* --- NUEVO: RENDERIZADO DE DETALLES (EXTRAS / VARIANTES) --- */}
                  {item.detalles && (
                    <p className="text-[10px] leading-tight font-medium text-text-secondary dark:text-text-muted line-clamp-2 pb-0.5">
                      {item.detalles}
                    </p>
                  )}
                  {/* -------------------------------------------------------- */}

                  <p className="font-mono text-xs font-black text-text-muted">
                    $
                    {(item.precio * item.cantidad).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 border-2 border-border dark:border-border-dark rounded-xl p-1 select-none shrink-0">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-text-secondary dark:text-text-muted hover:bg-gray-200 dark:hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="font-mono font-black text-xs px-2 min-w-[20px] text-center text-text-primary dark:text-text-inverse">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem({ ...item, cantidad: 1 })}
                    className="p-1.5 rounded-lg text-text-secondary dark:text-text-muted hover:bg-gray-200 dark:hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL Y ACCIONES INFERIORES */}
          <div className="pt-4 border-t-2 border-border dark:border-border-dark space-y-4 mt-4 bg-white dark:bg-bg-darker">
            <div className="flex items-end justify-between font-mono select-none">
              <div>
                <p className="text-[9px] font-black uppercase text-text-muted tracking-widest leading-none">
                  TOTAL ESTIMADO
                </p>
                <p className="font-black text-2xl tracking-tighter text-text-primary dark:text-text-inverse mt-0.5">
                  $
                  {totalImporte.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={handleVaciar}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-error hover:underline tracking-wider py-1 cursor-pointer"
              >
                <Trash2 size={12} /> VACIAR
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowOrderForm(true)}
              className="w-full bg-custom text-white py-4 rounded-xl font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-98 shadow-md shadow-custom/10 cursor-pointer border-t border-white/10"
            >
              COMPLETAR PEDIDO <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-300 flex-1 flex flex-col justify-between h-full">
          <OrderForm
            negocioId={negocioId}
            cart={cart}
            total={totalImporte}
            onBack={() => setShowOrderForm(false)}
            onSuccess={() => {
              clearCart();
              if (isDrawer && onCloseDrawer) onCloseDrawer();
            }}
          />
        </div>
      )}
    </div>
  );

  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end font-sans">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-300"
          onClick={onCloseDrawer}
        />

        <div className="relative w-full max-w-md h-full bg-white dark:bg-bg-darker border-l-4 border-border dark:border-border-dark p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between border-b-2 border-border dark:border-border-dark pb-3 select-none mb-2">
            <h3 className="font-black uppercase italic tracking-tight text-sm text-text-primary dark:text-text-inverse flex items-center gap-2">
              Tu Pedido 🛒
              {totalItems > 0 && (
                <span className="bg-custom/10 text-custom border border-custom/20 font-mono text-[9px] font-black px-2.5 py-0.5 rounded-full">
                  {totalItems} ítems
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-1 rounded-lg text-text-secondary dark:text-text-muted hover:bg-gray-100 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer border border-transparent hover:border-border/60"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          {renderCartContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col font-sans">
      {renderCartContent()}
    </div>
  );
}
