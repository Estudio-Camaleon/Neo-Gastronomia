"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { Categoria, Producto } from "@/features/public-menu/types";

interface ProductDiscountInfo {
  label: string;
  type: "porcentaje" | "monto_fijo";
  valor: number;
}

interface ProductGridProps {
  categoriasToShow: Categoria[];
  cartQuantityByProduct: Map<string, number>;
  isOpenNow: boolean;
  isCartOpen: boolean;
  simbolo?: string;
  comboProductIds?: string[];
  productDiscounts?: Map<string, ProductDiscountInfo>;
  hasCodePromo?: boolean;
  onSelectProduct: (product: Producto) => void;
  onQuickAdd: (product: Producto) => void;
  onRemoveItem: (productId: string) => void;
}

export function ProductGrid({
  categoriasToShow,
  cartQuantityByProduct,
  isOpenNow,
  isCartOpen,
  simbolo = "$",
  comboProductIds = [],
  productDiscounts,
  hasCodePromo,
  onSelectProduct,
  onQuickAdd,
  onRemoveItem,
}: ProductGridProps) {
  return (
    <div className="mt-6 space-y-8">
      {categoriasToShow.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] py-16 text-center"
        >
          <p className="text-sm font-medium text-[var(--color-custom-text-muted)]">
            No encontramos productos
          </p>
          <p className="mt-1 text-xs text-[var(--color-custom-text-muted)] opacity-60">
            Probá con otra búsqueda
          </p>
        </motion.div>
      ) : (
          categoriasToShow.map((cat) => (
            <motion.section
              key={cat.id}
              id={`cat-${cat.id}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35 }}
              className="scroll-mt-[130px] space-y-4"
            >
              {/* Category header */}
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-10 rounded-full bg-[var(--color-custom-500)] opacity-60" />
                <h3
                  id={`heading-${cat.id}`}
                  tabIndex={-1}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-custom-900)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm"
                >
                  {cat.nombre}
                  <span className="text-[10px] text-white/50">
                    ({cat.productos.length})
                  </span>
                </h3>
              </div>

              {/* Product cards carousel */}
              <div className="grid grid-flow-col auto-cols-[260px] lg:auto-cols-[280px] gap-3 pb-2 overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain">
                {cat.productos.map((prod) => (
                  <div key={prod.id} className="snap-start">
                    <ProductCard
                      product={prod}
                      cantidad={cartQuantityByProduct.get(prod.id) || 0}
                      isOpenNow={isOpenNow}
                      simbolo={simbolo}
                      isInCombo={comboProductIds.includes(prod.id)}
                      productDiscount={productDiscounts?.get(prod.id)}
                      hasCodePromo={hasCodePromo}
                      onSelect={onSelectProduct}
                      onQuickAdd={onQuickAdd}
                      onRemove={onRemoveItem}
                    />
                  </div>
                ))}
              </div>
            </motion.section>
          ))
        )}
    </div>
  );
}
