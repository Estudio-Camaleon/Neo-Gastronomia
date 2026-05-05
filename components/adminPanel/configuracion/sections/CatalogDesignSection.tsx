"use client";

import { Palette } from "lucide-react";

interface CatalogDesignSectionProps {
  colorPrimary: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CatalogDesignSection({
  colorPrimary,
  onChange,
}: CatalogDesignSectionProps) {
  return (
    <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 space-y-6 shadow-sm transition-colors font-sans">
      {/* Cabecera de Sección */}
      <div className="flex items-center gap-3">
        <Palette className="text-primary w-5 h-5" />
        <h2 className="font-black uppercase italic tracking-tight text-lg text-text-primary dark:text-text-inverse">
          Diseño de Catálogo
        </h2>
      </div>

      {/* Control del Color Picker */}
      <div className="flex flex-col items-start gap-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
          Color de Identidad (Acentos)
        </label>

        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              type="color"
              name="color_primary"
              value={colorPrimary}
              onChange={onChange}
              className="w-16 h-16 rounded-full border-4 border-white dark:border-bg-dark shadow-xl cursor-pointer appearance-none bg-transparent"
              title="Seleccionar color de acento"
            />
          </div>

          <div className="space-y-1.5">
            {/* Código Hexadecimal con soporte Dark Mode */}
            <span className="font-mono text-xs font-black uppercase bg-bg-main dark:bg-bg-dark text-text-primary dark:text-text-inverse px-4 py-2 rounded-neo border-2 border-border dark:border-border-dark shadow-sm">
              {colorPrimary}
            </span>
            <p className="text-[9px] font-bold text-text-muted uppercase italic mt-3 leading-tight max-w-xs">
              Este tono se aplicará a botones, insignias y elementos
              interactivos en el catálogo público.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
