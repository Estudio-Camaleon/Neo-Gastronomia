import React from "react";
import { createClient } from "@/core/lib/supabase/client";
import { notFound } from "next/navigation";
import { CatalogClient } from "./CatalogClient";

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

  // Filtramos categorías vacías desde el servidor para no enviar basura al cliente
  const categoriasFormateadas =
    (negocio.categorias as any[])?.filter(
      (cat) => cat.productos && cat.productos.length > 0,
    ) || [];

  return <CatalogClient negocio={negocio} categorias={categoriasFormateadas} />;
}
