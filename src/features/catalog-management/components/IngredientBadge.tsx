"use client";

import { Layers } from "lucide-react";

interface IngredientBadgeProps {
  configuracion: { grupos_opciones?: Array<Record<string, unknown>> } | null;
}

export function IngredientBadge({ configuracion }: IngredientBadgeProps) {
  const cantidadGrupos = configuracion?.grupos_opciones?.length || 0;
  if (cantidadGrupos === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/40 px-2 py-0.5 rounded-md text-blue-700 dark:text-blue-400 select-none w-fit">
      <Layers size={10} className="text-blue-500 dark:text-blue-400" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {cantidadGrupos} {cantidadGrupos === 1 ? "Extra" : "Extras"}
      </span>
    </div>
  );
}
