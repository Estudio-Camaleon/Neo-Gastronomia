import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MenuWrapper } from "@/components/menu/MenuWrapper";

// 1. Interfaces estrictas locales alineadas con los componentes hijos
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

// Interfaz que representa el contrato exacto de la consulta relacional con Supabase
interface SupabaseCategoriaRow {
  id: string;
  nombre: string;
  slug: string | null;
  productos: Producto[];
}

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Página Principal del Menú Público - Versión Estable sin 'any'.
 */
export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Obtención de datos del negocio (Incluyendo color_primary para el branding dinámico)
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select(
      "id, nombre, logo_url, banner_url, descripcion, slug, color_primary",
    )
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
      slug,
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

  // 3. Procesamiento seguro usando un doble caspeo controlado (unknown -> FilaSupabase) para erradicar el error de 'any'
  const rawCategorias = (categorias || []) as unknown as SupabaseCategoriaRow[];

  const menuData: CategoriaConProductos[] = rawCategorias
    .map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      slug: cat.slug || "",
      // Filtramos en el servidor para mandar al cliente únicamente los ítems que estén marcados como disponibles
      productos: (cat.productos || []).filter((p) => p.disponible),
    }))
    .filter((cat) => cat.productos.length > 0);

  return (
    <div className="min-h-screen bg-bg-main dark:bg-bg-dark selection:bg-primary relative">
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

      {/* Contenido Principal Responsivo con inyección de datos limpia */}
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <MenuWrapper
          negocioId={negocio.id}
          categorias={menuData}
          colorConfig={negocio.color_primary || "#10b981"}
        />
      </main>

      {/* Footer Técnico */}
      <footer className="py-20 border-t border-border/30 dark:border-border-dark/30 flex flex-col items-center justify-center opacity-30 select-none">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2 text-text-muted">
          Plataforma de gestión
        </p>
        <h2 className="text-4xl font-black italic tracking-tighter text-text-primary dark:text-text-inverse">
          NEO
        </h2>
      </footer>

      {/* Capa de textura sutil de grano */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
