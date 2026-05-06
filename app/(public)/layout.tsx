// app/(public)/layout.tsx
import { createClient } from "@/lib/supabase/server";
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
  let brandColor = "#1c7a42"; // Fallback verde de NEO

  if (slug) {
    const supabase = await createClient();
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
      // 🚀 Doble inyección estricta para herencia total en Tailwind v4
      style={
        {
          "--custom-brand-color": brandColor,
          "--color-custom": brandColor,
        } as React.CSSProperties
      }
      className="min-h-screen bg-bg-main dark:bg-bg-dark text-text-primary dark:text-text-inverse transition-colors duration-300 font-sans"
    >
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
