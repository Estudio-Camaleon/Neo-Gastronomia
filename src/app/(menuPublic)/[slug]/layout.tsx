import { createClient } from "@/core/lib/supabase/client";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug?: string }>;
}

// Algoritmo matemático para cálculo de contraste lumínico YIQ
function getContrastYIQ(hexcolor: string): string {
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#FFFFFF";
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { slug } = await params;
  let brandColor = "#10b981"; // Fallback seguro corporativo

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

  const textColor = getContrastYIQ(brandColor);

  return (
    <div
      style={
        {
          "--color-custom": brandColor,
          "--color-text-custom": textColor,
        } as React.CSSProperties
      }
      className="min-h-screen bg-neutral-50/60 text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white"
    >
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
