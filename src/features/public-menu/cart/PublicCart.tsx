"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "./useCartStore";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  X,
  AlertCircle,
  CheckCircle2,
  Scissors,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { OrderForm } from "./OrderForm";

const receiptContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const receiptLineVariants = {
  hidden: { opacity: 0, y: -8, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 200, damping: 30 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.12 } },
};

const receiptEmptyVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};

function DashedDivider() {
  return (
    <div className="relative my-2 flex items-center justify-center overflow-hidden">
      <div className="h-px w-full bg-[length:8px_1px] bg-[repeating-linear-gradient(90deg,#aaa_0px,#aaa_4px,transparent_4px,transparent_8px)] opacity-60" />
      <Scissors
        size={10}
        className="absolute text-[#aaa] rotate-90 opacity-40"
      />
    </div>
  );
}

function ReceiptHeader({ receiptId }: { receiptId: string }) {
  return (
    <motion.div
      variants={receiptLineVariants}
      className="text-center space-y-1 pb-2"
    >
      <div className="flex justify-center gap-1 text-[11px] font-mono tracking-[0.25em] text-[#555] uppercase opacity-60">
        <Printer size={11} />
        TICKET
      </div>
      <p className="font-mono text-[11px] text-[#555]">{receiptId}</p>
    </motion.div>
  );
}

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
}

