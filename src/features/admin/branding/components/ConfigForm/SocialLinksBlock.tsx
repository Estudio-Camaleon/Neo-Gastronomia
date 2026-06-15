"use client";

import { Share2, Info } from "lucide-react";

export interface SocialLinksBlockProps {
  formData: {
    instagram_url: string;
    facebook_url: string;
    tiktok_url: string;
    twitter_url: string;
    youtube_url: string;
    tripadvisor_url: string;
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
          <h2 className="text-xs font-semibold text-[var(--admin-text)]">
            Enlaces Digitales del Menú Público
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-[9px] text-[var(--admin-text-muted)]/60 italic">
            Todos los enlaces son opcionales. Completá solo los que tengas.
          </p>
          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
              Instagram Link
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <input
              name="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={onChange}
              placeholder="https://instagram.com/tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
              Facebook Perfil
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <input
              name="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={onChange}
              placeholder="https://facebook.com/tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
              TikTok Canal
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <input
              name="tiktok_url"
              type="url"
              value={formData.tiktok_url}
              onChange={onChange}
              placeholder="https://tiktok.com/@tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
              X (Twitter)
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <input
              name="twitter_url"
              type="url"
              value={formData.twitter_url}
              onChange={onChange}
              placeholder="https://x.com/tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
              YouTube Canal
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <input
              name="youtube_url"
              type="url"
              value={formData.youtube_url}
              onChange={onChange}
              placeholder="https://youtube.com/@tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
              TripAdvisor
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <input
              name="tripadvisor_url"
              type="url"
              value={formData.tripadvisor_url}
              onChange={onChange}
              placeholder="https://tripadvisor.com/..."
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          Es obligatorio el uso de <code>https://</code> para asegurar el
          redireccionamiento nativo correcto.
        </p>
      </div>
    </div>
  );
}
