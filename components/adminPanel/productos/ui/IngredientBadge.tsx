"use client";

import { Layers } from "lucide-react";

interface IngredientBadgeProps {
  configuracion: { grupos_opciones?: Array<Record<string, unknown>> } | null;
}

export function IngredientBadge({ configuracion }: IngredientBadgeProps) {
  // Calculamos la cantidad de grupos de ingredientes (ej: "Extras", "Salsas", etc.)
  const cantidadGrupos = configuracion?.grupos_opciones?.length || 0;

  // Si no tiene personalización, no renderizamos nada para no ensuciar la tabla
  if (cantidadGrupos === 0) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 bg-yellow-300 dark:bg-primary border-2 border-black px-2 py-0.5 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-help group relative"
      title={`${cantidadGrupos} grupo(s) de personalización`}
    >
      <Layers size={10} className="text-black" strokeWidth={3} />
      <span className="text-[9px] font-black uppercase italic tracking-tighter text-black">
        {cantidadGrupos} {cantidadGrupos === 1 ? "Extra" : "Extras"}
      </span>

      {/* Tooltip Neo-Brutalista (Opcional, se muestra al hacer hover) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-black text-white text-[8px] font-bold uppercase px-2 py-1 rounded border border-white whitespace-nowrap">
          Producto Personalizable
        </div>
        <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1 border-r border-b border-white"></div>
      </div>
    </div>
  );
}
