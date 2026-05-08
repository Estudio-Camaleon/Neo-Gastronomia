"use client";

import { Globe, Hash, Smartphone, MapPin } from "lucide-react";

interface GeneralInfoSectionProps {
  nombre: string;
  slug: string;
  whatsapp: string;
  direccion: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function GeneralInfoSection({
  nombre,
  slug,
  whatsapp,
  direccion,
  onChange,
}: GeneralInfoSectionProps) {
  return (
    <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 space-y-6 shadow-sm transition-colors font-sans">
      {/* Cabecera de Sección */}
      <div className="flex items-center gap-3 mb-2">
        <Globe className="text-primary w-5 h-5" />
        <h2 className="font-black uppercase italic tracking-tight text-lg text-text-primary dark:text-text-inverse">
          Información General
        </h2>
      </div>

      {/* Grilla de Inputs de Control */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input: Nombre Comercial */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
            Nombre Comercial
          </label>
          <input
            type="text"
            name="nombre"
            value={nombre}
            onChange={onChange}
            className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-border dark:border-border-dark focus:border-primary text-text-primary dark:text-text-inverse outline-none font-bold transition-colors uppercase text-sm"
            required
          />
        </div>

        {/* Input: Identificador de URL (Slug) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
            Identificador de URL (Slug)
          </label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10" />
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={onChange}
              className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border dark:border-border-dark focus:border-primary text-text-primary dark:text-text-inverse outline-none font-black italic transition-colors text-sm font-mono lowercase"
              required
            />
          </div>
        </div>

        {/* Input: WhatsApp de Pedidos */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
            WhatsApp de Pedidos
          </label>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 z-10" />
            <input
              type="tel"
              name="whatsapp"
              value={whatsapp}
              onChange={onChange}
              className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border dark:border-border-dark focus:border-primary text-text-primary dark:text-text-inverse outline-none font-bold transition-colors text-sm font-mono"
              placeholder="54381..."
            />
          </div>
        </div>

        {/* Input: Ubicación Física */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
            Ubicación
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10" />
            <input
              type="text"
              name="direccion"
              value={direccion}
              onChange={onChange}
              className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border dark:border-border-dark focus:border-primary text-text-primary dark:text-text-inverse outline-none font-bold transition-colors text-sm uppercase placeholder:normal-case placeholder:font-normal"
              placeholder="Calle, Número, Localidad"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
