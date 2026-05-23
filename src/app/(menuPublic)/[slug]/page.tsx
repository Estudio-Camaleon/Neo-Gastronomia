import React from "react";
import { createClient } from "@/core/lib/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ShoppingBasket, MapPin, Smartphone, Package } from "lucide-react";

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

  const { data: negocio, error } = await supabase
    .from("negocios")
    .select(
      `
      id, nombre, slug, color_primary, banner_url, logo_url, direccion, whatsapp, horarios,
      categorias (id, nombre, slug, productos (id, nombre, descripcion, precio, imagen_url, disponible))
    `,
    )
    .eq("slug", slug.toLowerCase())
    .single();

  if (error || !negocio) return notFound();

  const categoriasFormateadas =
    (negocio.categorias as unknown as CategoriaConProductos[]) || [];

  return (
    <div className="w-full min-h-screen pb-32">
      {/* Banner Minimalista con Gradiente */}
      <div className="relative w-full h-52 md:h-72 bg-neutral-950 overflow-hidden">
        {negocio.banner_url ? (
          <>
            <Image
              src={negocio.banner_url}
              alt={negocio.nombre}
              fill
              className="object-cover opacity-85"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-neutral-800 to-neutral-900 text-neutral-500 font-medium text-xs tracking-widest uppercase">
            {negocio.nombre}
          </div>
        )}
      </div>

      {/* Perfil Comercial Flotante */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white/90 backdrop-blur-md border border-neutral-200/50 p-6 rounded-2xl shadow-xl shadow-neutral-200/40 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-20 h-20 bg-white rounded-xl border border-neutral-100 p-1 shadow-xs overflow-hidden shrink-0">
            {negocio.logo_url ? (
              <Image
                src={negocio.logo_url}
                alt="Logo"
                fill
                className="object-contain p-2 rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-700 font-bold uppercase text-lg rounded-xl">
                {negocio.nombre.substring(0, 2)}
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {negocio.nombre}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-medium text-neutral-500">
              {negocio.direccion && (
                <span className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full">
                  <MapPin size={13} className="text-neutral-400" />{" "}
                  {negocio.direccion}
                </span>
              )}
              {negocio.whatsapp && (
                <a
                  href={`https://wa.me/${negocio.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-100/60 transition-colors"
                >
                  <Smartphone size={13} /> Pedidos WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid del Menú */}
      <div className="max-w-3xl mx-auto px-4 mt-12 space-y-12">
        {categoriasFormateadas.map((cat) => {
          if (!cat.productos || cat.productos.length === 0) return null;

          return (
            <section key={cat.id} id={cat.slug} className="space-y-5">
              <h3 className="text-base font-semibold text-neutral-800 tracking-tight border-b border-neutral-200/50 pb-2.5">
                {cat.nombre}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.productos.map((prod) => (
                  <div
                    key={prod.id}
                    className={`bg-white border border-neutral-100 p-4 rounded-xl flex gap-4 justify-between items-center transition-all duration-300 hover:shadow-md hover:border-neutral-200/60 ${
                      !prod.disponible ? "opacity-45 select-none" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                      <div>
                        <h4 className="font-medium text-neutral-900 text-sm tracking-tight truncate">
                          {prod.nombre}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {prod.descripcion || "Receta exclusiva de la casa."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-neutral-900 text-sm">
                          $
                          {Number(prod.precio).toLocaleString("es", {
                            minimumFractionDigits: 2,
                          })}
                        </span>

                        {prod.disponible ? (
                          <button
                            style={{
                              backgroundColor: "var(--color-custom)",
                              color: "var(--color-text-custom)",
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 active:scale-[0.97] transition-all duration-200 shadow-2xs cursor-pointer"
                          >
                            <ShoppingBasket size={13} /> Agregar
                          </button>
                        ) : (
                          <span className="bg-neutral-50 text-neutral-400 text-[10px] font-medium uppercase px-2 py-0.5 rounded border border-neutral-100">
                            Agotado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden shrink-0 border border-neutral-100">
                      {prod.imagen_url ? (
                        <Image
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
