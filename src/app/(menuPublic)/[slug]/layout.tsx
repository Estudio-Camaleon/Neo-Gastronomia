import { createClient } from "@/core/lib/supabase/server";
import { buildBrandPalette, getContrastYIQ } from "@/core/lib/utils/color";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { slug } = await params;
  let brandColor = "#10b981";

  if (slug) {
    const supabase = await createClient();
    const { data: negocios } = await supabase
      .from("negocios")
      .select("color_primary")
      .eq("slug", slug.toLowerCase())
      .limit(1);

    const negocio = negocios?.[0] ?? null;
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
          "--color-custom-50": palette["50"],
          "--color-custom-100": palette["100"],
          "--color-custom-200": palette["200"],
          "--color-custom-300": palette["300"],
          "--color-custom-400": palette["400"],
          "--color-custom-500": palette["500"],
          "--color-custom-600": palette["600"],
          "--color-custom-700": palette["700"],
          "--color-custom-800": palette["800"],
          "--color-custom-900": palette["900"],
          "--color-custom-950": palette["950"],
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
      className="relative min-h-screen bg-[var(--color-custom-surface)] text-[var(--color-custom-text)] font-sans antialiased selection:bg-[var(--color-custom-deep)] selection:text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <svg
          className="absolute -top-12 -left-8 md:-left-24 w-[420px] md:w-[520px] h-[420px] md:h-[520px] opacity-60"
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="blurA" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="36" result="b" />
            </filter>
          </defs>
          <g
            fill="var(--color-custom-500)"
            fillOpacity="0.18"
            style={{ mixBlendMode: "overlay" }}
            filter="url(#blurA)"
          >
            <path d="M421.6,356.9Q390,463,282.9,453.8Q175.8,444.7,116.8,364.1Q57.8,283.5,99.2,191.3Q140.7,99.1,236.1,90.6Q331.6,82.1,403.6,139.2Q475.6,196.3,421.6,356.9Z" />
          </g>
        </svg>

        <svg
          className="absolute -bottom-12 -right-8 md:-bottom-28 md:-right-24 w-[480px] md:w-[640px] h-[480px] md:h-[640px] opacity-55"
          viewBox="0 0 800 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="blurB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="44" result="b" />
            </filter>
          </defs>
          <g
            fill="var(--color-custom-500)"
            fillOpacity="0.14"
            style={{ mixBlendMode: "overlay" }}
            filter="url(#blurB)"
          >
            <path d="M621.4,476.9Q584,653,426.4,697.5Q268.8,742,160.3,630.5Q51.8,519,95.6,345.5Q139.4,172,284.8,124.2Q430.2,76.3,554.1,164.2Q678,252,621.4,476.9Z" />
          </g>
        </svg>
      </div>

      <main className="w-full relative z-10">{children}</main>

      <style>{`
        .public-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .public-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .public-scrollbar::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--color-custom-900) 20%, transparent);
          border-radius: 99px;
        }
        .public-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: color-mix(in srgb, var(--color-custom-900) 20%, transparent) transparent;
        }
        .receipt-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .receipt-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .receipt-scrollbar::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--color-custom-900) 15%, transparent);
          border-radius: 0;
        }
        .receipt-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: color-mix(in srgb, var(--color-custom-900) 15%, transparent) transparent;
        }
      `}</style>
    </div>
  );
}
