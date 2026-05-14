import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/menu/ui/public-navbar";
import { MenuWrapper } from "@/components/menu/MenuWrapper";

// 🚀 SOLUCIÓN: Definimos las interfaces con la estructura exacta que devuelven tus tablas de Supabase
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

// OPTIMIZACIÓN CRÍTICA: Forzamos a Next.js a bypassear la caché estática y leer en vivo
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Traemos el registro completo del negocio sincronizando sus relaciones en una sola consulta relacional
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

  // Control de fallos: Si da error o el slug no mapea con nada en la BD, disparamos el 404 nativo
  if (error || !negocio) {
    return notFound();
  }

  // 🚀 SOLUCIÓN: Casteamos los datos relacionales de Supabase usando la interfaz estricta que creamos arriba
  // Esto hace que coincida al 100% con lo que espera recibir el MenuWrapper
  const categoriasFormateadas =
    (negocio.categorias as unknown as CategoriaConProductos[]) || [];

  return (
    <div className="w-full min-h-screen pb-24">
      {/* 1. NAVBAR DE MARCA ESTILO MOCKUP (OCUPA EL 100% DEL ANCHO) */}
      <PublicNavbar
        nombre={negocio.nombre}
        logoUrl={negocio.logo_url}
        bannerUrl={negocio.banner_url}
        direccion={negocio.direccion}
        colorConfig={negocio.color_primary || "#1c7a42"}
        horariosRaw={negocio.horarios}
      />

      {/* 2. ORQUESTADOR INTERACTIVO DEL CATÁLOGO DE PRODUCTOS (PROTEGIDO EN EL CENTRO) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <MenuWrapper
          negocioId={negocio.id}
          categorias={categoriasFormateadas} // 🟢 ¡Rojo solucionado! Ahora TypeScript ve que los tipos encajan
          colorConfig={negocio.color_primary || "#1c7a42"}
        />
      </div>
    </div>
  );
}
