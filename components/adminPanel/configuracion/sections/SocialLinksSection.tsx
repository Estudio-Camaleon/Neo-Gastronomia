"use client";

import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaShareNodes,
} from "react-icons/fa6";
import { Info } from "lucide-react";

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
    <section className="bg-[var(--admin-surface)] border-2 border-[var(--admin-border)] p-8 space-y-10 shadow-[var(--admin-shadow)] animate-in fade-in duration-500">
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-3">
          <FaShareNodes size={22} className="text-[var(--admin-accent)]" />
          <h2 className="font-black uppercase italic tracking-tighter text-2xl">
            Presencia{" "}
            <span className="text-[var(--admin-text-muted)] font-medium">
              / Digital
            </span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Instagram */}
        <div className="group space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic flex items-center gap-2">
            <FaInstagram
              className="transition-colors group-focus-within:text-[#E4405F]"
              size={14}
            />
            Instagram Profile
          </label>
          <input
            name="instagram_url"
            type="url"
            value={formData.instagram_url}
            onChange={onChange}
            placeholder="https://instagram.com/tu-negocio"
            className="admin-input w-full rounded-xl text-xs font-mono"
          />
        </div>

        {/* Facebook */}
        <div className="group space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic flex items-center gap-2">
            <FaFacebookF
              className="transition-colors group-focus-within:text-[#1877F2]"
              size={14}
            />
            Facebook Page
          </label>
          <input
            name="facebook_url"
            type="url"
            value={formData.facebook_url}
            onChange={onChange}
            placeholder="https://facebook.com/tu-negocio"
            className="admin-input w-full rounded-xl text-xs font-mono"
          />
        </div>

        {/* TikTok */}
        <div className="group space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] ml-1 italic flex items-center gap-2">
            <FaTiktok
              className="transition-colors group-focus-within:text-[var(--admin-text)]"
              size={14}
            />
            TikTok Channel
          </label>
          <input
            name="tiktok_url"
            type="url"
            value={formData.tiktok_url}
            onChange={onChange}
            placeholder="https://tiktok.com/@tu-negocio"
            className="admin-input w-full rounded-xl text-xs font-mono"
          />
        </div>
      </div>

      {/* FOOTER DE SECCIÓN / HELP TEXT */}
      <div className="flex items-start gap-3 p-4 bg-[var(--admin-bg)] border border-[var(--admin-border)] opacity-60">
        <Info size={16} className="text-[var(--admin-accent)] shrink-0" />
        <p className="text-[9px] font-bold uppercase leading-relaxed text-[var(--admin-text)]">
          Las URLs de redes sociales permiten que tus clientes te encuentren
          fuera del catálogo. Asegúrate de incluir el protocolo{" "}
          <span className="text-[var(--admin-accent)]">https://</span> completo.
        </p>
      </div>
    </section>
  );
}
