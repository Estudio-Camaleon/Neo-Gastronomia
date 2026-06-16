"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCartStore } from "./useCartStore";
import { X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { EmptyCart } from "@/features/public-menu/cart/EmptyCart";
import { CartReceipt } from "@/features/public-menu/cart/CartReceipt";
import type { PromoRow } from "@/features/public-menu/types";

const OrderForm = dynamic(() => import("./OrderForm").then((m) => ({ default: m.OrderForm })), {
  ssr: false,
});

interface PublicCartProps {
  negocioId: string;
  negocioNombre?: string;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
  config?: {
    moneda_simbolo?: string;
    pedido_minimo?: number;
    costo_envio?: number;
  };
  promos?: PromoRow[];
}

export function PublicCart({
  negocioId,
  negocioNombre = "Pedido",
  isDrawer = false,
  onCloseDrawer,
  config = { moneda_simbolo: "$", pedido_minimo: 0, costo_envio: 0 },
  promos = [],
}: PublicCartProps) {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleVaciar = () => {
    clearCart();
    toast.success("Carrito vaciado");
    if (isDrawer && onCloseDrawer) onCloseDrawer();
  };

  useEffect(() => {
    if (!isDrawer) return;
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
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [isDrawer]);

  const renderCartContent = () => (
    <div className="flex h-full flex-col">
      {cart.length === 0 ? (
        <EmptyCart
          showOrderForm={showOrderForm}
          lastOrderId={lastOrderId}
          onNewOrder={() => {
            setShowOrderForm(false);
            setLastOrderId(null);
          }}
        />
      ) : !showOrderForm ? (
        <CartReceipt
          cart={cart}
          subtotal={subtotal}
          config={config}
          onVaciar={handleVaciar}
          onConfirmar={() => setShowOrderForm(true)}
        />
      ) : (
        <motion.div
          key="order-form"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="flex-1 flex flex-col h-full"
        >
          <OrderForm
            negocioId={negocioId}
            cart={cart}
            total={subtotal}
            config={config}
            promos={promos}
            onBack={() => setShowOrderForm(false)}
            onSuccess={(orderId) => {
              setLastOrderId(orderId);
              clearCart();
              if (isDrawer && onCloseDrawer) onCloseDrawer();
            }}
          />
        </motion.div>
      )}
    </div>
  );

  /* ── Shared container class ───────────────────── */
  const receiptClasses =
    "relative flex h-full w-full flex-col bg-[#fcfaf5] shadow-xl";

  /* ── Drawer (mobile) ──────────────────────────── */
  if (isDrawer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex justify-end"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={onCloseDrawer}
        />
        <motion.div
          ref={panelRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
          className={`${receiptClasses} max-w-[390px] sm:max-w-[400px]`}
          style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dashed border-[#ccc] px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-[#888]" />
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#444]">
                {negocioNombre}
              </h3>
              {totalItems > 0 && (
                <span className="font-mono text-[10px] text-[#999]">
                  ({totalItems})
                </span>
              )}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onCloseDrawer}
              aria-label="Cerrar carrito"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ddd] text-[#888] transition-colors hover:bg-[#f0ece6]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {renderCartContent()}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ── Desktop sidebar ──────────────────────────── */
  return (
    <div className={`${receiptClasses} rounded-2xl border border-[#ddd] overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dashed border-[#ccc] px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={14} className="text-[#888]" />
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#444]">
            {negocioNombre}
          </h3>
          {totalItems > 0 && (
            <span className="font-mono text-[10px] text-[#999]">
              ({totalItems})
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(90vh-80px)]">
        {renderCartContent()}
      </div>
    </div>
  );
}
