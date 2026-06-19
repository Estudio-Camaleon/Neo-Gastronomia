"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PauseCircle } from "lucide-react";
import { useCartStore } from "@/features/public-menu/cart/useCartStore";
import { toast } from "sonner";
import { CartFloatingButton } from "@/features/public-menu/cart/CartFloatingButton";
import { PublicCart } from "@/features/public-menu/cart/PublicCart";
import PublicMenuHeader from "@/features/public-menu/components/PublicMenuHeader";
import { CategoryTabs } from "@/features/public-menu/components/CategoryTabs";
import { ProductGrid } from "@/features/public-menu/components/ProductGrid";
import { MenuFooter } from "@/features/public-menu/components/MenuFooter";

import { useSlugSubscription } from "@/features/public-menu/hooks/useSlugSubscription";
import { useMenuCatalog } from "@/features/public-menu/hooks/useMenuCatalog";

const ProductDetailModal = dynamic(
  () => import("@/features/public-menu/components/ProductDetailModal").then((m) => ({ default: m.ProductDetailModal })),
  { ssr: false },
);
const ComboDetailModal = dynamic(
  () => import("@/features/public-menu/components/ComboDetailModal").then((m) => ({ default: m.ComboDetailModal })),
  { ssr: false },
);
const CombosSection = dynamic(
  () => import("@/features/public-menu/components/CombosSection").then((m) => ({ default: m.CombosSection })),
  { ssr: true },
);
import { estaAbierto } from "@/core/lib/utils/horarios";
import type {
  Categoria,
  NegocioPublico,
  Producto,
  PromoRow,
} from "@/features/public-menu/types";
import { getTodayKey, formatTurnos } from "@/features/public-menu/utils";

