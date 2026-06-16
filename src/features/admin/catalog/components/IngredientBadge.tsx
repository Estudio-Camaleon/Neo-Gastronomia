"use client";

import { Layers } from "lucide-react";

interface IngredientBadgeProps {
  configuracion: { grupos_opciones?: Array<Record<string, unknown>> } | null;
}

export function IngredientBadge({ configuracion }: IngredientBadgeProps) {
  const cantidadGrupos = configuracion?.grupos_opciones?.length || 0;
  if (cantidadGrupos === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/20 px-2 py-0.5 rounded-md text-[var(--admin-accent)] select-none w-fit">
      <Layers size={10} className="text-[var(--admin-accent)]" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {cantidadGrupos} {cantidadGrupos === 1 ? "Extra" : "Extras"}
      </span>
    </div>
  );
}
