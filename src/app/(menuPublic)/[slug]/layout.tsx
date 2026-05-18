// app/(menuPublic)/[slug]/layout.tsx
import { createClient } from "@/core/lib/supabase/client";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug?: string }>;
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { slug } = await params;
  let brandColor = "#A3FF00"; // Fallback Neon Lime maestro de NEO

  if (slug) {
    const supabase = createClient();
    const { data: negocio } = await supabase
      .from("negocios")
      .select("color_primary")
      .eq("slug", slug.toLowerCase())
      .single();

    if (negocio?.color_primary) {
      brandColor = negocio.color_primary;
    }
  }

  return (
    <div
      style={
        {
          "--custom-brand-color": brandColor,
          "--color-custom": brandColor,
        } as React.CSSProperties
      }
      className="min-h-screen bg-white text-black transition-colors duration-300 font-sans antialiased selection:bg-black selection:text-white"
    >
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
