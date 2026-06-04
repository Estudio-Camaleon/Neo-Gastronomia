import React from "react";
import { createClient } from "@/core/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogClient } from "@/features/public-menu/components/CatalogClient";
import type { Categoria, NegocioPublico } from "@/features/public-menu/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: negocios } = await supabase
    .from("negocios")
    .select("nombre, descripcion, banner_url")
    .eq("slug", slug.toLowerCase())
    .limit(1);

  const negocio = negocios?.[0] ?? null;
  if (!negocio) return { title: "Local no encontrado | NEO" };

  return {
    title: `${negocio.nombre} | Menú Online`,
    description:
      negocio.descripcion ||
      `Pedí online en ${negocio.nombre} a través de NEO.`,
    openGraph: negocio.banner_url
      ? { images: [{ url: negocio.banner_url }] }
      : undefined,
  };
}

export default async function PublicMenuPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: negocios } = await supabase
    .from("negocios")
    .select(
      `
      id, nombre, slug, color_primary, banner_url, logo_url, direccion, localidad, direccion_notas, whatsapp, instagram_url, facebook_url, tiktok_url, horarios,
      categorias (id, nombre, slug, productos (id, nombre, descripcion, precio, imagen_url, disponible, configuracion))
    `,
    )
    .eq("slug", slug.toLowerCase())
    .limit(1);

  const negocio = negocios?.[0] ?? null;
  if (!negocio) return notFound();

  const categoriasFormateadas =
    (negocio.categorias as Categoria[])?.filter(
      (cat) => cat.productos && cat.productos.length > 0,
    ) || [];

  return (
    <CatalogClient
      negocio={negocio as NegocioPublico}
      categorias={categoriasFormateadas}
    />
  );
}
