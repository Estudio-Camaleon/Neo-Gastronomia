"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Minus,
  Image as ImageIcon,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { useCartStore } from "@/features/public-menu/cart/useCartStore";
import { CartFloatingButton } from "@/features/public-menu/cart/CartFloatingButton";
import { PublicCart } from "@/features/public-menu/cart/PublicCart";
import { estaAbierto } from "@/core/lib/utils/horarios";
import type { Categoria, NegocioPublico } from "@/features/public-menu/types";
import {
  DAYS_ORDER,
  DAY_LABELS,
  getTodayKey,
  formatTurnos,
} from "@/features/public-menu/utils";

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

  const scrollToCategory = (id: string) => {
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
  };

  const menuConfig = {
    moneda_simbolo: "$",
    pedido_minimo: 0,
    costo_envio: 0,
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-custom-950)] pb-8 text-[var(--color-custom-text)] selection:bg-[var(--color-custom-900)] selection:text-white">
        {/* HEADER UNIFICADO */}
        <header className="relative overflow-hidden pt-20 pb-10">
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
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,var(--color-custom-100)_95%)]" />
            </div>
          )}

          <div className="relative z-10 flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                {negocio.logo_url && (
                  <div className="h-40 w-40 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 shadow-xl sm:h-30 sm:w-30 lg:h-50 lg:w-50">
                    <Image
                      src={negocio.logo_url}
                      alt={negocio.nombre}
                      width={160}
                      height={160}
                      className="h-full w-full rounded-full object-cover"
                      priority
                    />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h1 className="text-5xl font-black  leading-none tracking-[-0.06em] text-[var(--color-custom-150)] sm:text-5xl text-shadow-lg/30">
                    {negocio.nombre}
                  </h1>
                  <div
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-[15px]"
                    style={{
                      backgroundColor: isOpenNow
                        ? "rgba(34,197,94,0.10)"
                        : "rgba(255,0,0,0.10)",
                      color: isOpenNow ? "#4ade80" : "#be2414",
                    }}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isOpenNow ? "animate-pulse bg-green-500" : "bg-white"
                      }`}
                    />
                    {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:items-end">
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 sm:justify-end ">
                  <div className="flex items-center gap-1.5 text-sm text-white rounded-2xl bg-black/60 p-2 ">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{negocio.localidad || "Sucursal Centro"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-white rounded-2xl bg-black/70 p-2">
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
                  <div className="flex gap-2 ">
                    {negocio.whatsapp && (
                      <a
                        href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        className="flex h-8 w-20 items-center justify-center rounded-full bg-black/40 text-white/80 transition-all hover:bg-white/20 hover:text-white "
                      >
                        <FaWhatsapp size={27} />
                      </a>
                    )}
                    {negocio.instagram_url && (
                      <a
                        href={negocio.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="flex h-8 w-20 items-center justify-center rounded-full bg-black/40 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                      >
                        <FaInstagram size={26} />
                      </a>
                    )}
                    {negocio.facebook_url && (
                      <a
                        href={negocio.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="flex h-8 w-20 items-center justify-center rounded-full bg-black/40 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                      >
                        <FaFacebookF size={25} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CATALOGO */}
        <div className="w-full">
          <main className=" flex flex-col gap-6 lg:flex-row">
            <section
              className={`min-w-0 flex-1 bg-[var(--color-custom-100)] p-4 shadow-sm lg:p-6 transition-all duration-300 ${
                isCartOpen ? "lg:basis-auto" : "lg:basis-full"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-5xl font-black italic leading-none tracking-[-0.05em] text-[var(--color-custom-950)] sm:text-3xl">
                    Menú
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--color-custom-text-muted)]">
                    Elegí tu producto favorito
                  </p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-custom-600)]" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    aria-label="Buscar producto"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-[var(--color-custom-200)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--color-custom-text)] outline-none placeholder:text-[var(--color-custom-text-muted)] focus:border-[var(--color-custom-500)]"
                  />
                </div>
              </div>

              <div
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Categorías del menú"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === "all"}
                  onClick={() => scrollToCategory("all")}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeCategory === "all"
                      ? "bg-[var(--color-custom-900)] text-white"
                      : "border border-[var(--color-custom-200)] bg-white text-[var(--color-custom-950)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  Todos
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      activeCategory === cat.id
                        ? "bg-[var(--color-custom-900)] text-white"
                        : "border border-[var(--color-custom-200)] bg-white text-[var(--color-custom-950)] hover:border-[var(--color-custom-500)]"
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-8">
                {categoriasFiltradas.length === 0 ? (
                  <div className="rounded-3xl bg-white py-20 text-center text-sm font-medium text-[var(--color-custom-text-muted)] shadow-sm">
                    No encontramos productos para tu búsqueda.
                  </div>
                ) : (
                  categoriasFiltradas.map((cat) => (
                    <section
                      key={cat.id}
                      id={`cat-${cat.id}`}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-1.5 w-16 rounded-full bg-[var(--color-custom-600)]" />
                        <h3
                          id={`heading-${cat.id}`}
                          tabIndex={-1}
                          className="rounded-full bg-[var(--color-custom-900)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white"
                        >
                          {cat.nombre}
                        </h3>
                      </div>

                      <div
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
                            <article
                              key={prod.id}
                              className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${
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
                                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-custom-950)]">
                                    {prod.nombre}
                                  </p>
                                  <p className="mt-1 line-clamp-3 text-sm text-[var(--color-custom-text-muted)]">
                                    {prod.descripcion ||
                                      "Producto disponible en el catálogo."}
                                  </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <div className="text-base font-black text-[var(--color-custom-950)]">
                                    $
                                    {Number(prod.precio).toLocaleString(
                                      "es-AR",
                                      {
                                        minimumFractionDigits: 0,
                                      },
                                    )}
                                  </div>

                                  {prod.disponible ? (
                                    <div className="flex items-center overflow-hidden rounded-full bg-[var(--color-custom-500)] text-white">
                                      <button
                                        type="button"
                                        aria-label={`Disminuir cantidad de ${prod.nombre}`}
                                        onClick={() => removeItem(prod.id)}
                                        className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                                        disabled={cantidad === 0}
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <span className="inline-flex min-w-10 items-center justify-center px-3 text-sm font-bold sm:min-w-8 sm:px-2 sm:leading-8">
                                        {cantidad}
                                      </span>
                                      <button
                                        type="button"
                                        aria-label={`Aumentar cantidad de ${prod.nombre}`}
                                        onClick={() =>
                                          addItem({
                                            id: prod.id,
                                            producto_id: prod.id,
                                            nombre: prod.nombre,
                                            imagen_url: prod.imagen_url,
                                            precio: prod.precio,
                                            cantidad: 1,
                                            detalles: null,
                                          })
                                        }
                                        className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-80 sm:h-8 sm:w-8"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="rounded-full bg-[var(--color-custom-100)] px-3 py-1 text-xs font-semibold text-[var(--color-custom-950)]">
                                      Agotado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </section>

            <aside
              className={`bg-[var(--color-custom-100)] pt-7 hidden w-[380px] shrink-0 transition-all duration-300 lg:sticky lg:top-4 lg:self-start ${
                isCartOpen
                  ? "lg:block opacity-100 translate-x-0"
                  : "lg:hidden pointer-events-none opacity-0 translate-x-6"
              }`}
            >
              <PublicCart
                negocioId={negocio.id}
                config={menuConfig}
                onCloseDrawer={() => setCartOpen(false)}
              />
            </aside>
          </main>
          <footer>
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:mt-5 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between sm:gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/95 sm:text-[11px] sm:tracking-[0.18em]">
                    <Clock className="h-3.5 w-3.5" />
                    Horarios
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition-all hover:bg-white/10"
                  aria-expanded={showSchedule}
                  aria-controls="schedule-grid"
                >
                  <span className="font-semibold">Horarios</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      showSchedule ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showSchedule && (
                  <div
                    id="schedule-grid"
                    className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
                  >
                    {horariosOrdenados.map(({ dayId, label, config }) => {
                      const isToday = dayId === todayKey;

                      return (
                        <div
                          key={dayId}
                          className={`rounded-2xl border px-3 py-2 text-sm transition-all ${
                            isToday
                              ? "border-[var(--color-custom-500)] bg-white text-[var(--color-custom-950)]"
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* CARRITO DE DISPOSITIVOS SM Y MD */}
      <div className="lg:hidden">
        <CartFloatingButton />
        {isCartOpen && (
          <PublicCart
            negocioId={negocio.id}
            isDrawer
            config={menuConfig}
            onCloseDrawer={() => setCartOpen(false)}
          />
        )}
      </div>
    </>
  );
}
