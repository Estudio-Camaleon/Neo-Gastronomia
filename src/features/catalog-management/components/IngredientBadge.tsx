"use client";

import { Layers } from "lucide-react";

interface IngredientBadgeProps {
  configuracion: { grupos_opciones?: Array<Record<string, unknown>> } | null;
}

export function IngredientBadge({ configuracion }: IngredientBadgeProps) {
  const cantidadGrupos = configuracion?.grupos_opciones?.length || 0;
  if (cantidadGrupos === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 bg-[#A3FF00] border border-black px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black select-none w-fit">
      <Layers size={9} strokeWidth={3} />
      <span className="text-[9px] font-black uppercase tracking-tighter italic">
        {cantidadGrupos}{" "}
        {cantidadGrupos === 1 ? "Modificador" : "Modificadores"}
      </span>
    </div>
  );
}
