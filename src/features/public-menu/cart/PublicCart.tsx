"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCartStore } from "./useCartStore";
import { X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState, useMemo } from "react";
import { EmptyCart } from "@/features/public-menu/cart/EmptyCart";
import { CartReceipt } from "@/features/public-menu/cart/CartReceipt";
import { calculateDiscounts } from "@/features/public-menu/utils";
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
  productCategoryMap?: Record<string, string>;
}

export function PublicCart({
  negocioId,
  negocioNombre = "Pedido",
  isDrawer = false,
  onCloseDrawer,
  config = { moneda_simbolo: "$", pedido_minimo: 0, costo_envio: 0 },
  promos = [],
  productCategoryMap,
}: PublicCartProps) {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItemEntry = useCartStore((state) => state.removeItemEntry);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoRow | null>(null);
  const [codeError, setCodeError] = useState("");

  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const codePromos = useMemo(
    () => promos.filter((p) => p.tipo_descuento !== "combo" && p.codigo),
    [promos],
  );

  const codeDiscountAmount = useMemo(
    () => (appliedPromo ? calculateDiscounts([appliedPromo], cart, productCategoryMap ?? {}).total : 0),
    [appliedPromo, cart, productCategoryMap],
  );

  const handleApplyCode = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) {
      setCodeError("Ingresá un código");
      return;
    }
    const match = codePromos.find((p) => p.codigo?.toLowerCase() === trimmed);
    if (match) {
      setAppliedPromo(match);
      setCodeError("");
      toast.success(`¡Cupón aplicado!`);
    } else {
      setCodeError("Código inválido");
      setAppliedPromo(null);
    }
  };

  const handleRemoveCode = () => {
    setAppliedPromo(null);
    setCodeError("");
  };

  const handleVaciar = () => {
    clearCart();
    setAppliedPromo(null);
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
    <div className="flex flex-1 flex-col min-h-0">
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
          negocioNombre={negocioNombre}
          config={config}
          promos={promos}
          productCategoryMap={productCategoryMap}
          onVaciar={handleVaciar}
          onConfirmar={() => setShowOrderForm(true)}
          onUpdateQuantity={updateItemQuantity}
          onRemoveEntry={removeItemEntry}
          appliedPromo={appliedPromo}
          codePromos={codePromos}
          codeError={codeError}
          onApplyCode={handleApplyCode}
          onRemoveCode={handleRemoveCode}
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
            productCategoryMap={productCategoryMap}
            onBack={() => setShowOrderForm(false)}
            onSuccess={(orderId) => {
              setLastOrderId(orderId);
              clearCart();
              if (isDrawer && onCloseDrawer) onCloseDrawer();
            }}
            appliedPromo={appliedPromo}
            codePromos={codePromos}
            codeError={codeError}
            onApplyCode={handleApplyCode}
            onRemoveCode={handleRemoveCode}
          />
        </motion.div>
      )}
    </div>
  );

  /* ── Shared container class ───────────────────── */
  const receiptClasses =
    "relative flex h-full w-full flex-col bg-[var(--color-custom-surface)] shadow-xl";

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
          <div className="flex items-center justify-between border-b border-[var(--color-custom-200)] px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-[var(--color-custom-text-muted)]" />
              <h3 className="text-sm font-bold tracking-tight text-[var(--color-custom-900)]">
                {negocioNombre}
              </h3>
              {totalItems > 0 && (
                <span className="text-xs text-[var(--color-custom-text-muted)]">
                  ({totalItems})
                </span>
              )}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onCloseDrawer}
              aria-label="Cerrar carrito"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-custom-200)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Content — el scroll interno está en la lista de ítems */}
          <div className="flex-1 flex flex-col min-h-0 px-5 py-4">
            {renderCartContent()}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ── Desktop sidebar ──────────────────────────── */
  return (
    <div className={`${receiptClasses} h-full flex flex-col rounded-2xl border border-[var(--color-custom-200)] overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-custom-200)] px-5 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag size={14} className="text-[var(--color-custom-text-muted)]" />
          <h3 className="text-sm font-bold tracking-tight text-[var(--color-custom-900)]">
            {negocioNombre}
          </h3>
          {totalItems > 0 && (
            <span className="text-xs text-[var(--color-custom-text-muted)]">
              ({totalItems})
            </span>
          )}
        </div>
      </div>

      {/* Content — el scroll interno está en la lista de ítems */}
      <div className="flex-1 flex flex-col min-h-0 px-5 py-4">
        {renderCartContent()}
      </div>
    </div>
  );
}
