"use client";

import { Palette, Info } from "lucide-react";

interface CatalogDesignSectionProps {
  colorPrimary: string;
  onChange: (val: string) => void;
}

export function CatalogDesignSection({
  colorPrimary,
  onChange,
}: CatalogDesignSectionProps) {
  return (
    <div className="bg-white border-4 border-black p-4 md:p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-sans h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b-4 border-black pb-3">
          <Palette size={18} className="stroke-[2.5]" />
          <h2 className="font-black uppercase italic text-sm tracking-tight">
            Esquema Cromático Público
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <input
                type="color"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className="w-14 h-14 border-2 border-black cursor-pointer appearance-none bg-transparent overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              />
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-mono font-black uppercase text-gray-400 block">
                HEXADECIMAL CORE
              </label>
              <input
                type="text"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 bg-white border-2 border-black font-mono font-black text-sm uppercase text-black"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>

          {/* MUESTRA DINÁMICA ATÓMICA */}
          <div
            className="p-3 border-2 border-black flex items-center justify-center font-black text-[10px] uppercase tracking-widest text-white shadow-[2px_2px_0px_0px_#000000]"
            style={{ backgroundColor: colorPrimary }}
          >
            <span className="mix-blend-difference bg-black/30 px-2 py-0.5">
              Muestra Activa de Runtime
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-black p-3 flex gap-2 mt-4">
        <Info size={14} className="shrink-0 text-gray-400 mt-0.5" />
        <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
          Este tono controlará de manera reactiva la tonalidad de los CTA,
          badges de extras y carritos en el catálogo del comensal.
        </p>
      </div>
    </div>
  );
}
