"use client";

import Image from "next/image";
import { ImageIcon, Loader2, Upload, Camera } from "lucide-react";

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
    <div className="bg-white border-4 border-black p-4 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-sans">
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <div className="flex items-center gap-2">
          <Camera size={20} className="text-black stroke-[2.5]" />
          <h2 className="font-black uppercase italic tracking-tight text-lg">
            Identidad Corporativa{" "}
            <span className="text-gray-400 font-normal">
              / Assets Multimedia
            </span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LOGO DE MARCA */}
        <div className="md:col-span-4 flex flex-col items-center border-2 border-black bg-gray-50 p-4 shadow-[2px_2px_0px_0px_#000000]">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 mb-3 block">
            LOGO UNIFICADO TIENDA
          </span>
          <div className="relative group">
            <div className="w-36 h-36 border-4 border-black bg-white overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  fill
                  className="object-contain p-4 animate-in zoom-in-95"
                  alt="Logo corporativo"
                  sizes="144px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={32} />
                </div>
              )}
              {uploading === "logo_url" && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-black" size={24} />
                </div>
              )}
            </div>

            <label className="absolute -bottom-2 -right-2 bg-[#A3FF00] text-black p-2.5 border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all z-20">
              <Upload size={14} strokeWidth={3} />
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

        {/* PORTADA EN BANNER */}
        <div className="md:col-span-8 flex flex-col border-2 border-black bg-gray-50 p-4 shadow-[2px_2px_0px_0px_#000000] h-full justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block">
              HERO BANNER WEB
            </span>
            <div className="relative w-full aspect-[21/8] border-4 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  fill
                  className="object-cover"
                  alt="Banner de catálogo"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-black uppercase text-gray-300 tracking-widest bg-white">
                  Sin portada configurada
                </div>
              )}
              {uploading === "banner_url" && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-black" size={24} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase leading-snug max-w-sm">
              * Dimensión recomendada: 1200x450px. Max 2MB.
            </p>
            <label className="bg-[#A3FF00] text-black border-2 border-black px-4 py-2 font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center gap-1.5 shrink-0">
              <Upload size={12} strokeWidth={3} /> CARGAR PORTADA
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={!!uploading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
