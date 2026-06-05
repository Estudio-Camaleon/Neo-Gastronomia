import React from "react";
import { createClient } from "@/core/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogClient } from "@/features/public-menu/components/CatalogClient";
import type { Categoria, NegocioPublico } from "@/features/public-menu/types";
import type { PromoRow } from "@/core/types/domain";

export const revalidate = 60;

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

  const title = `${negocio.nombre} | Menú Online`;
  const description =
    negocio.descripcion ||
    `Pedí online en ${negocio.nombre} a través de NEO.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_AR",
      siteName: "NEO",
      ...(negocio.banner_url
        ? { images: [{ url: negocio.banner_url, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(negocio.banner_url ? { images: [negocio.banner_url] } : {}),
    },
  };
}

export default async function PublicMenuPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: negocios } = await supabase
    .from("negocios")
    .select(
      "id, nombre, slug, color_primary, banner_url, banner_posicion, logo_url, logo_scale, mostrar_nombre, direccion, localidad, direccion_notas, whatsapp, instagram_url, facebook_url, tiktok_url, horarios",
    )
    .eq("slug", slug.toLowerCase())
    .limit(1)
    .returns<NegocioPublico[]>();

  const negocio = negocios?.[0] ?? null;
  if (!negocio) return notFound();

  const { data: categorias } = await supabase
    .from("categorias")
    .select(
      "id, nombre, slug, productos (id, nombre, descripcion, precio, imagen_url, disponible, configuracion)",
    )
    .eq("negocio_id", negocio.id)
    .order("nombre")
    .returns<Categoria[]>();

  const categoriasFormateadas =
    categorias?.filter(
      (cat) => cat.productos && cat.productos.length > 0,
    ) || [];

  const { data: promos } = await supabase
    .from("promos")
    .select("*")
    .eq("negocio_id", negocio.id)
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .returns<PromoRow[]>();

  return (
    <CatalogClient
      negocio={negocio}
      categorias={categoriasFormateadas}
      promos={promos ?? []}
    />
  );
}
