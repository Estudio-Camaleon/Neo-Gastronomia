"use client";

import { useCartStore } from "./useCartStore";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { OrderForm } from "./OrderForm";

interface PublicCartProps {
  negocioId: string;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
  config?: {
    moneda_simbolo?: string;
    pedido_minimo?: number;
    costo_envio?: number;
  };
}

export function PublicCart({
  negocioId,
  isDrawer = false,
  onCloseDrawer,
  config = { moneda_simbolo: "$", pedido_minimo: 0, costo_envio: 0 },
}: PublicCartProps) {
  const { cart, addItem, removeItem, clearCart } = useCartStore(
    (state) => state,
  );
  const [showOrderForm, setShowOrderForm] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const faltaParaMinimo = (config.pedido_minimo || 0) - subtotal;
  const esPedidoValido = subtotal >= (config.pedido_minimo || 0);

  const handleVaciar = () => {
    clearCart();
    toast.success("BOLSA DE COMPRA REINICIADA");
    if (isDrawer && onCloseDrawer) onCloseDrawer();
  };

  const renderCartContent = () => (
    <div className="flex flex-col h-full justify-between flex-1 text-black">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 flex-1 select-none">
          <div className="border-4 border-dashed border-black p-4 mb-3 text-gray-300">
            <ShoppingBag size={32} />
          </div>
          <h4 className="font-black uppercase italic text-sm tracking-tight">
            Tu bolsa está vacía
          </h4>
          <p className="text-gray-400 text-xs font-medium max-w-[220px] mt-1 leading-normal">
            Sumá productos del catálogo para configurar tu comanda.
          </p>
        </div>
      ) : !showOrderForm ? (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div className="divide-y-2 divide-dashed divide-black/10 overflow-y-auto max-h-[350px] lg:max-h-[500px] pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-2 animate-in fade-in duration-100"
              >
                <div className="space-y-0.5 flex-1 pr-1">
                  <p className="font-black uppercase italic text-xs tracking-tight line-clamp-1">
                    {item.nombre}
                  </p>
                  {item.detalles && (
                    <p className="text-[10px] leading-tight font-medium text-gray-500 line-clamp-1">
                      ↳ {item.detalles}
                    </p>
                  )}
                  <p className="font-mono text-xs font-black text-gray-400">
                    {config.moneda_simbolo}
                    {(item.precio * item.cantidad).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center bg-white border-2 border-black p-0.5 select-none shrink-0">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 hover:bg-black hover:text-white transition-colors"
                  >
                    <Minus size={10} strokeWidth={3} />
                  </button>
                  <span className="font-mono font-black text-xs px-2 text-center min-w-[20px]">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem({ ...item, cantidad: 1 })}
                    className="p-1 hover:bg-black hover:text-white transition-colors"
                  >
                    <Plus size={10} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-4 border-black space-y-3 mt-auto bg-white">
            {!esPedidoValido && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-black text-red-600 font-mono text-[10px] font-black uppercase tracking-wide animate-pulse">
                <AlertCircle size={14} />
                <span>
                  Te restan {config.moneda_simbolo}
                  {faltaParaMinimo.toFixed(2)} para alcanzar el mínimo.
                </span>
              </div>
            )}

            <div className="flex items-end justify-between select-none">
              <div>
                <span className="text-[9px] font-mono font-black text-gray-400 block tracking-widest">
                  SUBTOTAL COMPRA
                </span>
                <p className="font-mono font-black text-2xl tracking-tighter mt-0.5">
                  {config.moneda_simbolo}
                  {subtotal.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleVaciar}
                className="flex items-center gap-1 text-[10px] font-black uppercase text-red-600 border border-black p-1.5 hover:bg-red-50"
              >
                <Trash2 size={11} /> Reiniciar bolsa
              </button>
            </div>

            <button
              type="button"
              disabled={!esPedidoValido}
              onClick={() => setShowOrderForm(true)}
              className={`w-full py-4 border-4 border-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${esPedidoValido ? "bg-[#A3FF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none" : "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"}`}
            >
              INGRESAR DATOS DE ENTREGA <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full justify-between">
          <OrderForm
            negocioId={negocioId}
            cart={cart}
            total={subtotal}
            config={config}
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
      <div className="fixed inset-0 z-[99999] flex justify-end font-sans">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onCloseDrawer}
        />
        <div className="relative w-full max-w-md h-full bg-white border-l-4 border-black p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-2 text-black">
            <h3 className="font-black uppercase italic tracking-tight text-md flex items-center gap-2">
              Mi Comanda 🛒
              {totalItems > 0 && (
                <span className="bg-black text-[#A3FF00] font-mono text-[9px] font-black px-2 py-0.5">
                  {totalItems} Ítems
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-1 border-2 border-transparent hover:border-black transition-all"
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
    <div className="w-full h-full flex flex-col bg-transparent">
      {renderCartContent()}
    </div>
  );
}
