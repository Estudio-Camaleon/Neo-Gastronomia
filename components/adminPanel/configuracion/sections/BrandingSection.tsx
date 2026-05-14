"use client";

import Image from "next/image";
import { ImageIcon, Loader2, Upload, Camera, Info } from "lucide-react";

interface BrandingSectionProps {
  logoUrl: string;
  bannerUrl: string;
  uploading: string | null;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => void;
}

export function BrandingSection({
  logoUrl,
  bannerUrl,
  uploading,
  onImageUpload,
}: BrandingSectionProps) {
  return (
    <section className="bg-[var(--admin-surface)] border-2 border-[var(--admin-border)] p-8 space-y-10 shadow-[var(--admin-shadow)] animate-in fade-in duration-500">
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-3">
          <Camera size={24} className="text-[var(--admin-accent)]" />
          <h2 className="font-black uppercase italic tracking-tighter text-2xl">
            Identidad Visual{" "}
            <span className="text-[var(--admin-text-muted)] font-medium">
              / Assets
            </span>
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 opacity-30">
          <Info size={14} />
          <span className="text-[9px] font-black uppercase">
            Formatos recomendados: JPG, PNG, WEBP
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* LOGO PREVIEW (Columnas 1-4) */}
        <div className="md:col-span-4 flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] mb-4 italic">
              Logo de Marca
            </span>
            <div className="relative group">
              {/* Contenedor Circular Logo */}
              <div className="w-48 h-48 rounded-full border-2 border-[var(--admin-border)] bg-[var(--admin-bg)] overflow-hidden shadow-[var(--admin-shadow)] relative transition-all group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    fill
                    className="object-contain p-8 animate-in zoom-in-95 duration-500"
                    alt="Logo del negocio"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center opacity-20 bg-slate-100 dark:bg-slate-800">
                    <ImageIcon size={48} />
                  </div>
                )}

                {/* Overlay de Carga / Sincronización */}
                {uploading === "logo_url" && (
                  <div className="absolute inset-0 bg-[var(--admin-bg)]/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2
                      className="animate-spin text-[var(--admin-accent)]"
                      size={32}
                    />
                  </div>
                )}
              </div>

              {/* Botón Flotante de Upload */}
              <label className="absolute -bottom-2 -right-2 bg-[var(--admin-border)] text-[var(--admin-bg)] p-4 rounded-full cursor-pointer hover:bg-[var(--admin-accent)] transition-all shadow-[4px_4px_0px_0px_var(--admin-accent)] active:scale-90 z-20">
                <Upload size={20} strokeWidth={3} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, "logo_url")}
                  disabled={!!uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* BANNER PREVIEW (Columnas 5-12) */}
        <div className="md:col-span-8 flex flex-col space-y-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] italic">
            Banner de Portada (Sugerido 16:6)
          </span>

          <div className="relative group w-full aspect-[21/9] md:aspect-[16/6] rounded-xl border-2 border-[var(--admin-border)] bg-[var(--admin-bg)] overflow-hidden shadow-[var(--admin-shadow)] transition-all group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                fill
                className="object-cover animate-in fade-in duration-500"
                alt="Banner del negocio"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-[10px] uppercase italic opacity-20 bg-slate-100 dark:bg-slate-800 tracking-widest">
                Sin Imagen de Portada Configurada
              </div>
            )}

            {/* Overlay de Carga */}
            {uploading === "banner_url" && (
              <div className="absolute inset-0 bg-[var(--admin-bg)]/80 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2
                  className="animate-spin text-[var(--admin-accent)]"
                  size={32}
                />
              </div>
            )}

            {/* Botón de Acción Banner */}
            <label className="absolute bottom-6 right-6 bg-[var(--admin-border)] text-[var(--admin-bg)] px-6 py-3 border-2 border-[var(--admin-border)] font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-[var(--admin-accent)] transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_var(--admin-accent)] active:scale-95">
              <Upload size={14} strokeWidth={3} />
              Sincronizar Portada
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={!!uploading}
              />
            </label>
          </div>

          <div className="flex items-start gap-2 opacity-50">
            <Info size={12} className="mt-0.5" />
            <p className="text-[9px] font-bold text-[var(--admin-text)] uppercase leading-tight">
              Asegurate de usar imágenes de alta resolución. Este banner será la
              primera impresión de tus clientes en dispositivos móviles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
