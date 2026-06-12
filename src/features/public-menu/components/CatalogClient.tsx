"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Clock, Search, ImageIcon, MapPin } from "lucide-react";
import { useCartStore } from "@/features/public-menu/cart/useCartStore";
import { CartFloatingButton } from "@/features/public-menu/cart/CartFloatingButton";
import { PublicCart } from "@/features/public-menu/cart/PublicCart";
import { FloatingFood } from "@/features/public-menu/components/FloatingFood";
import { ProductDetailModal } from "@/features/public-menu/components/ProductDetailModal";
import { ComboDetailModal } from "@/features/public-menu/components/ComboDetailModal";
import { CombosSection } from "@/features/public-menu/components/CombosSection";
import PublicMenuHeader from "@/features/public-menu/components/PublicMenuHeader";
import { estaAbierto } from "@/core/lib/utils/horarios";
import { createClient as createBrowserSupabase } from "@/core/lib/supabase/client";
import { useRouter } from "next/navigation";
import type {
  Categoria,
  NegocioPublico,
  Producto,
  PromoRow,
} from "@/features/public-menu/types";
import {
  DAYS_ORDER,
  DAY_LABELS,
  getTodayKey,
  formatTurnos,
} from "@/features/public-menu/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 180, damping: 20 },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 22 },
  },
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showSchedule, setShowSchedule] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scheduleInited, setScheduleInited] = useState(false);

  const cart = useCartStore((state) => state.cart);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const setNegocioId = useCartStore((state) => state.setNegocioId);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<PromoRow | null>(null);
  const isOpenNow = estaAbierto(negocio.horarios);
  const todayKey = getTodayKey();
  const router = useRouter();

  useEffect(() => {
    setNegocioId(negocio.id);
  }, [negocio.id, setNegocioId]);

  const horariosOrdenados = useMemo(
    () =>
      DAYS_ORDER.map((dayId) => ({
        dayId,
        label: DAY_LABELS[dayId],
        config: negocio.horarios?.[dayId] || null,
      })),
    [negocio.horarios],
  );

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!scheduleInited) {
        setShowSchedule(!mobile);
        setScheduleInited(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [scheduleInited]);

  useEffect(() => {
    const syncCartVisibility = () => {
      setCartOpen(window.innerWidth >= 1024);
    };

    syncCartVisibility();
    window.addEventListener("resize", syncCartVisibility);

    return () => window.removeEventListener("resize", syncCartVisibility);
  }, [setCartOpen]);

  // Subscribe to negocio updates (slug changes) so active public-menu pages update their URL
  useEffect(() => {
    // only run on client
    try {
      const supabase = createBrowserSupabase();
      const channel = supabase
        .channel(`negocios_slug_watch_${negocio.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "negocios",
            filter: `id=eq.${negocio.id}`,
          },
          (payload: unknown) => {
            // payload shape from postgres_changes: { schema, table, commit_timestamp, new, old }
            const p = payload as { new?: { slug?: string } } | undefined;
            const newSlug = p?.new?.slug;
            if (!newSlug) return;
            if (newSlug === negocio.slug) return;

            // If the user is currently on the public menu path for this negocio, replace URL
            const currentPath = window.location.pathname;
            const oldPrefix = `/${negocio.slug}`;
            if (currentPath.startsWith(oldPrefix)) {
              const newPath = currentPath.replace(oldPrefix, `/${newSlug}`);
              // keep search params
              const search = window.location.search || "";
              router.replace(`${newPath}${search}`);
            }
          },
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      };
    } catch {
      // noop
    }
  }, [negocio.id, negocio.slug, router]);

  const cartQuantityByProduct = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => {
      map.set(
        item.producto_id,
        (map.get(item.producto_id) || 0) + item.cantidad,
      );
    });
    return map;
  }, [cart]);

  const categoriasFiltradas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const baseCategorias =
      activeCategory === "all"
        ? categorias
        : categorias.filter((categoria) => categoria.id === activeCategory);

    if (!query) return baseCategorias;

    return baseCategorias
      .map((categoria) => ({
        ...categoria,
        productos: categoria.productos.filter(
          (producto) =>
            producto.nombre.toLowerCase().includes(query) ||
            (producto.descripcion || "").toLowerCase().includes(query),
        ),
      }))
      .filter((categoria) => categoria.productos.length > 0);
  }, [categorias, activeCategory, searchQuery]);

  const categoriasToShow = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (activeCategory !== "all") return categoriasFiltradas;

    // gather all productos across categories
    const allProductos: Producto[] = [];
    categorias.forEach((c) => {
      if (c.productos) allProductos.push(...c.productos);
    });
    if (uncategorizedProducts && uncategorizedProducts.length > 0) {
      allProductos.push(...uncategorizedProducts);
    }

    // if there's a search query, filter the combined list as well
    const filteredAll = query
      ? allProductos.filter(
          (producto) =>
            producto.nombre.toLowerCase().includes(query) ||
            (producto.descripcion || "").toLowerCase().includes(query),
        )
      : allProductos;

    return [
      {
        id: "all",
        nombre: "Todos",
        slug: "todos",
        productos: filteredAll,
      } as unknown as Categoria,
      ...categoriasFiltradas,
    ];
  }, [
    activeCategory,
    categorias,
    categoriasFiltradas,
    uncategorizedProducts,
    searchQuery,
  ]);

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);

    if (id === "all") return;

    const element = document.getElementById(`cat-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(() => {
        const heading = element.querySelector("h3");
        heading?.focus({ preventScroll: true });
      }, 400);
    }
  }, []);

  const menuConfig = {
    moneda_simbolo: negocio.moneda_simbolo ?? "$",
    pedido_minimo: negocio.pedido_minimo ?? 0,
    costo_envio: negocio.costo_envio ?? 0,
  };

  const renderScheduleGrid = () =>
    horariosOrdenados.map(({ dayId, label, config }) => {
      const isToday = dayId === todayKey;
      return (
        <motion.div
          key={dayId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl border px-3 py-2 text-sm transition-all ${
            isToday
              ? "border-[var(--color-custom-500)] bg-white text-[var(--color-custom-900)]"
              : "border-white/10 bg-white/5 text-white/85"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-black uppercase tracking-[0.12em] text-[11px]">
              {label}
            </span>
            {isToday && (
              <span className="rounded-full bg-[var(--color-custom-500)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                Hoy
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-snug opacity-90">
            {formatTurnos(config)}
          </p>
        </motion.div>
      );
    });

  return (
    <>
      <FloatingFood />
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
        <div className="w-full flex-1">
          <main className="flex flex-col gap-6 lg:flex-row">
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
                  <p className="text-5xl font-black italic leading-none tracking-[-0.05em] text-[var(--color-custom-900)] sm:text-3xl">
                    Menú
                  </p>
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
                      aria-hidden
                      className={`relative flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${isOpenNow ? "bg-[color:var(--color-custom-500)/0.12] text-[var(--color-custom-700)]" : "bg-[rgba(190,36,20,0.08)] text-[#be2414]"}`}
                      title={isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                    >
                      <motion.span
                        animate={
                          isOpenNow ? { scale: [1, 1.35, 1] } : { scale: 1 }
                        }
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className={`mr-2 h-2.5 w-2.5 rounded-full ${isOpenNow ? "bg-[var(--color-custom-500)]" : "bg-white"}`}
                      />
                      {isOpenNow ? "Abierto" : "Cerrado"}
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
                      className="w-full rounded-full border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] py-3 pl-11 pr-4 text-sm text-[var(--color-custom-text)] outline-none placeholder:text-[var(--color-custom-text-muted)] focus:border-[var(--color-custom-500)]"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Categorías del menú"
              >
                <motion.button
                  variants={categoryVariants}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === "all"}
                  onClick={() => scrollToCategory("all")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === "all"
                      ? "bg-[var(--color-custom-900)] text-white shadow-md"
                      : "border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] text-[var(--color-custom-900)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  Todos
                </motion.button>
                {categorias.map((cat) => (
                  <motion.button
                    key={cat.id}
                    variants={categoryVariants}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      activeCategory === cat.id
                        ? "bg-[var(--color-custom-900)] text-white shadow-md"
                        : "border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] text-[var(--color-custom-900)] hover:border-[var(--color-custom-500)]"
                    }`}
                  >
                    {cat.nombre}
                  </motion.button>
                ))}
              </motion.div>

              <CombosSection
                promos={promos}
                onComboClick={(promo) => setSelectedCombo(promo)}
              />

              <div className="mt-6 space-y-8">
                <AnimatePresence>
                  {categoriasToShow.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="rounded-3xl bg-[var(--color-custom-surface-strong)] py-20 text-center text-sm font-medium text-[var(--color-custom-text-muted)] shadow-sm"
                    >
                      No encontramos productos para tu búsqueda.
                    </motion.div>
                  ) : (
                    categoriasToShow.map((cat) => (
                      <section
                        key={cat.id}
                        id={`cat-${cat.id}`}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{
                            type: "spring",
                            stiffness: 150,
                            damping: 20,
                          }}
                          className="flex items-center gap-3"
                        >
                          <span className="h-1.5 w-16 rounded-full bg-[var(--color-custom-500)]" />
                          <h3
                            id={`heading-${cat.id}`}
                            tabIndex={-1}
                            className="rounded-full bg-[var(--color-custom-900)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white"
                          >
                            {cat.nombre}
                          </h3>
                        </motion.div>

                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-30px" }}
                          className={`grid grid-cols-1 gap-4 md:grid-cols-2 transition-all duration-300 ${
                            isCartOpen
                              ? "lg:grid-cols-3 xl:grid-cols-4"
                              : "lg:grid-cols-4 xl:grid-cols-5"
                          }`}
                        >
                          {cat.productos.map((prod) => {
                            const cantidad =
                              cartQuantityByProduct.get(prod.id) || 0;

                            return (
                              <motion.article
                                key={prod.id}
                                variants={cardVariants}
                                whileHover={{
                                  y: -4,
                                  boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                                }}
                                layout
                                onClick={() => {
                                  if (prod.disponible) setSelectedProduct(prod);
                                }}
                                className={`overflow-hidden rounded-2xl bg-[var(--color-custom-surface-strong)] shadow-sm ring-1 ring-black/5 cursor-pointer ${
                                  !prod.disponible ? "opacity-50 grayscale" : ""
                                }`}
                                aria-disabled={!prod.disponible}
                              >
                                <div className="relative aspect-square w-full bg-[var(--color-custom-100)]">
                                  {prod.imagen_url ? (
                                    <Image
                                      src={prod.imagen_url}
                                      alt={prod.nombre}
                                      fill
                                      className="rounded-t-2xl object-cover"
                                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                  ) : (
                                    <div
                                      className="flex h-full items-center justify-center text-[var(--color-custom-text-muted)]"
                                      aria-hidden="true"
                                    >
                                      <ImageIcon size={34} />
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col justify-between p-4">
                                  <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-custom-900)]">
                                      {prod.nombre}
                                    </p>
                                    <p className="mt-1 line-clamp-3 text-sm text-[var(--color-custom-text-muted)]">
                                      {prod.descripcion ||
                                        "Producto disponible en el catálogo."}
                                    </p>
                                  </div>

                                  <div className="mt-4 flex items-center justify-between gap-3">
                                    <div className="text-base font-black text-[var(--color-custom-900)]">
                                      $
                                      {Number(prod.precio).toLocaleString(
                                        "es-AR",
                                        { minimumFractionDigits: 0 },
                                      )}
                                    </div>

                                    {prod.disponible ? (
                                      <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center overflow-hidden rounded-full bg-[var(--color-custom-500)] text-white"
                                      >
                                        <button
                                          type="button"
                                          aria-label={`Disminuir cantidad de ${prod.nombre}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(prod.id);
                                          }}
                                          className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                                          disabled={cantidad === 0}
                                        >
                                          <Minus size={16} />
                                        </button>
                                        <motion.span
                                          key={cantidad}
                                          initial={{ scale: 1.3 }}
                                          animate={{ scale: 1 }}
                                          className="inline-flex min-w-10 items-center justify-center px-3 text-sm font-bold sm:min-w-8 sm:px-2 sm:leading-8"
                                        >
                                          {cantidad}
                                        </motion.span>
                                        <button
                                          type="button"
                                          aria-label={`Aumentar cantidad de ${prod.nombre}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isOpenNow) return;
                                            const config = prod.configuracion;
                                            const hasVariants =
                                              config?.variantes &&
                                              config.variantes.length > 0;
                                            const hasExtras =
                                              config?.grupos_opciones &&
                                              config.grupos_opciones.length >
                                                0 &&
                                              config.grupos_opciones.some(
                                                (g) => g.items.length > 0,
                                              );
                                            if (hasVariants || hasExtras) {
                                              setSelectedProduct(prod);
                                            } else {
                                              addItem({
                                                id: prod.id,
                                                producto_id: prod.id,
                                                nombre: prod.nombre,
                                                imagen_url: prod.imagen_url,
                                                precio: prod.precio,
                                                cantidad: 1,
                                                detalles: null,
                                                extras: [],
                                              });
                                            }
                                          }}
                                          className={`flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-80 sm:h-8 sm:w-8 ${!isOpenNow ? "opacity-40 cursor-not-allowed" : ""}`}
                                          disabled={!isOpenNow}
                                        >
                                          <Plus size={16} />
                                        </button>
                                      </motion.div>
                                    ) : (
                                      <span className="rounded-full bg-[var(--color-custom-100)] px-3 py-1 text-xs font-semibold text-[var(--color-custom-900)]">
                                        Agotado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.article>
                            );
                          })}
                        </motion.div>
                      </section>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>

            <aside
              className={`bg-[var(--color-custom-surface)] pt-7 w-[380px] shrink-0 transition-all duration-300 max-lg:hidden lg:sticky lg:top-4 lg:self-start ${
                isCartOpen
                  ? "lg:opacity-100 lg:translate-x-0 lg:pointer-events-auto"
                  : "lg:opacity-0 lg:translate-x-6 lg:pointer-events-none lg:invisible"
              }`}
            >
              <PublicCart
                negocioId={negocio.id}
                negocioNombre={negocio.nombre}
                config={menuConfig}
                onCloseDrawer={() => setCartOpen(false)}
              />
            </aside>
          </main>
        </div>
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[var(--color-custom-950)]"
        >
          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between sm:gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/95 sm:text-[11px] sm:tracking-[0.18em]">
                  <Clock className="h-3.5 w-3.5" />
                  Horarios
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="lg:hidden text-xs text-white/60 hover:text-white transition-colors underline underline-offset-2"
                >
                  {showSchedule ? "Ocultar horarios" : "Ver horarios completos"}
                </button>
              </div>
            </div>

            {isMobile ? (
              <AnimatePresence>
                {showSchedule && (
                  <motion.div
                    id="schedule-grid"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 overflow-hidden"
                  >
                    {renderScheduleGrid()}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div
                id="schedule-grid"
                className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {renderScheduleGrid()}
              </div>
            )}

            {/* DIRECCIONES */}
            {negocio.direcciones && negocio.direcciones.length > 0 && (
              <div className="border-t border-white/10 pt-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/95 sm:text-[11px] sm:tracking-[0.18em] mb-4">
                  <MapPin className="h-3.5 w-3.5" />
                  Sucursales
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {negocio.direcciones.map((dir) => (
                    <div
                      key={dir.id}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-custom-500)]/20 text-[var(--color-custom-500)]">
                        <MapPin size={14} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-white truncate">
                          {dir.nombre || "Sucursal"}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {dir.direccion}
                        </p>
                        {dir.localidad && (
                          <p className="text-[11px] text-white/40">
                            {dir.localidad}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.footer>
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
              onCloseDrawer={() => setCartOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
}
