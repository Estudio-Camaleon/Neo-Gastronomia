"use client";

import { Globe, Hash, Smartphone, MapPin, Navigation } from "lucide-react";

interface GeneralInfoSectionProps {
  formData: {
    nombre: string;
    slug: string;
    whatsapp: string;
    direccion: string;
    localidad: string;
    direccion_notas: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function GeneralInfoSection({
  formData,
  onChange,
}: GeneralInfoSectionProps) {
  return (
    <div className="bg-white border-4 border-black p-4 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-sans">
      <div className="flex items-center gap-2 border-b-4 border-black pb-4">
        <Globe size={20} className="stroke-[2.5]" />
        <h2 className="font-black uppercase italic text-lg tracking-tight">
          Configuración Operativa Base
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-black uppercase tracking-wide">
            Razón Social Comercial
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            placeholder="Ej: KING BURGERS"
            className="w-full p-3 bg-white border-2 border-black font-bold uppercase text-black"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-black uppercase tracking-wide">
            Identificador URL (Slug Público)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onChange}
              placeholder="mi-comercio"
              className="w-full p-3 pl-9 bg-white border-2 border-black font-mono font-black lowercase text-black"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-black uppercase tracking-wide">
            WhatsApp Core de Recepción
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={onChange}
              placeholder="549381555666"
              className="w-full p-3 pl-9 bg-white border-2 border-black font-mono font-bold text-black"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-black uppercase tracking-wide">
            Región / Localidad
          </label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
            <input
              type="text"
              name="localidad"
              value={formData.localidad}
              onChange={onChange}
              placeholder="Tucumán, Argentina"
              className="w-full p-3 pl-9 bg-white border-2 border-black font-bold uppercase text-black"
              required
            />
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="font-black uppercase tracking-wide">
            Ubicación / Dirección Física
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              placeholder="Avenida Mitre 450"
              className="w-full p-3 pl-9 bg-white border-2 border-black font-bold uppercase text-black"
              required
            />
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="font-black uppercase tracking-wide">
            Anotaciones / Referencias Logísticas
          </label>
          <input
            type="text"
            name="direccion_notas"
            value={formData.direccion_notas}
            onChange={onChange}
            placeholder="Ej: Puerta reja negra, timbre 2. Local a la calle."
            className="w-full p-3 bg-white border-2 border-black font-medium text-black"
          />
        </div>
      </div>
    </div>
  );
}
