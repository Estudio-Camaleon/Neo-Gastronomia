import { createClient } from "@/core/lib/supabase/server";
import { buildBrandPalette } from "@/core/lib/utils/color";
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

  const palette = buildBrandPalette(brandColor);
  const textColor = getContrastYIQ(brandColor);

  return (
    <div
      style={
        {
          "--color-custom": palette.base,
          "--color-custom-50": palette.softAlt,
          "--color-custom-100": palette.soft,
          "--color-custom-200": palette.soft,
          "--color-custom-500": palette.base,
          "--color-custom-600": palette.deep,
          "--color-custom-700": palette.deep,
          "--color-custom-900": palette.darker,
          "--color-custom-950": palette.darker,
          "--color-custom-soft": palette.soft,
          "--color-custom-soft-2": palette.softAlt,
          "--color-custom-deep": palette.deep,
          "--color-custom-darker": palette.darker,
          "--color-custom-surface": palette.surface,
          "--color-custom-surface-strong": palette.surfaceStrong,
          "--color-custom-border": palette.border,
          "--color-custom-text": palette.text,
          "--color-custom-text-muted": palette.textMuted,
          "--color-text-custom": textColor,
          "--admin-accent": palette.base,
          "--admin-accent-soft": palette.soft,
          "--admin-accent-strong": palette.deep,
        } as React.CSSProperties
      }
      className="min-h-screen bg-[var(--color-custom-surface)] text-[var(--color-custom-text)] font-sans antialiased selection:bg-[var(--color-custom-deep)] selection:text-white"
    >
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