export function CatalogClient({
  negocio,
  categorias,
  promos = [],
  uncategorizedProducts = [],
}: {
  negocio: NegocioPublico;
  categorias: Categoria[];
  promos?: PromoRow[];
  uncategorizedProducts?: Producto[];
}) {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<PromoRow | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFixedTabs, setShowFixedTabs] = useState(false);

  const cart = useCartStore((state) => state.cart);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const setNegocioId = useCartStore((state) => state.setNegocioId);
  const isOpenNow = estaAbierto(negocio.horarios) && !negocio.recepcion_pausada;
  const todayKey = getTodayKey();

  useEffect(() => {
    setNegocioId(negocio.id);
  }, [negocio.id, setNegocioId]);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    cartQuantityByProduct,
    categoriasToShow,
    scrollToCategory,
  } = useMenuCatalog({
    categorias,
    uncategorizedProducts,
    cart,
  });

  // Show fixed category bar when inline tabs scroll out of view
  useEffect(() => {
    const anchor = document.getElementById('category-tabs-anchor');
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFixedTabs(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  // Subscribe to negocio updates (slug changes) so active public-menu pages update their URL
  useSlugSubscription(negocio.id, negocio.slug);

  const menuConfig = {
    moneda_simbolo: negocio.moneda_simbolo ?? "$",
    pedido_minimo: negocio.pedido_minimo ?? 0,
    costo_envio: negocio.costo_envio ?? 0,
  };

  // ── Computar datos de promos para badges en productos ──
  const promoInfo = useMemo(() => {
    const comboProductIds: string[] = [];
    const productDiscounts = new Map<string, { label: string; type: "porcentaje" | "monto_fijo"; valor: number }>();
    let hasCodePromo = false;

    // Pre‑compute set of all product IDs for "aplica a todos" expansion
    const allProductIds = new Set<string>();
    for (const cat of categorias) {
      for (const prod of cat.productos) {
        allProductIds.add(prod.id);
      }
    }

    for (const p of promos) {
      if (!p.activo) continue;

      if (p.tipo_descuento === "combo") {
        const items = (p.items_combo as Array<{ producto_id: string }> | null) ?? [];
        for (const item of items) {
          if (!comboProductIds.includes(item.producto_id)) {
            comboProductIds.push(item.producto_id);
          }
        }
      } else if (!p.codigo) {
        // Auto-applied discount (sin código)
        const label =
          p.tipo_descuento === "porcentaje"
            ? `${p.valor_descuento}% OFF`
            : `$${Number(p.valor_descuento).toLocaleString("es-AR")} OFF`;
        const type = p.tipo_descuento as "porcentaje" | "monto_fijo";

        // Determine which products this discount applies to
        const aplicarA = p.aplicar_a as { productos?: string[]; categorias?: string[] } | null;
        const discountValue = Number(p.valor_descuento);

        if (!aplicarA) {
          // Applies to ALL products
          for (const pid of allProductIds) {
            productDiscounts.set(pid, { label, type, valor: discountValue });
          }
        } else {
          // Apply to specific products
          for (const pid of aplicarA.productos ?? []) {
            if (allProductIds.has(pid)) {
              productDiscounts.set(pid, { label, type, valor: discountValue });
            }
          }
          // Apply to products in specific categories
          const categoryIds = new Set(aplicarA.categorias ?? []);
          for (const cat of categorias) {
            if (categoryIds.has(cat.id)) {
              for (const prod of cat.productos) {
                productDiscounts.set(prod.id, { label, type, valor: discountValue });
              }
            }
          }
        }
      } else {
        hasCodePromo = true;
      }
    }

    return { comboProductIds, productDiscounts, hasCodePromo };
  }, [promos, categorias]);

  // ── Mapa rápido: producto_id → categoria_id ──
  const productCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categorias) {
      for (const prod of cat.productos) {
        map[prod.id] = cat.id;
      }
    }
    return map;
  }, [categorias]);

  return (
    <>
      {/* Fixed category tab bar — appears when inline tabs scroll out of view */}
      <div
        className={`fixed top-0 inset-x-0 z-40 bg-[var(--color-custom-surface)] border-b border-[var(--color-custom-200)] shadow-sm px-4 lg:px-6 py-2 transition-opacity duration-200 ${
          showFixedTabs ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <CategoryTabs
          categorias={categorias}
          activeCategory={activeCategory}
          onSelectCategory={scrollToCategory}
        />
      </div>

      <div className="min-h-screen flex flex-col text-[var(--color-custom-text)] selection:bg-[var(--color-custom-deep)] selection:text-white relative z-10">
        {/* HEADER UNIFICADO */}
        <PublicMenuHeader
          negocio={negocio}
          isOpenNow={isOpenNow}
          todayKey={todayKey}
          showSchedule={showSchedule}
          setShowSchedule={setShowSchedule}
          recepcionPausada={!!negocio.recepcion_pausada}
        />

        {/* BANNER RECEPCIÓN PAUSADA */}
        {negocio.recepcion_pausada && (
          <div className="relative z-10 mx-4 mt-4 lg:mx-6">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600">
              <PauseCircle size={20} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight">
                  Recepción de pedidos pausada
                </p>
                <p className="text-xs font-medium text-red-500/80 mt-0.5">
                  El local pausó la recepción por el momento. Volvé a consultar más tarde.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CATALOGO */}
        <main className="flex-1 min-h-0 flex flex-col">
          <section
            className="min-w-0 flex-1 bg-[var(--color-custom-surface)] p-4 lg:p-6"
          >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
              >
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black italic leading-none tracking-[-0.05em] text-[var(--color-custom-900)]">
                    Menú
                  </h1>
                  <p className="mt-1 text-sm font-medium text-[var(--color-custom-text-muted)]">
                    ¿Qué se te antoja hoy?
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:max-w-max">
                  {/* Estado del local — inline con buscador */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <div
                      className={`relative flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${
                        negocio.recepcion_pausada
                          ? "bg-amber-500/10 text-amber-600"
                          : isOpenNow
                            ? "bg-[color:var(--color-custom-500)/0.12] text-[var(--color-custom-700)]"
                            : "bg-[rgba(190,36,20,0.08)] text-[#be2414]"
                      }`}
                      title={
                        negocio.recepcion_pausada
                          ? "Recepción pausada"
                          : isOpenNow
                            ? "Abierto ahora"
                            : "Cerrado ahora"
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={`mr-2 h-2.5 w-2.5 rounded-full ${
                          negocio.recepcion_pausada
                            ? "bg-amber-500"
                            : isOpenNow
                              ? "bg-[var(--color-custom-500)]"
                              : "bg-white"
                        }`}
                      />
                      <span className="sr-only">
                        {negocio.recepcion_pausada
                          ? "Recepción pausada"
                          : isOpenNow
                            ? "Abierto ahora"
                            : "Cerrado ahora"}
                      </span>
                      <span aria-hidden="true">
                        {negocio.recepcion_pausada ? "Pausado" : isOpenNow ? "Abierto" : "Cerrado"}
                      </span>
                    </div>

                    <div className="whitespace-nowrap text-sm text-[var(--color-custom-text-muted)]">
                      {negocio.horarios && todayKey ? (
                        <span>
                          {negocio.horarios[todayKey]
                            ? formatTurnos(negocio.horarios[todayKey])
                            : "Cerrado hoy"}
                        </span>
                      ) : (
                        <span>Sin horarios</span>
                      )}
                    </div>
                  </motion.div>

                  {/* Buscador */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-custom-500)]" />
                    <input
                      type="text"
                      placeholder="Buscá lo que se te antoje..."
                      aria-label="Buscar producto"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] py-3 pl-11 pr-4 text-sm text-[var(--color-custom-text)] outline-none placeholder:text-[var(--color-custom-text-muted)] focus:border-[var(--color-custom-500)] focus:ring-2 focus:ring-[var(--color-custom-500)]/20"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Anchor for scroll detection (inline tabs) */}
              <div id="category-tabs-anchor" className={showFixedTabs ? 'invisible' : ''}>
                <CategoryTabs
                  categorias={categorias}
                  activeCategory={activeCategory}
                  onSelectCategory={scrollToCategory}
                />
              </div>

              <CombosSection
                promos={promos}
                onComboClick={(promo) => setSelectedCombo(promo)}
              />

              <ProductGrid
                categoriasToShow={categoriasToShow}
                cartQuantityByProduct={cartQuantityByProduct}
                isOpenNow={isOpenNow}
                isCartOpen={isCartOpen}
                simbolo={menuConfig.moneda_simbolo}
                comboProductIds={promoInfo.comboProductIds}
                productDiscounts={promoInfo.productDiscounts}
                hasCodePromo={promoInfo.hasCodePromo}
                onSelectProduct={(product) => setSelectedProduct(product)}
                onQuickAdd={(product) => {
                  addItem({
                    id: product.id,
                    producto_id: product.id,
                    nombre: product.nombre,
                    imagen_url: product.imagen_url,
                    precio: product.precio,
                    cantidad: 1,
                    detalles: null,
                    extras: [],
                  });
                  toast.success(`${product.nombre} agregado`, {
                    duration: 2000,
                    position: "bottom-center",
                  });
                }}
                onRemoveItem={(productId) => removeItem(productId)}
              />
            </section>
          </main>
        <MenuFooter
          negocio={negocio}
          showSchedule={showSchedule}
          setShowSchedule={setShowSchedule}
        />
      </div>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            simbolo={menuConfig.moneda_simbolo}
            isOpenNow={isOpenNow}
            onConfirm={(item) => {
              addItem(item);
              setSelectedProduct(null);
              toast.success(`${item.nombre} agregado`, {
                duration: 2000,
                position: "bottom-center",
              });
            }}
            onCancel={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* COMBO DETAIL MODAL */}
      <AnimatePresence>
        {selectedCombo && (
          <ComboDetailModal
            promo={selectedCombo}
            simbolo={menuConfig.moneda_simbolo}
            // combos should respect open state as well
            // we don't pass isOpenNow to ComboDetailModal (visual only) but prevent add in handler below
            onConfirm={(item) => {
              if (!isOpenNow) return;
              addItem(item);
              setSelectedCombo(null);
              toast.success(`Combo agregado`, {
                duration: 2000,
                position: "bottom-center",
              });
            }}
            onCancel={() => setSelectedCombo(null)}
          />
        )}
      </AnimatePresence>

      {/* CARRITO FLOTANTE + DRAWER */}
      <CartFloatingButton />
      {isCartOpen && (
        <PublicCart
          negocioId={negocio.id}
          negocioNombre={negocio.nombre}
          isDrawer
          config={menuConfig}
          promos={promos}
          productCategoryMap={productCategoryMap}
          onCloseDrawer={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
