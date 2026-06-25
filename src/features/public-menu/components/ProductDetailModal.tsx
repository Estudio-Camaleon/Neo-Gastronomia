"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { CartExtra } from "@/features/public-menu/cart/useCartStore";
import { generateItemId } from "@/features/public-menu/cart/useCartStore";
import type { Producto } from "@/features/public-menu/types";
import { formatMoney } from "@/features/public-menu/utils";
import { ExtraGroupRenderer } from "@/features/public-menu/components/ExtraGroupRenderer";
import { useExtrasSelection } from "@/features/public-menu/hooks/useExtrasSelection";
import { useIsMobile } from "@/core/hooks/useIsMobile";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface ProductDetailModalProps {
  product: Producto;
  onConfirm: (item: {
    id: string;
    producto_id: string;
    nombre: string;
    imagen_url: string | null;
    precio: number;
    cantidad: number;
    detalles: string | null;
    extras: CartExtra[];
    variantName?: string | null;
  }) => void;
  onCancel: () => void;
  simbolo?: string;
  isOpenNow?: boolean;
}

export function ProductDetailModal({
  product,
  onConfirm,
  onCancel,
  simbolo = "$",
  isOpenNow = true,
}: ProductDetailModalProps) {
  const isMobile = useIsMobile();
  useScrollLock(true);
  const config = product.configuracion;
  const variants = config?.variantes ?? [];
  const groups = config?.grupos_opciones ?? [];

  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(
    null,
  );
  const {
    quantities,
    hasError: hasRequiredError,
    extraTotal,
    toggleItem,
    addItem,
    removeItem,
    getQuantity,
    buildExtras,
  } = useExtrasSelection(groups);
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);

  const images = [product.imagen_url, ...(product.imagenes_extra ?? [])].filter(
    (u): u is string => !!u,
  );

  const basePrice =
    selectedVariantIdx !== null
      ? variants[selectedVariantIdx].precio
      : Number(product.precio);
  const variantName =
    selectedVariantIdx !== null
      ? variants[selectedVariantIdx].nombre
      : null;

  const total = basePrice + extraTotal;

  const handleConfirm = () => {
    if (hasRequiredError) return;
    const extras = buildExtras();
    const id = generateItemId(product.id, extras, variantName ?? undefined);
    onConfirm({
      id,
      producto_id: product.id,
      nombre: product.nombre,
      imagen_url: product.imagen_url,
      precio: total,
      cantidad,
      detalles: nota || null,
      extras,
      variantName: variantName || null,
    });
  };

  const touchStartX = useRef(0);

  const goToPrevImage = useCallback(() => {
    setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNextImage = useCallback(() => {
    setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToNextImage();
        else goToPrevImage();
      }
    },
    [goToNextImage, goToPrevImage],
  );

  const containerRef = useFocusTrap(true);

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      tabIndex={-1}
      onKeyDown={handleBackdropKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/50 sm:backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />
      <motion.div
        initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.92, y: 20 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[460px] sm:max-w-4xl bg-[var(--color-custom-surface-strong)] shadow-2xl overflow-hidden flex flex-col sm:flex-row max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:max-h-[92vh] sm:rounded-2xl sm:max-h-[85vh] lg:max-h-[80vh]"
      >
        {/* Image - left side on desktop */}
        <div className="relative sm:w-2/5 shrink-0 overflow-hidden bg-[var(--color-custom-100)] max-sm:aspect-video sm:flex sm:items-center sm:justify-center"
          onTouchStart={images.length > 1 ? handleTouchStart : undefined}
          onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
        >
          {images.length > 0 ? (
            <div
              className="w-full h-full min-h-[140px] sm:min-h-full sm:flex sm:items-center sm:justify-center cursor-pointer"
              onClick={() => setShowImageZoom(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[selectedImageIdx]}
                  src={images[selectedImageIdx]}
                  alt={product.nombre}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full object-cover sm:object-contain sm:h-auto sm:max-h-full"
                  draggable={false}
                />
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex h-full w-full min-h-[140px] sm:min-h-full items-center justify-center text-[var(--color-custom-text-muted)]" role="img" aria-label={`${product.nombre} — sin imagen`}>
              <ImageIcon size={48} />
            </div>
          )}

          {/* Arrow buttons */}
          {images.length > 1 && (
            <div className="absolute inset-0 z-10 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={goToPrevImage}
                aria-label="Imagen anterior"
                className="pointer-events-auto ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                aria-label="Imagen siguiente"
                className="pointer-events-auto mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white/90 tabular-nums">
              {selectedImageIdx + 1}/{images.length}
            </div>
          )}

          {/* Gradient overlay + name/description on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-custom-900)]/70 via-[var(--color-custom-900)]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <h3 className="text-base font-bold text-white drop-shadow-sm">
              {product.nombre}
            </h3>
            {product.descripcion && (
              <p className="mt-0.5 text-xs text-white/80 leading-relaxed drop-shadow-sm line-clamp-2">
                {product.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Close button - top right of modal */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-90"
        >
          <X size={18} />
        </button>

        {/* Content - right side on desktop */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          <div className="overflow-y-auto overscroll-y-contain px-4 sm:px-5 py-3 sm:py-4 space-y-4 sm:space-y-5 flex-1 min-h-0">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[var(--color-custom-900)]">
              {formatMoney(basePrice + extraTotal, simbolo)}
            </span>
            {extraTotal > 0 && (
              <span className="text-[10px] sm:text-xs text-[var(--color-custom-text-muted)] block sm:inline">
                ({formatMoney(basePrice, simbolo)} + {formatMoney(extraTotal, simbolo)} extras)
              </span>
            )}
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-custom-900)]">
                  Variante
                </span>
                <span className="text-[9px] text-[var(--color-custom-text-muted)]">
                  (opcional)
                </span>
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variante">
                {variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={selectedVariantIdx === idx}
                    onClick={() => setSelectedVariantIdx(idx === selectedVariantIdx ? null : idx)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all min-w-0 ${
                      selectedVariantIdx === idx
                        ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)]/5 text-[var(--color-custom-900)]"
                        : "border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-300)]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                        selectedVariantIdx === idx
                          ? "border-[var(--color-custom-500)] bg-[var(--color-custom-500)] text-white"
                          : "border-[var(--color-custom-300)]"
                      }`}
                    >
                      {selectedVariantIdx === idx && (
                        <span className="block h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="font-medium truncate">{v.nombre}</span>
                    <span className="text-xs font-semibold text-[var(--color-custom-600)]">
                      {formatMoney(v.precio, simbolo)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upsells — Mejorá tu pedido */}
          {groups.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--color-custom-900)] flex items-center gap-1.5">
                Mejorá tu pedido
              </span>
              <ExtraGroupRenderer
                groups={groups}
                quantities={quantities}
                onToggle={toggleItem}
                onAdd={addItem}
                onRemove={removeItem}
                getQuantity={getQuantity}
                simbolo={simbolo}
                formatMoney={formatMoney}
              />
            </div>
          )}

          {/* Note */}
          <div>
            <span className="text-xs font-bold text-[var(--color-custom-900)] mb-2 block">
              ¿Algún detalle extra?
            </span>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Sin cebolla, bien cocido..."
              aria-label="Nota del pedido"
              className="w-full rounded-xl border border-[var(--color-custom-border)] bg-[var(--color-custom-surface)] px-4 py-2.5 text-sm text-[var(--color-custom-text)] placeholder:text-[var(--color-custom-text-muted)] outline-none focus:border-[var(--color-custom-500)] focus:ring-1 focus:ring-[var(--color-custom-500)]/20 resize-none h-20 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-custom-border)] px-4 sm:px-5 py-3 sm:py-4 space-y-3 shrink-0 pb-[env(safe-area-inset-bottom,0.75rem)]">
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-custom-900)]">
              Cantidad
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                aria-label="Reducir cantidad"
                className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30 active:scale-90"
              >
                <Minus size={15} />
              </button>
              <span className="min-w-[2.5rem] text-center text-sm font-bold tabular-nums text-[var(--color-custom-900)]" aria-live="polite" aria-atomic="true">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad(Math.min(99, cantidad + 1))}
                disabled={cantidad >= 99}
                aria-label="Aumentar cantidad"
                className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] transition-colors hover:bg-[var(--color-custom-100)] disabled:opacity-30 active:scale-90"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-custom-text-muted)]">
              Total
            </span>
            <span className="text-lg font-black text-[var(--color-custom-900)]" aria-live="polite" aria-atomic="true">
              {formatMoney(total * cantidad, simbolo)}
            </span>
          </div>

          {hasRequiredError && (
            <p className="text-xs text-red-500 text-center">
              {hasRequiredError}
            </p>
          )}

          <motion.button
            type="button"
            disabled={!!hasRequiredError}
            onClick={(e) => {
              if (!isOpenNow) return;
              handleConfirm();
            }}
            whileHover={!hasRequiredError && isOpenNow ? { scale: 1.01 } : {}}
            whileTap={!hasRequiredError && isOpenNow ? { scale: 0.99 } : {}}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
              !isOpenNow
                ? "bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)] cursor-not-allowed opacity-40"
                : hasRequiredError
                ? "bg-[var(--color-custom-100)] text-[var(--color-custom-text-muted)] cursor-not-allowed"
                : "bg-[var(--color-custom-900)] text-white hover:bg-[var(--color-custom-800)]"
            }`}
          >
            <ShoppingBag size={16} className="shrink-0" />
            {isOpenNow ? (
              <span className="truncate">
                Pedir ahora · {formatMoney(total * cantidad, simbolo)}
              </span>
            ) : (
              <span className="truncate">Cerrado ahora — volvé más tarde</span>
            )}
          </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Full-screen image zoom ── */}
      <AnimatePresence>
        {showImageZoom && images.length > 0 && (
          <motion.div
            key="image-zoom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setShowImageZoom(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowImageZoom(false);
            }}
            tabIndex={0}
          >
            <button
              type="button"
              onClick={() => setShowImageZoom(false)}
              aria-label="Cerrar imagen"
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-90"
            >
              <X size={20} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                  aria-label="Imagen anterior"
                  className="absolute left-2 sm:left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-90"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                  aria-label="Imagen siguiente"
                  className="absolute right-2 sm:right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-90"
                >
                  <ChevronRight size={22} />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90 tabular-nums">
                  {selectedImageIdx + 1}/{images.length}
                </div>
              </>
            )}

            <motion.img
              key={images[selectedImageIdx]}
              src={images[selectedImageIdx]}
              alt={product.nombre}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[90vh] max-w-[95vw] object-contain select-none"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
