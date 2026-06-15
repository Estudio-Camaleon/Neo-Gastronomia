"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useCartStore } from "@/features/public-menu/cart/useCartStore";
import { CartFloatingButton } from "@/features/public-menu/cart/CartFloatingButton";
import { PublicCart } from "@/features/public-menu/cart/PublicCart";
import PublicMenuHeader from "@/features/public-menu/components/PublicMenuHeader";
import { CategoryTabs } from "@/features/public-menu/components/CategoryTabs";
import { ProductGrid } from "@/features/public-menu/components/ProductGrid";
import { MenuFooter } from "@/features/public-menu/components/MenuFooter";
import { useCartVisibility } from "@/features/public-menu/hooks/useCartVisibility";
import { useSlugSubscription } from "@/features/public-menu/hooks/useSlugSubscription";
import { useMenuCatalog } from "@/features/public-menu/hooks/useMenuCatalog";

const FloatingFood = dynamic(
  () => import("@/features/public-menu/components/FloatingFood").then((m) => ({ default: m.FloatingFood })),
  { ssr: false },
);
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
  const isOpenNow = estaAbierto(negocio.horarios);
  const todayKey = getTodayKey();

  useEffect(() => {
    setNegocioId(negocio.id);
  }, [negocio.id, setNegocioId]);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    isMobile,
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

  // Sync cart sidebar visibility with desktop breakpoint
  useCartVisibility(setCartOpen);

  // Subscribe to negocio updates (slug changes) so active public-menu pages update their URL
  useSlugSubscription(negocio.id, negocio.slug);

  const menuConfig = {
    moneda_simbolo: negocio.moneda_simbolo ?? "$",
    pedido_minimo: negocio.pedido_minimo ?? 0,
    costo_envio: negocio.costo_envio ?? 0,
  };

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
        />

        {/* CATALOGO */}
        <div className="relative overflow-hidden">
          {/* FORMAS FLOTANTES — solo en el menú, detrás de los productos */}
          <FloatingFood
            shapes={
              Array.isArray(negocio.floating_shapes)
                ? (negocio.floating_shapes as string[])
                : typeof negocio.floating_shapes === "object" && negocio.floating_shapes !== null
                  ? ((negocio.floating_shapes as { shapes: string[] }).shapes ?? undefined)
                  : undefined
            }
            density={
              !Array.isArray(negocio.floating_shapes) &&
              typeof negocio.floating_shapes === "object" &&
              negocio.floating_shapes !== null
                ? ((negocio.floating_shapes as { density: string }).density as "low" | "medium" | "high")
                : undefined
            }
          />
          <div className="w-full flex-1 pb-12">
          <main className="flex flex-col lg:flex-row">
            <section
              className={`min-w-0 flex-1 bg-[var(--color-custom-surface)] p-4 lg:p-6 transition-all duration-300 ${
                isCartOpen ? "lg:basis-auto" : "lg:basis-full"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
              >
                <div>
                  <h1 className="text-5xl font-black italic leading-none tracking-[-0.05em] text-[var(--color-custom-900)] sm:text-3xl">
                    Menú
                  </h1>
                  <p className="mt-1 text-sm font-medium text-[var(--color-custom-text-muted)]">
                    Elegí tu producto favorito
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
                      className={`relative flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${isOpenNow ? "bg-[color:var(--color-custom-500)/0.12] text-[var(--color-custom-700)]" : "bg-[rgba(190,36,20,0.08)] text-[#be2414]"}`}
                      title={isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                    >
                      <motion.span
                        aria-hidden="true"
                        animate={
                          isOpenNow ? { scale: [1, 1.35, 1] } : { scale: 1 }
                        }
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className={`mr-2 h-2.5 w-2.5 rounded-full ${isOpenNow ? "bg-[var(--color-custom-500)]" : "bg-white"}`}
                      />
                      <span className="sr-only">{isOpenNow ? "Abierto ahora" : "Cerrado ahora"}</span>
                      <span aria-hidden="true">{isOpenNow ? "Abierto" : "Cerrado"}</span>
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
                      placeholder="Buscar producto..."
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
                }}
                onRemoveItem={(productId) => removeItem(productId)}
              />
            </section>

            <aside
              className={`bg-[var(--color-custom-surface)] p-7 w-[380px] shrink-0 transition-all duration-300 max-lg:hidden lg:sticky lg:top-4 lg:self-start ${
                isCartOpen
                  ? "lg:opacity-100 lg:translate-x-0 lg:pointer-events-auto"
                  : "lg:opacity-0 lg:translate-x-6 lg:pointer-events-none lg:invisible"
              }`}
            >
              <PublicCart
                negocioId={negocio.id}
                negocioNombre={negocio.nombre}
                config={menuConfig}
                promos={promos}
                onCloseDrawer={() => setCartOpen(false)}
              />
            </aside>
          </main>
        </div>
        </div>{/* end menu-wrapper */}
        <MenuFooter
          negocio={negocio}
          showSchedule={showSchedule}
          setShowSchedule={setShowSchedule}
          isMobile={isMobile}
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
            }}
            onCancel={() => setSelectedCombo(null)}
          />
        )}
      </AnimatePresence>

      {/* CARRITO DE DISPOSITIVOS SM Y MD */}
      {isMobile && (
        <>
          <CartFloatingButton />
          {isCartOpen && (
            <PublicCart
              negocioId={negocio.id}
              negocioNombre={negocio.nombre}
              isDrawer
              config={menuConfig}
              promos={promos}
              onCloseDrawer={() => setCartOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
}
