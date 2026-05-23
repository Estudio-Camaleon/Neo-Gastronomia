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
    toast.success("Carrito vaciado");
    if (isDrawer && onCloseDrawer) onCloseDrawer();
  };

  const renderCartContent = () => (
    <div className="flex flex-col h-full justify-between flex-1">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 flex-1 select-none">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-full mb-4 text-gray-400 dark:text-zinc-500">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-zinc-200 tracking-tight">
            Tu carrito está vacío
          </h4>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-2 max-w-[220px]">
            Explora nuestro menú y agrega productos para comenzar.
          </p>
        </div>
      ) : !showOrderForm ? (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div className="divide-y divide-gray-100 dark:divide-zinc-800 overflow-y-auto max-h-[350px] lg:max-h-[500px] pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div
                key={item.id}
                className="py-4 flex items-center justify-between gap-3 animate-in fade-in duration-200"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                    {item.nombre}
                  </p>
                  {item.detalles && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                      Nota: {item.detalles}
                    </p>
                  )}
                  <p className="text-sm font-medium text-[var(--admin-accent,#34a35f)]">
                    {config.moneda_simbolo}
                    {(item.precio * item.cantidad).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-0.5 shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center text-gray-900 dark:text-zinc-100">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem({ ...item, cantidad: 1 })}
                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-auto space-y-4">
            {!esPedidoValido && (
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>
                  Agrega{" "}
                  <strong>
                    {config.moneda_simbolo}
                    {faltaParaMinimo.toFixed(2)}
                  </strong>{" "}
                  más para alcanzar el pedido mínimo.
                </p>
              </div>
            )}

            <div className="flex items-end justify-between bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/60">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  Subtotal
                </span>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                  {config.moneda_simbolo}
                  {subtotal.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleVaciar}
                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-100/50 dark:border-red-900/40"
              >
                <Trash2 size={14} /> Vaciar
              </button>
            </div>

            <button
              type="button"
              disabled={!esPedidoValido}
              onClick={() => setShowOrderForm(true)}
              className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                esPedidoValido
                  ? "bg-[var(--admin-accent,#34a35f)] hover:bg-[var(--admin-accent,#34a35f)]/90 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
              }`}
            >
              Continuar con el pago <ArrowRight size={16} />
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
          className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onCloseDrawer}
        />
        <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              Tu Pedido
              {totalItems > 0 && (
                <span className="bg-[var(--admin-accent,#34a35f)]/10 text-[var(--admin-accent,#34a35f)] dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-2 text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {renderCartContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
      {renderCartContent()}
    </div>
  );
}
