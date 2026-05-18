import React from "react";
import { createClient } from "@/core/lib/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBasket,
  MapPin,
  Smartphone,
  Clock,
  Package,
} from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
}

interface CategoriaConProductos {
  id: string;
  nombre: string;
  slug: string;
  productos: Producto[];
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const supabase = createClient();

  // Sincronización relacional en una sola query optimizada
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select(
      `
      id,
      nombre,
      slug,
      color_primary,
      banner_url,
      logo_url,
      direccion,
      whatsapp,
      horarios,
      categorias (
        id,
        nombre,
        slug,
        productos (
          id,
          nombre,
          descripcion,
          precio,
          imagen_url,
          disponible
        )
      )
    `,
    )
    .eq("slug", slug.toLowerCase())
    .single();

  if (error || !negocio) {
    return notFound();
  }

  // Casting limpio y seguro erradicando fallas del compilador
  const categoriasFormateadas =
    (negocio.categorias as unknown as CategoriaConProductos[]) || [];

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-32">
      {/* BANNER DE COBERTURA BRUTALISTA */}
      <div className="relative w-full h-44 md:h-64 border-b-4 border-black bg-black">
        {negocio.banner_url ? (
          <Image
            src={negocio.banner_url}
            alt={negocio.nombre}
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-500">
            [ INFRAESTRUCTURA VISUAL // NEO ]
          </div>
        )}
      </div>

      {/* TARJETA DE MARCA DEL LOCAL FLOTANTE */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-24 h-24 border-4 border-black bg-white shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {negocio.logo_url ? (
              <Image
                src={negocio.logo_url}
                alt="Logo"
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black font-black uppercase text-xl">
                NEO
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1 w-full">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
              {negocio.nombre}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 font-mono text-[10px] font-black uppercase text-gray-500 tracking-wider">
              {negocio.direccion && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {negocio.direccion}
                </span>
              )}
              {negocio.whatsapp && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Smartphone size={12} /> Linea Despacho
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ORQUESTACIÓN DEL CATÁLOGO (RESOLUCIÓN DEL ERROR DE LINT SCRIPTS) */}
      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-10">
        {categoriasFormateadas.map((cat) => {
          // Filtramos para renderizar solo secciones que posean ítems activos
          if (!cat.productos || cat.productos.length === 0) return null;

          return (
            <section key={cat.id} id={cat.slug} className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight bg-black text-white px-3 py-1.5 w-fit italic transform -rotate-1 shadow-[2px_2px_0px_0px_var(--color-custom)]">
                // {cat.nombre}
              </h3>

              {/* Bento Grid responsiva de ítems del menú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.productos.map((prod) => (
                  <div
                    key={prod.id}
                    className={`bg-white border-2 border-black p-4 flex gap-4 transition-all hover:translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${!prod.disponible ? "opacity-50 select-none" : ""}`}
                  >
                    <div className="flex-1 space-y-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-black uppercase text-sm tracking-tight text-black leading-tight">
                          {prod.nombre}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-tight">
                          {prod.descripcion ||
                            "Sin descripción técnica en terminal"}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between pt-2">
                        <span className="font-mono font-black italic text-md text-black">
                          ${Number(prod.precio).toFixed(2)}
                        </span>
                        {prod.disponible ? (
                          <button
                            style={{ backgroundColor: "var(--color-custom)" }}
                            className="border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-black uppercase text-[10px] flex items-center justify-center gap-1"
                          >
                            <ShoppingBasket size={12} strokeWidth={2.5} /> Pedir
                          </button>
                        ) : (
                          <span className="bg-gray-100 border border-black text-gray-400 text-[9px] font-mono font-black uppercase px-2 py-1">
                            Agotado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative w-20 h-20 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100 overflow-hidden shrink-0">
                      {prod.imagen_url ? (
                        <Image
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {categoriasFormateadas.length === 0 && (
          <div className="py-20 text-center border-4 border-dashed border-black/10 bg-white">
            <Clock className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="font-black font-mono text-xs uppercase text-gray-400 tracking-wider">
              Catálogo en proceso de carga remota.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
