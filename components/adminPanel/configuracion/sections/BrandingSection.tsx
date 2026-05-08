"use client";

import Image from "next/image";
import { ImageIcon, Loader2, Upload } from "lucide-react";

interface BrandingSectionProps {
  logoUrl: string;
  bannerUrl: string;
  uploading: string | null;
  onImageUpload: (
    _e: React.ChangeEvent<HTMLInputElement>,
    _field: "logo_url" | "banner_url",
  ) => void;
}

export function BrandingSection({
  logoUrl,
  bannerUrl,
  uploading,
  onImageUpload,
}: BrandingSectionProps) {
  return (
    <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 space-y-6 shadow-sm transition-colors font-sans">
      {/* Cabecera de Sección */}
      <div className="flex items-center gap-3">
        <ImageIcon className="text-primary w-5 h-5" />
        <h2 className="font-black uppercase italic tracking-tight text-lg text-text-primary dark:text-text-inverse">
          Branding & Media
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Bloque: Upload del Logo */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
            Logo del Negocio
          </label>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full border-4 border-border dark:border-border-dark overflow-hidden bg-bg-main dark:bg-bg-dark flex items-center justify-center shrink-0 shadow-inner transition-colors">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                  alt="Logo preview"
                />
              ) : (
                <ImageIcon
                  className="opacity-10 text-text-primary dark:text-text-inverse"
                  size={32}
                />
              )}

              {uploading === "logo_url" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 animate-fade-in">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>

            <label className="cursor-pointer bg-black dark:bg-primary text-white px-6 py-3 rounded-neo font-black text-[10px] uppercase hover:opacity-90 transition-opacity flex items-center gap-2 border-t border-white/10 select-none">
              <Upload size={14} />
              {uploading === "logo_url" ? "SUBIENDO..." : "SUBIR LOGO"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onImageUpload(e, "logo_url")}
                disabled={uploading !== null}
              />
            </label>
          </div>
        </div>

        {/* Bloque: Upload del Banner de Portada */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
            Banner de Portada
          </label>
          <div className="relative w-full h-24 rounded-neo border-4 border-border dark:border-border-dark overflow-hidden bg-bg-main dark:bg-bg-dark shadow-inner transition-colors">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                alt="Banner preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10 font-black text-[10px] uppercase tracking-tighter text-text-primary dark:text-text-inverse select-none">
                SIN PORTADA
              </div>
            )}

            {uploading === "banner_url" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 animate-fade-in">
                <Loader2 className="animate-spin text-white" size={20} />
              </div>
            )}

            <label className="absolute bottom-2 right-2 cursor-pointer bg-white dark:bg-bg-dark text-text-primary dark:text-text-inverse p-2.5 rounded-full border border-border dark:border-border-dark hover:text-primary dark:hover:text-primary transition-all shadow-xl z-20 select-none">
              <Upload size={14} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={uploading !== null}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
