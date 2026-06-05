"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Minus,
  Plus,
  Clock,
  MapPin,
  Search,
  ImageIcon,
} from "lucide-react";
import {
  useCartStore,
  generateItemId,
} from "@/features/public-menu/cart/useCartStore";
import { CartFloatingButton } from "@/features/public-menu/cart/CartFloatingButton";
import { PublicCart } from "@/features/public-menu/cart/PublicCart";
import { FloatingFood } from "@/features/public-menu/components/FloatingFood";
import { ExtrasSelector } from "@/features/public-menu/components/ExtrasSelector";
import { estaAbierto } from "@/core/lib/utils/horarios";
import type {
  Categoria,
  NegocioPublico,
  ExtraGroup,
  Producto,
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
}: {
  negocio: NegocioPublico;
  categorias: Categoria[];
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
  const [extrasProduct, setExtrasProduct] = useState<{
    product: Producto;
    groups: ExtraGroup[];
  } | null>(null);
  const isOpenNow = estaAbierto(negocio.horarios);
  const todayKey = getTodayKey();

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
      <div className="min-h-screen text-[var(--color-custom-text)] selection:bg-[var(--color-custom-deep)] selection:text-white relative z-10">
        {/* HEADER UNIFICADO */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden pt-20 pb-10"
        >
          {negocio.banner_url && (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <Image
                src={negocio.banner_url}
                alt=""
                fill
                className="object-cover scale-105"
                sizes="100vw"
                priority
                loading="eager"
                style={{ objectPosition: negocio.banner_posicion ?? "center" }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,var(--color-custom-surface)_95%)]" />
            </div>
          )}

          <div className="relative z-10 flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center gap-3 sm:flex-row sm:items-center"
              >
                {negocio.logo_url && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 15,
                      delay: 0.3,
                    }}
                    className="h-40 w-40 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 shadow-xl sm:h-30 sm:w-30 lg:h-50 lg:w-50"
                  >
                    <Image
                      src={negocio.logo_url}
                      alt={negocio.nombre}
                      width={160}
                      height={160}
                      className="h-full w-full rounded-full object-cover"
                      style={{ transform: `scale(${negocio.logo_scale ?? 1})` }}
                      priority
                    />
                  </motion.div>
                )}
                <div className="text-center sm:text-left">
                  {(negocio.mostrar_nombre ?? true) && (
                    <h1 className="text-5xl font-black leading-none tracking-[-0.06em] text-[var(--color-custom-900)] sm:text-5xl">
                      {negocio.nombre}
                    </h1>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-[15px]"
                    style={{
                      backgroundColor: isOpenNow
                        ? "color-mix(in srgb, var(--color-custom-500) 12%, transparent)"
                        : "rgba(255,0,0,0.10)",
                      color: isOpenNow ? "var(--color-custom-700)" : "#be2414",
                    }}
                  >
                    <motion.span
                      animate={isOpenNow ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`h-1.5 w-1.5 rounded-full ${
                        isOpenNow ? "bg-[var(--color-custom-500)]" : "bg-white"
                      }`}
                    />
                    {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center gap-3 sm:items-end"
              >
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 sm:justify-end">
                  <div className="flex items-center gap-1.5 text-sm text-white rounded-2xl bg-[var(--color-custom-900)]/70 p-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{negocio.localidad || "Sucursal Centro"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-white rounded-2xl bg-[var(--color-custom-800)]/80 p-2">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Hoy:{" "}
                      {formatTurnos(
                        todayKey ? negocio.horarios?.[todayKey] : null,
                      )}
                    </span>
                  </div>
                </div>

                {(negocio.whatsapp ||
                  negocio.instagram_url ||
                  negocio.facebook_url) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-2"
                  >
                    {negocio.whatsapp && (
                      <a
                        href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        className="flex h-8 w-20 items-center justify-center rounded-full bg-[var(--color-custom-900)]/50 text-white/80 transition-all hover:bg-[var(--color-custom-500)] hover:text-white"
                      >
                        <MessageCircle size={24} />
                      </a>
                    )}
                    {negocio.instagram_url && (
                      <a
                        href={negocio.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="flex h-8 w-20 items-center justify-center rounded-full bg-[var(--color-custom-900)]/50 text-white/80 transition-all hover:bg-[var(--color-custom-500)] hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </a>
                    )}
                    {negocio.facebook_url && (
                      <a
                        href={negocio.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="flex h-8 w-20 items-center justify-center rounded-full bg-[var(--color-custom-900)]/50 text-white/80 transition-all hover:bg-[var(--color-custom-500)] hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* CATALOGO */}
        <div className="w-full">
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

                <div className="relative w-full lg:max-w-sm">
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

              <div className="mt-6 space-y-8">
                <AnimatePresence mode="wait">
                  {categoriasFiltradas.length === 0 ? (
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
                    categoriasFiltradas.map((cat) => (
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
                                className={`overflow-hidden rounded-2xl bg-[var(--color-custom-surface-strong)] shadow-sm ring-1 ring-black/5 ${
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

                                <div className="flex min-h-[170px] flex-col justify-between p-4">
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
                                          onClick={() => removeItem(prod.id)}
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
                                          onClick={() => {
                                            const grupos =
                                              prod.configuracion
                                                ?.grupos_opciones;
                                            if (
                                              grupos &&
                                              grupos.length > 0 &&
                                              grupos.some(
                                                (g) => g.items.length > 0,
                                              )
                                            ) {
                                              setExtrasProduct({
                                                product: prod,
                                                groups: grupos,
                                              });
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
                                          className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-80 sm:h-8 sm:w-8"
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-[var(--color-custom-950)]"
        >
          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
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
                    className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4 overflow-hidden"
                  >
                    {renderScheduleGrid()}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div
                id="schedule-grid"
                className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
              >
                {renderScheduleGrid()}
              </div>
            )}
          </div>
        </motion.footer>
      </div>

      {/* EXTRAS SELECTOR */}
      <AnimatePresence>
        {extrasProduct && (
          <ExtrasSelector
            productName={extrasProduct.product.nombre}
            basePrice={extrasProduct.product.precio}
            groups={extrasProduct.groups}
            simbolo={menuConfig.moneda_simbolo}
            onConfirm={(extras, extraTotal) => {
              const id = generateItemId(extrasProduct.product.id, extras);
              const precioFinal = extrasProduct.product.precio + extraTotal;
              addItem({
                id,
                producto_id: extrasProduct.product.id,
                nombre: extrasProduct.product.nombre,
                imagen_url: extrasProduct.product.imagen_url,
                precio: precioFinal,
                cantidad: 1,
                detalles: null,
                extras,
              });
              setExtrasProduct(null);
            }}
            onCancel={() => setExtrasProduct(null)}
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
