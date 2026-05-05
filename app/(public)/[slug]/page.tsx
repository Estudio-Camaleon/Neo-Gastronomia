import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MenuContent } from "@/components/menu/MenuContent";

// Interfaces estrictas locales alineadas perfectamente con los componentes hijos
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
  slug: string; // Incluido para emparejar con la interfaz de MenuContent
  productos: Producto[];
}

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Página Principal del Menú Público - Versión Estable y Saneada.
 */
export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Obtención de datos del negocio (Con las columnas de branding en producción)
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("id, nombre, logo_url, banner_url, descripcion, slug")
    .eq("slug", slug)
    .single();

  if (negocioError || !negocio) {
    console.error(
      "DEBUG NEO -> Error al cargar negocio:",
      negocioError?.message,
    );
    return notFound();
  }

  // 2. Carga de categorías y productos vinculados
  const { data: categorias } = await supabase
    .from("categorias")
    .select(
      `
      id,
      nombre,
      productos (
        id,
        nombre,
        descripcion,
        precio,
        imagen_url,
        disponible
      )
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("nombre", { ascending: true });

  // 3. Procesamiento de datos con Tipado Estricto
  // Desestructuramos explícitamente para inyectar el 'slug' requerido por MenuContent
  const menuData: CategoriaConProductos[] =
    (categorias as any)
      ?.map((cat: any) => ({
        id: cat.id,
        nombre: cat.nombre,
        slug: cat.slug || "", // Seteamos fallback seguro para cumplir el contrato del componente
        productos: (cat.productos || []).filter((p: Producto) => p.disponible),
      }))
      .filter((cat: CategoriaConProductos) => cat.productos.length > 0) || [];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-bg-dark selection:bg-primary">
      {/* Header Neo-Brutalista con Banner Dinámico */}
      <header className="relative h-48 md:h-64 bg-black flex flex-col items-center justify-center overflow-hidden border-b-4 border-primary">
        {negocio.banner_url ? (
          <Image
            src={negocio.banner_url}
            alt={`Portada de ${negocio.nombre}`}
            fill
            priority
            className="object-cover opacity-50"
          />
        ) : (
          /* Fondo de reserva si el local no cargó una portada aún */
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black opacity-60" />
        )}

        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          {negocio.logo_url && (
            <div className="mb-4">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden">
                <Image
                  src={negocio.logo_url}
                  alt={`Logo de ${negocio.nombre}`}
                  fill
                  sizes="(max-width: 768px) 80px, 96px"
                  className="object-contain animate-in zoom-in duration-500"
                />
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-xl">
            {negocio.nombre}
          </h1>

          {negocio.descripcion && (
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide mt-1 max-w-md line-clamp-2">
              {negocio.descripcion}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="h-[2px] w-8 bg-primary rounded-full" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
              Menu Digital
            </span>
            <span className="h-[2px] w-8 bg-primary rounded-full" />
          </div>
        </div>
      </header>

      {/* Contenido Principal: Listado de Productos y Carrito */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <MenuContent negocioId={negocio.id} categorias={menuData} />
      </main>

      {/* Footer con Identidad NEO */}
      <footer className="py-20 border-t border-border/30 flex flex-col items-center justify-center opacity-30 select-none">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2 text-text-muted">
          Plataforma de gestión
        </p>
        <h2 className="text-4xl font-black italic tracking-tighter text-text-primary">
          NEO
        </h2>
      </footer>

      {/* Capa de textura sutil para el acabado visual */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
