"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  MapPin,
  Smartphone,
  Plus,
  Image as ImageIcon,
  Clock,
  Info,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa6";
import { useCartStore } from "@/features/public-menu/cart/useCartStore";

// 1. Exportamos los tipos para que page.tsx pueda consumirlos
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

// Interfaz estricta para el negocio en la vista pública
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

export function CatalogClient({ negocio, categorias }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showInfo, setShowInfo] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Filtrado reactivo
  const categoriasFiltradas = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeCategory === "all") return categorias;
      return categorias.filter((c) => c.id === activeCategory);
    }
    const query = searchQuery.toLowerCase();
    return categorias
      .map((cat) => ({
        ...cat,
        productos: cat.productos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(query) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(query)),
        ),
      }))
      .filter((cat) => cat.productos.length > 0);
  }, [categorias, searchQuery, activeCategory]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    if (id !== "all") {
      const element = document.getElementById(`cat-${id}`);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  const diasOrdenados = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] pb-32 font-sans selection:bg-[var(--color-custom)] selection:text-[var(--color-text-custom)]">
      {/* HEADER ENRIQUECIDO (Banner + Info) */}
      <div className="bg-white pb-6 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] rounded-b-3xl relative z-20">
        <div className="relative w-full h-32 md:h-48 bg-neutral-900 overflow-hidden">
          {negocio.banner_url && (
            <Image
              src={negocio.banner_url}
              alt="Portada del negocio"
              fill
              className="object-cover opacity-80"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center text-center -mt-12 relative z-10">
          <div className="relative w-24 h-24 bg-white rounded-full border-4 border-white shadow-md overflow-hidden mb-3">
            {negocio.logo_url ? (
              <Image
                src={negocio.logo_url}
                alt="Logo"
                fill
                className="object-contain p-1"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-50 text-neutral-400 font-bold text-xl">
                {negocio.nombre.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-1">
            {negocio.nombre}
          </h1>
          {(negocio.direccion || negocio.localidad) && (
            <p className="text-[13px] text-neutral-500 mb-3 flex items-center justify-center gap-1">
              <MapPin size={14} className="shrink-0" />
              <span>
                {negocio.direccion}
                {negocio.localidad ? `, ${negocio.localidad}` : ""}
              </span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {negocio.whatsapp && (
              <a
                href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "var(--color-custom)",
                  color: "var(--color-text-custom)",
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                <Smartphone size={14} /> Pedir
              </a>
            )}

            <div className="flex items-center gap-2.5 bg-neutral-100/80 px-3 py-1.5 rounded-full text-neutral-600">
              {negocio.instagram_url && (
                <a
                  href={negocio.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-custom)] hover:scale-110 transition-all"
                >
                  <FaInstagram size={15} />
                </a>
              )}
              {negocio.facebook_url && (
                <a
                  href={negocio.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-custom)] hover:scale-110 transition-all"
                >
                  <FaFacebookF size={14} />
                </a>
              )}
              {negocio.tiktok_url && (
                <a
                  href={negocio.tiktok_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-custom)] hover:scale-110 transition-all"
                >
                  <FaTiktok size={14} />
                </a>
              )}
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-1.5 bg-neutral-100/80 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <Info size={14} /> Info
            </button>
          </div>

          {showInfo && (
            <div className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-inner">
              {negocio.direccion_notas && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin size={12} /> Indicaciones de llegada
                  </h4>
                  <p className="text-[13px] text-neutral-600 leading-relaxed bg-white p-2.5 rounded-lg border border-neutral-100">
                    {negocio.direccion_notas}
                  </p>
                </div>
              )}

              {negocio.horarios && Object.keys(negocio.horarios).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock size={12} /> Horarios de Atención
                  </h4>
                  <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden divide-y divide-neutral-50 text-[12px]">
                    {diasOrdenados.map((dia) => {
                      const jornada = negocio.horarios![dia];
                      if (!jornada) return null;
                      return (
                        <div
                          key={dia}
                          className="flex justify-between px-3 py-2"
                        >
                          <span className="capitalize font-medium text-neutral-700">
                            {dia}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">
                            {/* 2. Removemos el "any" y aplicamos nuestro tipo Turno */}
                            {jornada.turnos
                              ?.map((t: Turno) => `${t.inicio} a ${t.fin}`)
                              .join(" | ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN Y BÚSQUEDA */}
      <div className="sticky top-0 z-30 bg-[#fcfbf9]/95 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[var(--color-custom)] transition-colors" />
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-[13px] font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all shadow-sm"
              style={{ outlineColor: "var(--color-custom)" }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => scrollToCategory("all")}
              style={
                activeCategory === "all"
                  ? {
                      backgroundColor: "var(--color-custom)",
                      color: "var(--color-text-custom)",
                    }
                  : {}
              }
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all shrink-0 ${
                activeCategory === "all"
                  ? "shadow-md"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Todo
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                style={
                  activeCategory === cat.id
                    ? {
                        backgroundColor: "var(--color-custom)",
                        color: "var(--color-text-custom)",
                      }
                    : {}
                }
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? "shadow-md"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-10">
        {categoriasFiltradas.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 font-medium text-sm">
            No encontramos productos para tu búsqueda.
          </div>
        ) : (
          categoriasFiltradas.map((cat) => (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              className="space-y-4 pt-2"
            >
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight pl-1 border-b border-neutral-200/50 pb-2">
                {cat.nombre}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {cat.productos.map((prod) => (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col transition-transform duration-200 hover:shadow-md ${
                      !prod.disponible ? "opacity-50 grayscale select-none" : ""
                    }`}
                  >
                    <div className="relative w-full aspect-square bg-neutral-50 border-b border-neutral-100">
                      {prod.imagen_url ? (
                        <Image
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <ImageIcon size={24} />
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-neutral-100/50">
                        <span className="font-bold text-neutral-900 text-[13px]">
                          $
                          {Number(prod.precio).toLocaleString("es", {
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>

                      {!prod.disponible && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-neutral-900 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                            Agotado
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-[13px] leading-tight line-clamp-2">
                          {prod.nombre}
                        </h3>
                        {prod.descripcion && (
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                            {prod.descripcion}
                          </p>
                        )}
                      </div>

                      {prod.disponible && (
                        <button
                          onClick={() =>
                            addItem({
                              id: prod.id,
                              producto_id: prod.id,
                              nombre: prod.nombre,
                              precio: prod.precio,
                              cantidad: 1,
                              detalles: null,
                            })
                          }
                          style={{
                            backgroundColor: "var(--color-custom)",
                            color: "var(--color-text-custom)",
                          }}
                          className="w-full py-2 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all shadow-sm"
                        >
                          <Plus size={16} /> Agregar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
