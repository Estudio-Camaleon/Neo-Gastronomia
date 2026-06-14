import type { MetadataRoute } from "next";
import { createClient } from "@/core/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neo.app";

  const supabase = await createClient();
  const { data: negocios } = await supabase
    .from("negocios")
    .select("slug, updated_at")
    .limit(500);

  const menuUrls =
    negocios?.map((neg) => ({
      url: `${baseUrl}/${neg.slug}`,
      lastModified: neg.updated_at ? new Date(neg.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    ...menuUrls,
  ];
}
