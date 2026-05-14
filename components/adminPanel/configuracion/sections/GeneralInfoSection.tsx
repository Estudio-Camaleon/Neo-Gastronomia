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
    <section className="bg-[var(--admin-surface)] border-2 border-[var(--admin-border)] p-8 space-y-10 shadow-[var(--admin-shadow)] animate-in fade-in duration-500">
      {/* HEADER TÉCNICO */}
      <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-6">
        <Globe size={24} className="text-[var(--admin-accent)]" />
        <h2 className="font-black uppercase italic tracking-tighter text-2xl">
          Información{" "}
          <span className="text-[var(--admin-text-muted)] font-medium">
            / Operativa
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
        {/* Nombre Comercial */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
            Razón Social / Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            placeholder="Ej: Neo Burguer"
            className="admin-input w-full rounded-xl text-sm tracking-tight"
            required
          />
        </div>

        {/* URL del Catálogo (Slug) */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
            Identificador URL (Slug)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-accent)] z-10 transition-transform group-focus-within:scale-110">
              <Hash size={18} strokeWidth={3} />
            </div>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onChange}
              className="admin-input w-full pl-12 rounded-xl text-sm font-mono lowercase text-[var(--admin-accent)]"
              placeholder="nombre-de-tu-local"
              required
            />
          </div>
        </div>

        {/* WhatsApp Pedidos */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
            Línea de Pedidos (WhatsApp)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10 transition-transform group-focus-within:scale-110">
              <Smartphone size={18} strokeWidth={3} />
            </div>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={onChange}
              className="admin-input w-full pl-12 rounded-xl text-sm font-mono"
              placeholder="5493815550000"
            />
          </div>
        </div>

        {/* Ciudad / Localidad */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
            Región / Localidad
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] z-10 transition-transform group-focus-within:text-[var(--admin-accent)]">
              <Navigation size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              name="localidad"
              value={formData.localidad}
              onChange={onChange}
              className="admin-input w-full pl-12 rounded-xl text-sm uppercase tracking-tighter"
              placeholder="Yerba Buena, Tucumán"
            />
          </div>
        </div>

        {/* Dirección Principal (Full Width) */}
        <div className="space-y-3 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
            Ubicación Física
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] z-10">
              <MapPin size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              className="admin-input w-full pl-12 rounded-xl text-sm uppercase font-bold"
              placeholder="Avenida Principal 1234"
            />
          </div>
        </div>

        {/* Notas de Dirección (Full Width) */}
        <div className="space-y-3 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic">
            Referencias de Entrega / Despacho
          </label>
          <input
            type="text"
            name="direccion_notas"
            value={formData.direccion_notas}
            onChange={onChange}
            className="admin-input w-full rounded-xl text-xs bg-[var(--admin-bg)]"
            placeholder="Ej: Portón negro, timbre B. Local interno."
          />
          <p className="text-[9px] text-[var(--admin-text-muted)] uppercase font-bold px-1 opacity-60">
            * Esta información ayudará a los repartidores y clientes a encontrar
            tu local más rápido.
          </p>
        </div>
      </div>
    </section>
  );
}
