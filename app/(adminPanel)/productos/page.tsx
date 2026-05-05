import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

// Componentes de la sección
import { ProductoForm } from "@/components/adminPanel/productos/ProductoForm";
import { CategoriaManager } from "@/components/adminPanel/productos/CategoriaManager";
import { ProductTable } from "@/components/adminPanel/productos/ProductTable";

/**
 * Panel de Gestión de Inventario NEO.
 * Centraliza la administración de categorías y productos vinculados al negocio del usuario.
 */
export default async function ProductosAdminPage() {
  const supabase = await createClient();

  // 1. Verificación de sesión y obtención de usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtención de los datos del negocio del dueño
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .single();

  if (!negocio) redirect("/configuracion");

  // 3. Carga paralela de categorías y productos para optimizar performance
  const [categoriasResponse, productosResponse] = await Promise.all([
    supabase
      .from("categorias")
      .select("*")
      .eq("negocio_id", negocio.id)
      .order("nombre", { ascending: true }),
    supabase
      .from("productos")
      .select(
        `
        *,
        categorias (
          nombre
        )
      `,
      )
      .eq("negocio_id", negocio.id)
      .order("created_at", { ascending: false }),
  ]);

  const categorias = categoriasResponse.data || [];
  const productos = productosResponse.data || [];

  return (
    <div className="p-6 md:p-10 space-y-12 min-h-screen pb-32 max-w-7xl mx-auto">
      {/* Header de Sección */}
      <header className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-2 mb-2">
          <Package className="text-primary w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            Inventory & Catalog System
          </span>
        </div>
        <h1 className="text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
          Menú & Stock
        </h1>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-2">
          Administrando el catálogo de{" "}
          <span className="text-primary">{negocio.nombre}</span>
        </p>
      </header>

      {/* Grid de Gestión Superior */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Columna: Gestión de Categorías (1/3) */}
        <div className="lg:col-span-1 h-full">
          <CategoriaManager negocioId={negocio.id} categorias={categorias} />
        </div>

        {/* Columna: Formulario de Alta de Producto (2/3) */}
        <div className="lg:col-span-2">
          <ProductoForm negocioId={negocio.id} categorias={categorias} />
        </div>
      </div>

      {/* Sección Inferior: Listado de Inventario */}
      <section className="space-y-6 pt-6 animate-in fade-in duration-700 delay-200">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter whitespace-nowrap">
            Inventario Activo
          </h2>
          <div className="h-[2px] w-full bg-border/30" />
        </div>

        {/* Tabla principal de productos con acciones de edición/borrado */}
        <ProductTable productos={productos} />
      </section>

      {/* Footer Técnico */}
      <footer className="pt-12 border-t border-dashed border-border opacity-30 flex justify-between items-center">
        <p className="text-[9px] font-black uppercase tracking-widest italic">
          NEO Catalog Engine v1.2
        </p>
        <div className="flex gap-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest">
            Database Linked
          </span>
        </div>
      </footer>
    </div>
  );
}
