"use client";

import Image from "next/image";
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
import { useEffect, useRef, useCallback, useState } from "react";
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
  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const faltaParaMinimo = (config.pedido_minimo || 0) - subtotal;
  const esPedidoValido = subtotal >= (config.pedido_minimo || 0);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleVaciar = () => {
    clearCart();
    toast.success("Carrito vaciado");
    if (isDrawer && onCloseDrawer) onCloseDrawer();
  };

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawer && onCloseDrawer) {
        onCloseDrawer();
      }
    },
    [isDrawer, onCloseDrawer],
  );

  useEffect(() => {
    if (!isDrawer) return;
    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [isDrawer, handleEscape]);

  const renderCartContent = () => (
    <div className="flex h-full flex-col justify-between ">
      {cart.length === 0 ? (
        <div className="flex flex-1 select-none flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 rounded-full bg-[var(--color-custom-50)] p-4 text-[var(--color-custom-900)]" aria-hidden="true">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <h4 className="text-lg font-extrabold uppercase tracking-tight text-[var(--color-custom-deep)]">
            Tu carrito está vacío
          </h4>
          <p className="mt-2 max-w-[220px] text-sm text-[var(--color-custom-text-muted)]">
            {showOrderForm
              ? "Tu pedido fue procesado con éxito."
              : "Explora nuestro menú y agrega productos para comenzar."}
          </p>
          {showOrderForm && (
            <button
              type="button"
              onClick={() => setShowOrderForm(false)}
              className="mt-4 rounded-full bg-[var(--color-custom)] px-6 py-2 text-sm font-bold text-white"
            >
              Seguir agregando productos
            </button>
          )}
        </div>
      ) : !showOrderForm ? (
        <div className="flex h-full flex-col justify-between">
          <div className="max-h-[430px] overflow-y-auto pr-2 public-scrollbar">
            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-3 grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-[18px] border border-[var(--color-custom-border)] bg-[var(--color-custom-surface)] p-3 animate-in fade-in duration-200 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[var(--color-custom-surface-strong)] border border-[var(--color-custom-border)]">
                  {item.imagen_url ? (
                    <Image
                      src={item.imagen_url}
                      alt={item.nombre}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag
                      size={18}
                      className="text-[var(--color-custom-text-muted)]"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="whitespace-normal break-words text-[11px] font-black uppercase italic leading-tight tracking-[0.14em] text-[var(--color-custom)] sm:text-[12px]">
                    {item.nombre}
                  </p>
                  {item.detalles && (
                    <p className="whitespace-normal break-words text-[11px] leading-snug text-[var(--color-custom-text-muted)]">
                      Nota: {item.detalles}
                    </p>
                  )}
                  <p className="text-[12px] font-black text-[var(--color-custom)] sm:text-[13px]">
                    {config.moneda_simbolo}
                    {formatMoney(item.precio * item.cantidad)}
                  </p>
                </div>

                <div className="col-span-2 flex justify-end sm:col-span-1 sm:justify-self-end">
                  <div className="flex shrink-0 items-center overflow-hidden rounded-full bg-[var(--color-custom-500)] text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                    <button
                      type="button"
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                      onClick={() => removeItem(item.id)}
                      className="flex h-10 w-10 items-center justify-center text-white/95 transition-opacity hover:opacity-80 sm:h-7 sm:w-7"
                    >
                      <Minus size={16} className="sm:size-[14px]" />
                    </button>
                    <span className="inline-flex min-w-9 items-center justify-center px-2 text-center text-[11px] font-black leading-10 sm:min-w-6 sm:leading-7 sm:px-1">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                      onClick={() => addItem({ ...item, cantidad: 1 })}
                      className="flex h-10 w-10 items-center justify-center text-white/95 transition-opacity hover:opacity-80 sm:h-7 sm:w-7"
                    >
                      <Plus size={16} className="sm:size-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-4 border-t border-[var(--color-custom-border)] pt-4">
            {!esPedidoValido && (
              <div className="flex items-start gap-3 rounded-[16px] border border-[var(--color-custom-border)] bg-[var(--color-custom-50)] p-3 text-sm text-[var(--color-custom-deep)]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Agrega{" "}
                  <strong>
                    {config.moneda_simbolo}
                    {formatMoney(faltaParaMinimo)}
                  </strong>{" "}
                  más para alcanzar el pedido mínimo.
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-[18px] border border-[var(--color-custom-border)] bg-[var(--color-custom-surface-strong)] p-4">
              <div className="flex items-center justify-between text-sm text-[var(--color-custom-text-muted)]">
                <span className="font-semibold italic">Subtotal</span>
                <span className="font-black text-[var(--color-custom-deep)]">
                  {config.moneda_simbolo}
                  {formatMoney(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--color-custom-text-muted)]">
                <span className="font-semibold italic">Descuento</span>
                <span className="font-black text-[var(--color-custom-deep)]">
                  -{config.moneda_simbolo}0,00
                </span>
              </div>
              <div>
                <span className="block text-[12px] font-black uppercase italic tracking-[0.18em] text-[var(--color-custom)]">
                  Total
                </span>
                <p className="mt-1 text-3xl font-black italic tracking-tight text-[var(--color-custom)]">
                  {config.moneda_simbolo}
                  {formatMoney(subtotal)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                aria-label="Vaciar carrito"
                onClick={handleVaciar}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-custom-border)] bg-[var(--color-custom-surface-strong)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-50)] sm:min-h-0"
              >
                <Trash2 size={14} aria-hidden="true" /> Vaciar
              </button>

              <button
                type="button"
                aria-label="Finalizar pedido"
                disabled={!esPedidoValido}
                onClick={() => setShowOrderForm(true)}
                className={`inline-flex min-h-11 flex-[1.3] items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all sm:min-h-0 ${
                  esPedidoValido
                    ? "bg-[var(--color-custom)] text-white shadow-[0_12px_22px_rgba(31,107,61,0.2)]"
                    : "cursor-not-allowed bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)]"
                }`}
              >
                Finalizar pedido <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
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
              setShowOrderForm(false);
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
          className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--color-custom-900)_55%,transparent)] backdrop-blur-sm transition-opacity"
          onClick={onCloseDrawer}
          aria-hidden="true"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
          className="relative flex h-full w-full max-w-[390px] flex-col bg-[var(--color-custom-surface-strong)] p-5 shadow-2xl animate-in slide-in-from-right duration-300 sm:max-w-md"
        >
          <div className="mb-4 flex items-center justify-between border-b border-[var(--color-custom-border)] pb-4">
            <h3 className="flex items-center gap-2 text-lg font-black italic uppercase tracking-tight text-[var(--color-custom)]">
              Tu pedido
              {totalItems > 0 && (
                <span className="rounded-full bg-[var(--color-custom-50)] px-2.5 py-0.5 text-xs font-black text-[var(--color-custom-900)]">
                  ({totalItems})
                </span>
              )}
            </h3>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onCloseDrawer}
              aria-label="Cerrar carrito"
              className="rounded-full p-2 text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-50)] hover:text-[var(--color-custom-900)]"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {renderCartContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-[28px] border border-[var(--color-custom-border)] bg-[var(--color-custom-surface-strong)] p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
      {renderCartContent()}
    </div>
  );
}
