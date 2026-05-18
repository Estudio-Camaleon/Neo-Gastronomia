"use client";

import { Share2, Info } from "lucide-react";

interface SocialLinksProps {
  formData: {
    instagram_url: string;
    facebook_url: string;
    tiktok_url: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SocialLinksSection({ formData, onChange }: SocialLinksProps) {
  return (
    <div className="bg-white border-4 border-black p-4 md:p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-sans h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b-4 border-black pb-3">
          <Share2 size={18} className="stroke-[2.5]" />
          <h2 className="font-black uppercase italic text-sm tracking-tight">
            Canales Sociales Externos
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-black uppercase block">
              Perfil de Instagram
            </label>
            <input
              name="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={onChange}
              placeholder="https://instagram.com/tu_marca"
              className="w-full p-2.5 bg-white border-2 border-black font-mono font-medium text-black text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-black uppercase block">
              Página de Facebook
            </label>
            <input
              name="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={onChange}
              placeholder="https://facebook.com/tu_marca"
              className="w-full p-2.5 bg-white border-2 border-black font-mono font-medium text-black text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-black uppercase block">
              Canal de TikTok
            </label>
            <input
              name="tiktok_url"
              type="url"
              value={formData.tiktok_url}
              onChange={onChange}
              placeholder="https://tiktok.com/@tu_marca"
              className="w-full p-2.5 bg-white border-2 border-black font-mono font-medium text-black text-xs"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-black p-3 flex gap-2 mt-4 opacity-70">
        <Info size={14} className="shrink-0 text-gray-400 mt-0.5" />
        <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
          Es mandatorio incluir el prefijo{" "}
          <span className="underline">https://</span> completo para asegurar la
          correcta redirección web del comensal.
        </p>
      </div>
    </div>
  );
}