export function PublicCart({
  negocioId,
  negocioNombre = "TICKET",
  isDrawer = false,
  onCloseDrawer,
  config = { moneda_simbolo: "$", pedido_minimo: 0, costo_envio: 0 },
}: PublicCartProps) {
  const cart = useCartStore((state) => state.cart);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

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
  const simbolo = config.moneda_simbolo || "$";

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

  const receiptId = useMemo(
    () => `#${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    [],
  );

  const renderCartContent = () => (
    <div className="flex h-full flex-col justify-between font-mono text-[14px] leading-relaxed text-[#111]">
      {cart.length === 0 ? (
        <motion.div
          key="empty"
          variants={receiptEmptyVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 15,
              delay: 0.1,
            }}
            className="mb-4 rounded-lg border border-dashed border-[#aaa] p-4 text-[#555]"
            aria-hidden="true"
          >
            {showOrderForm ? (
              <CheckCircle2 size={36} strokeWidth={1.5} />
            ) : (
              <ShoppingBag size={36} strokeWidth={1.5} />
            )}
          </motion.div>
          <p className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#555]">
            {showOrderForm ? "PROCESADO" : "VACÍO"}
          </p>
          <p className="mt-2 max-w-[200px] text-[12px] font-mono text-[#555]">
            {showOrderForm
              ? "Gracias por tu compra"
              : "Agregá productos para empezar"}
          </p>
          {showOrderForm && (
            <motion.button
              type="button"
              onClick={() => setShowOrderForm(false)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 border border-dashed border-[#aaa] px-5 py-2 text-[11px] font-mono uppercase tracking-[0.15em] text-[#555] hover:bg-[#eee] transition-colors"
            >
              + Nuevo pedido
            </motion.button>
          )}
        </motion.div>
      ) : !showOrderForm ? (
        <motion.div
          variants={receiptContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex h-full flex-col justify-between"
        >
          <div>
            <ReceiptHeader receiptId={receiptId} />
            <DashedDivider />

            <div className="max-h-[340px] overflow-y-auto pr-1 receipt-scrollbar">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={receiptLineVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mb-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-[#555] tabular-nums">
                            {String(item.cantidad).padStart(2, "0")}x
                          </span>
                          <span className="truncate text-[13px] font-semibold uppercase text-[#111]">
                            {item.nombre}
                          </span>
                        </div>
                        {item.extras && item.extras.length > 0 && (
                          <div className="ml-[22px] mt-0.5 space-y-0.5">
                            {item.extras.map((e, ei) => (
                              <p key={ei} className="text-[10px] text-[#777]">
                                + {e.item_nombre}
                                {e.item_precio > 0 &&
                                  ` (${simbolo}${formatMoney(e.item_precio)})`}
                              </p>
                            ))}
                          </div>
                        )}
                        <div className="ml-[22px] mt-0.5 flex items-center gap-2 text-[11px] text-[#555]">
                          <span>
                            {simbolo}
                            {formatMoney(item.precio)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          aria-label={`Disminuir ${item.nombre}`}
                          onClick={() => removeItem(item.id)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#bbb] text-[#555] transition-colors hover:bg-[#eee] disabled:opacity-30"
                          disabled={item.cantidad <= 1}
                        >
                          <Minus size={10} />
                        </button>
                        <motion.span
                          key={item.cantidad}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="inline-flex w-6 items-center justify-center text-[12px] font-bold tabular-nums text-[#111]"
                        >
                          {item.cantidad}
                        </motion.span>
                        <button
                          type="button"
                          aria-label={`Aumentar ${item.nombre}`}
                          onClick={() => addItem({ ...item, cantidad: 1 })}
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#bbb] text-[#555] transition-colors hover:bg-[#eee]"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    <div className="ml-[22px] mt-0.5 flex justify-between text-[13px] font-bold tabular-nums text-[#111]">
                      <span />
                      <span>
                        {simbolo}
                        {formatMoney(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <DashedDivider />

            <motion.div
              variants={receiptLineVariants}
              className="space-y-1.5 pt-1"
            >
              {!esPedidoValido && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 border border-dashed border-[#aaa]/50 bg-[#eee]/50 px-2 py-1.5 text-[11px] text-[#222]"
                >
                  <AlertCircle
                    size={12}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Mínimo:{" "}
                    <strong>
                      {simbolo}
                      {formatMoney(config.pedido_minimo || 0)}
                    </strong>
                    &nbsp;(falta {simbolo}
                    {formatMoney(faltaParaMinimo)})
                  </span>
                </motion.div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[12px] text-[#555]">
                  <span>SUBTOTAL</span>
                  <span className="tabular-nums font-semibold text-[#111]">
                    {simbolo}
                    {formatMoney(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-[#555]">
                  <span>DESCUENTO</span>
                  <span className="tabular-nums font-semibold text-[#111]">
                    -{simbolo}0,00
                  </span>
                </div>
              </div>

              <DashedDivider />

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[14px] font-bold uppercase tracking-[0.1em] text-[#111]">
                  TOTAL
                </span>
                <motion.span
                  key={subtotal}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-black tabular-nums tracking-tight text-[#111]"
                >
                  {simbolo}
                  {formatMoney(subtotal)}
                </motion.span>
              </div>
            </motion.div>

            <motion.div
              variants={receiptLineVariants}
              className="mt-4 flex gap-2"
            >
              <motion.button
                type="button"
                aria-label="Vaciar carrito"
                onClick={handleVaciar}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 border border-[#bbb] px-2 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] text-[#555] transition-colors hover:bg-[#eee]"
              >
                <Trash2
                  size={12}
                  className="mx-auto mb-0.5"
                  aria-hidden="true"
                />
                VACIAR
              </motion.button>
              <motion.button
                type="button"
                aria-label="Finalizar pedido"
                disabled={!esPedidoValido}
                onClick={() => setShowOrderForm(true)}
                whileHover={esPedidoValido ? { scale: 1.02 } : {}}
                whileTap={esPedidoValido ? { scale: 0.98 } : {}}
                className={`flex-[2] px-2 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] transition-colors ${
                  esPedidoValido
                    ? "bg-[#111] text-[#fcfaf5] hover:bg-[#222]"
                    : "bg-[#eee] text-[#555] cursor-not-allowed"
                }`}
              >
                CONFIRMAR
                <br />
                <span className="text-[9px] opacity-70">PEDIDO</span>
              </motion.button>
            </motion.div>

            <motion.p
              variants={receiptLineVariants}
              className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] opacity-50"
            >
              Gracias por tu compra
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="order-form"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="flex-1 flex flex-col h-full justify-between font-mono"
        >
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
        </motion.div>
      )}
    </div>
  );

  const receiptClasses =
    "relative flex h-full w-full max-w-[390px] flex-col bg-[#fcfaf5] shadow-xl sm:max-w-[380px]";

  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-[99999] flex justify-end">
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
          onClick={onCloseDrawer}
          aria-hidden="true"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
          className={`${receiptClasses} p-5 pt-6`}
          style={{ boxShadow: "-8px 0 30px rgba(0,0,0,0.15)" }}
        >
          <div className="mb-3 flex items-center justify-between border-b border-dashed border-[#aaa] pb-3">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#111]">
              TICKET
              {totalItems > 0 && (
                <span className="ml-2 font-mono text-[11px] text-[#555]">
                  ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
              )}
            </h3>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onCloseDrawer}
              aria-label="Cerrar carrito"
              className="flex h-7 w-7 items-center justify-center border border-[#bbb] text-[#555] transition-colors hover:bg-[#eee]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          {renderCartContent()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${receiptClasses} p-5 pt-6 rounded-none border border-[#bbb]`}
    >
      <div className="mb-3 flex items-center justify-between border-b border-dashed border-[#aaa] pb-3">
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#111]">
          TICKET
          {totalItems > 0 && (
            <span className="ml-2 font-mono text-[11px] text-[#555]">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          )}
        </h3>
      </div>
      {renderCartContent()}
    </div>
  );
}
