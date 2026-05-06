"use client";

import Link from "next/link";
import Image from "next/image";

interface SidebarLogoProps {
  mounted: boolean;
  theme: string;
}

export function SidebarLogo({ mounted, theme }: SidebarLogoProps) {
  return (
    <div className="mb-8">
      <Link href="/pedidos" className="inline-block transition-transform active:scale-95">
        <div className="relative h-8 w-28">
          <Image
            src={mounted && theme === "dark" ? "/icons/neo_logo_blanco.svg" : "/icons/neo_logo_negro.svg"}
            alt="Logo NEO"
            fill
            priority
            className="object-contain transition-opacity duration-300"
          />
        </div>
      </Link>
    </div>
  );
}