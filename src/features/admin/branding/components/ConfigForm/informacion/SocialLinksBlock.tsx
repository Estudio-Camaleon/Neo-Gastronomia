"use client";

import { Share2, Info } from "lucide-react";
import { REDES_SOCIALES } from "../../../types";

export interface SocialLinksBlockProps {
  formData: {
    instagram_url: string;
    facebook_url: string;
    tiktok_url: string;
    twitter_url: string;
    youtube_url: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SocialLinksBlock({
  formData,
  onChange,
}: SocialLinksBlockProps) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
          <Share2 size={14} className="text-[var(--admin-text-muted)]" />
          <h2 className="text-[15px] font-semibold text-[var(--admin-text)]">
            Enlaces Digitales del Menú Público
          </h2>
        </div>

        <div className="space-y-3 text-[15px]">
          <p className="text-[12px] text-[var(--admin-text-muted)]/60 italic">
            Todos los enlaces son opcionales. Completá solo los que tengas.
            Las redes con URL configurada aparecerán en el pie del menú público.
          </p>

          {/* ── Lista plana de redes sociales ── */}
          <div className="space-y-3">
            {REDES_SOCIALES.map((red) => (
              <div key={red.id} className="space-y-1">
                <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1 text-[13px]">
                  {red.label}
                  <span className="text-[12px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">
                    Opcional
                  </span>
                </label>
                <input
                  name={red.campo}
                  type="url"
                  maxLength={2048}
                  value={formData[red.campo as keyof typeof formData]}
                  onChange={onChange}
                  placeholder={`https://${red.id === "twitter" ? "x.com" : `${red.id}.com`}/tu_marca`}
                  className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-[15px] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[13px] text-[var(--admin-text-muted)] leading-normal">
          Es obligatorio el uso de <code>https://</code> para asegurar el
          redireccionamiento nativo correcto.
        </p>
      </div>
    </div>
  );
}
