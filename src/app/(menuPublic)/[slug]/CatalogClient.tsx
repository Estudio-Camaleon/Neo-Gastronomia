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
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { useCartStore } from "@/features/public-menu/cart/useCartStore";
import { CartFloatingButton } from "@/features/public-menu/cart/CartFloatingButton";
import { PublicCart } from "@/features/public-menu/cart/PublicCart";
import { estaAbierto } from "@/core/lib/utils/horarios";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  productos: Producto[];
}

export interface Turno {
  inicio: string;
  fin: string;
}

export interface HorarioDia {
  turnos: Turno[];
}

export interface NegocioPublico {
  id: string;
  nombre: string;
  slug: string;
  color_primary: string | null;
  banner_url: string | null;
  logo_url: string | null;
  direccion: string | null;
  localidad: string | null;
  direccion_notas: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  horarios: Record<string, HorarioDia> | null;
}

interface CatalogClientProps {
  negocio: NegocioPublico;
  categorias: Categoria[];
}

const DAYS_ORDER = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

const DAY_LABELS: Record<(typeof DAYS_ORDER)[number], string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

function formatTurnos(dia?: HorarioDia | null) {
  if (!dia) return "Cerrado";

  const turnos = dia.turnos || [];
  if (turnos.length === 0) return "Cerrado";

  return turnos.map((turno) => `${turno.inicio} - ${turno.fin}`).join(" · ");
}

export function CatalogClient({ negocio, categorias }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const cart = useCartStore((state) => state.cart);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const _totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const isOpenNow = estaAbierto(negocio.horarios);
  const todayKey = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      timeZone: "America/Argentina/Buenos_Aires",
    });

    return formatter
      .format(new Date())
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase() as (typeof DAYS_ORDER)[number];
  }, []);

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
    }
  };

  const menuConfig = {
    moneda_simbolo: "$",
    pedido_minimo: 0,
    costo_envio: 0,
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-custom-50)] pb-8 text-[var(--color-custom-text)] selection:bg-[var(--color-custom-900)] selection:text-white">
        <div className="w-full px-4 py-4 lg:px-10 lg:py-6">
          <header className="rounded-2xl bg-[var(--color-custom-950)] px-4 py-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:rounded-3xl sm:px-6 sm:py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-1 sm:h-12 sm:w-12 sm:p-1.5">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="Estudio Camaleon"
                    width={0}
                    height={0}
                    sizes="48px"
                    className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                  />
                </div>
                <div>
                  <p className="text-2xl font-black italic leading-none tracking-[-0.06em] sm:text-4xl">
                    {negocio.nombre}
                  </p>
                  <div className="mt-1 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/95 sm:mt-2 sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
                    {isOpenNow ? "Abierto ahora" : "Cerrado ahora"} · Pedí por
                    WhatsApp
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:flex-1">
                {negocio.logo_url ? (
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/10 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] sm:h-24 sm:w-24 sm:p-2 lg:h-32 lg:w-32">
                    <Image
                      src={negocio.logo_url}
                      alt={negocio.nombre}
                      width={160}
                      height={160}
                      className="h-full w-full rounded-[18px] object-cover sm:rounded-[22px]"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end sm:gap-3">
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-white sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 sm:text-[12px] sm:tracking-[0.14em]">
                    <MapPin className="h-4 w-4" />
                    Sucursal
                  </div>
                  <p className="mt-1 text-sm font-medium text-white/85">
                    {negocio.localidad || "Sucursal Centro"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-white sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 sm:text-[12px] sm:tracking-[0.14em]">
                    <Clock className="h-4 w-4" />
                    Horarios
                  </div>
                  <p className="mt-1 text-sm font-medium text-white/85">
                    {formatTurnos(negocio.horarios?.[todayKey])}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:mt-5 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between sm:gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/95 sm:text-[11px] sm:tracking-[0.18em]">
                    <Clock className="h-3.5 w-3.5" />
                    Horarios reales
                  </div>
                  <p className="max-w-md text-sm text-white/80">
                    Los horarios se toman directamente de la configuración del
                    negocio.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {negocio.whatsapp && (
                    <a
                      href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp"
                      title="WhatsApp"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-all hover:brightness-110"
                    >
                      <FaWhatsapp size={20} />
                    </a>
                  )}
                  {negocio.instagram_url && (
                    <a
                      href={negocio.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      title="Instagram"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/15"
                    >
                      <FaInstagram size={18} />
                    </a>
                  )}
                  {negocio.facebook_url && (
                    <a
                      href={negocio.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      title="Facebook"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/15"
                    >
                      <FaFacebookF size={16} />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 hidden gap-2 sm:grid sm:grid-cols-2 xl:grid-cols-4">
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
            </div>
          </header>

          <main className="mt-6 flex flex-col gap-6 lg:flex-row">
            <section
              className={`min-w-0 flex-1 rounded-3xl bg-[var(--color-custom-100)] p-4 shadow-sm lg:p-6 transition-all duration-300 ${
                isCartOpen ? "lg:basis-auto" : "lg:basis-full"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-2xl font-black italic leading-none tracking-[-0.05em] text-[var(--color-custom-950)] sm:text-3xl">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-[var(--color-custom-200)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--color-custom-text)] outline-none placeholder:text-[var(--color-custom-text-muted)] focus:border-[var(--color-custom-500)]"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
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
                        <span className="rounded-full bg-[var(--color-custom-900)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white">
                          {cat.nombre}
                        </span>
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
                                  <div className="flex h-full items-center justify-center text-[var(--color-custom-text-muted)]">
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
                                    {Number(prod.precio).toLocaleString("es", {
                                      minimumFractionDigits: 0,
                                    })}
                                  </div>

                                  {prod.disponible ? (
                                    <div className="flex items-center overflow-hidden rounded-full bg-[var(--color-custom-500)] text-white">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(prod.id)}
                                        className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                                        disabled={cantidad === 0}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="min-w-8 px-2 text-center text-sm font-bold leading-8">
                                        {cantidad}
                                      </span>
                                      <button
                                        type="button"
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
                                        className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80"
                                      >
                                        <Plus size={14} />
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
              className={`hidden w-[380px] shrink-0 transition-all duration-300 lg:sticky lg:top-4 lg:self-start ${
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
        </div>
      </div>

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
