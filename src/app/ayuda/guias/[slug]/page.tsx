import { notFound } from "next/navigation";
import { GuideDetail } from "@/features/ayuda/components/GuideDetail";
import { getGuideBySlug, guias } from "@/features/ayuda/data/guias";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guias.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guía no encontrada — NEO" };
  return {
    title: `${guide.title} — NEO`,
    description: guide.description,
  };
}

export default async function GuiaSlugPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return <GuideDetail guide={guide} />;
}
