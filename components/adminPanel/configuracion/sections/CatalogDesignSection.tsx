"use client";

import { Palette, Info, Layout } from "lucide-react";

interface CatalogDesignSectionProps {
  colorPrimary: string;
  onChange: (val: string) => void;
}

export function CatalogDesignSection({
  colorPrimary,
  onChange,
}: CatalogDesignSectionProps) {
  return (
    <section className="bg-[var(--admin-surface)] border-2 border-[var(--admin-border)] p-8 space-y-8 shadow-[var(--admin-shadow)] animate-in fade-in duration-500">
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-3">
          <Palette size={24} className="text-[var(--admin-accent)]" />
          <h2 className="font-black uppercase italic tracking-tighter text-2xl">
            Interfaz{" "}
            <span className="text-[var(--admin-text-muted)] font-medium">
              / Visual (UI)
            </span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-stretch gap-10">
        {/* LADO IZQUIERDO: PREVIEW TÉCNICO */}
        <div className="flex-1 flex flex-col justify-center items-center p-10 border-2 border-dashed border-[var(--admin-border)]/20 rounded-2xl bg-[var(--admin-bg)]/50 group transition-colors hover:border-[var(--admin-accent)]/30">
          <div
            className="w-40 h-40 rounded-[2.5rem] border-2 border-[var(--admin-border)] shadow-[8px_8px_0px_0px_var(--admin-border)] flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{ backgroundColor: colorPrimary }}
          >
            <span className="text-white mix-blend-difference font-black text-[10px] uppercase italic tracking-widest text-center px-4 leading-tight opacity-80">
              Previsualización <br /> de Marca
            </span>
          </div>
          <div className="mt-8 flex items-center gap-2 opacity-40">
            <Layout size={14} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              Render Engine: Active
            </span>
          </div>
        </div>

        {/* LADO DERECHO: CONTROLES */}
        <div className="flex-1 space-y-8 py-4">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
              Tono de Acento Principal
            </label>

            <div className="flex items-center gap-6">
              {/* Color Picker Custom */}
              <div className="relative">
                <input
                  type="color"
                  value={colorPrimary}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-20 h-20 rounded-2xl border-2 border-[var(--admin-border)] cursor-pointer appearance-none bg-transparent overflow-hidden shadow-[var(--admin-shadow)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl ring-inset ring-1 ring-black/10" />
              </div>

              {/* Input de Texto HEX */}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={colorPrimary}
                  onChange={(e) => onChange(e.target.value)}
                  className="admin-input w-full rounded-xl text-2xl font-mono font-black uppercase text-[var(--admin-accent)]"
                  placeholder="#000000"
                  maxLength={7}
                />
                <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-tight ml-1">
                  Ingresá el código HEX o usá el selector
                </p>
              </div>
            </div>
          </div>

          {/* CAJA DE INFORMACIÓN TÉCNICA */}
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] p-5 rounded-xl flex items-start gap-4 shadow-[4px_4px_0px_0px_var(--admin-border)]/5">
            <div className="p-2 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded-lg">
              <Info size={18} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[var(--admin-text)] uppercase italic">
                Impacto en la Experiencia de Usuario
              </p>
              <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase leading-relaxed tracking-tight">
                Este color se inyectará dinámicamente en los botones de compra,
                indicadores de precio, categorías activas y estados de envío de
                tu catálogo público.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
