import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neo.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/pedidos/",
          "/productos/",
          "/configuracion/",
          "/clientes/",
          "/admin/",
          "/api/",
          "/onboarding/",
          "/callback/",
          "/reset-password/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
