"use client";

import { Share2, Info, Star, StarOff, ArrowUp, ArrowDown } from "lucide-react";
import { REDES_SOCIALES } from "../../../types";
import type { RedSocialId } from "../../../types";

function esRedSocialId(valor: string): valor is RedSocialId {
  return REDES_SOCIALES.some((r) => r.id === valor);
}

export interface SocialLinksBlockProps {
  formData: {
    instagram_url: string;
    facebook_url: string;
    tiktok_url: string;
    twitter_url: string;
    youtube_url: string;
  };
  redes_principales: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRedesPrincipalesChange: (redes: string[]) => void;
}

export function SocialLinksBlock({
  formData,
  redes_principales,
  onChange,
  onRedesPrincipalesChange,
}: SocialLinksBlockProps) {
  const idsPrincipales = redes_principales.filter(esRedSocialId);
  // Preservar el orden que el usuario definió en redes_principales
  const principales = idsPrincipales
    .map((id) => REDES_SOCIALES.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => !!r);
  const secundarias = REDES_SOCIALES.filter(
    (r) => !idsPrincipales.includes(r.id),
  );

  const maxPrincipales = 3;

  const handlePromover = (id: string) => {
    if (!esRedSocialId(id)) return;
    if (redes_principales.length >= maxPrincipales) return;
    onRedesPrincipalesChange([...redes_principales, id]);
  };

  const handleDegradar = (id: string) => {
    onRedesPrincipalesChange(redes_principales.filter((r) => r !== id));
  };

  const handleMoverArriba = (id: string) => {
    const idx = redes_principales.indexOf(id);
    if (idx <= 0) return;
    const nuevas = [...redes_principales];
    [nuevas[idx - 1], nuevas[idx]] = [nuevas[idx], nuevas[idx - 1]];
    onRedesPrincipalesChange(nuevas);
  };

  const handleMoverAbajo = (id: string) => {
    const idx = redes_principales.indexOf(id);
    if (idx === -1 || idx >= redes_principales.length - 1) return;
    const nuevas = [...redes_principales];
    [nuevas[idx], nuevas[idx + 1]] = [nuevas[idx + 1], nuevas[idx]];
    onRedesPrincipalesChange(nuevas);
  };

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
          </p>

          {/* ── Sección: Redes Principales ── */}
          <div className="bg-[var(--admin-accent)]/5 border border-[var(--admin-accent)]/15 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-[var(--admin-accent)]" />
              <span className="text-[13px] font-semibold text-[var(--admin-accent)] uppercase tracking-wide">
                Redes Sociales Principales ({principales.length}/{maxPrincipales})
              </span>
            </div>
            <p className="text-[12px] text-[var(--admin-text-muted)] leading-normal">
              Estas 3 redes aparecerán en el encabezado del menú público.
              {principales.length < maxPrincipales && (
                <> Usá el botón <Star className="inline w-2.5 h-2.5" /> en &quot;Otras redes&quot; para marcar como principal.</>
              )}
            </p>

            {principales.length === 0 ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]/50 italic py-2 text-center">
                Ninguna red marcada como principal.
              </p>
            ) : (
              <div className="space-y-2">
                {principales.map((red, idx) => {
                  return (
                    <div key={red.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1 text-[13px]">
                          <span className="text-[var(--admin-accent)] font-bold">{idx + 1}.</span> {red.label}
                          <span className="text-[12px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
                        </label>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoverArriba(red.id)}
                            disabled={idx === 0}
                            tabIndex={idx === 0 ? -1 : 0}
                            aria-disabled={idx === 0}
                            className="touch-target flex items-center justify-center w-6 h-6 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            aria-label={`Mover ${red.label} arriba`}
                            title="Mover arriba"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoverAbajo(red.id)}
                            disabled={idx >= principales.length - 1}
                            tabIndex={idx >= principales.length - 1 ? -1 : 0}
                            aria-disabled={idx >= principales.length - 1}
                            className="touch-target flex items-center justify-center w-6 h-6 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            aria-label={`Mover ${red.label} abajo`}
                            title="Mover abajo"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDegradar(red.id)}
                            className="touch-target flex items-center justify-center w-6 h-6 rounded text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            aria-label={`Quitar ${red.label} de principales`}
                            title="Quitar de principales"
                          >
                            <StarOff size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        name={`${red.campo}`}
                        type="url"
                        maxLength={2048}
                        value={formData[red.campo as keyof typeof formData]}
                        onChange={onChange}
                        placeholder={`https://${red.id === "twitter" ? "x.com" : `${red.id}.com`}/tu_marca`}
                        className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-[15px] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Sección: Otras Redes Sociales ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-[var(--admin-text-muted)]" />
              <span className="text-[13px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wide">
                Otras Redes Sociales
              </span>
            </div>

            {secundarias.length === 0 ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]/50 italic py-2 text-center">
                Todas las redes están marcadas como principales.
              </p>
            ) : (
              <div className="space-y-2">
                {secundarias.map((red) => (
                  <div key={red.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
                        {red.label}
                        <span className="text-[12px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePromover(red.id)}
                        disabled={redes_principales.length >= maxPrincipales}
                        tabIndex={redes_principales.length >= maxPrincipales ? -1 : 0}
                        aria-disabled={redes_principales.length >= maxPrincipales}
                        className="touch-target flex items-center justify-center w-6 h-6 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        aria-label={`Marcar ${red.label} como principal`}
                        title={
                          redes_principales.length >= maxPrincipales
                            ? "Ya tienes 3 redes principales"
                            : "Marcar como principal"
                        }
                      >
                        <Star size={12} />
                      </button>
                    </div>
                    <input
                      name={`${red.campo}`}
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
            )}
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
