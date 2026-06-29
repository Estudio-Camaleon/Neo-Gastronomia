"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Cookie,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Download,
  Trash2,
  FileText,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { toast } from "sonner";
import Link from "next/link";

const STORAGE_KEY = "neo_cookie_consent";

type ConsentState = "accepted" | "rejected" | null;

function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "accepted" || stored === "rejected") return stored;
  return null;
}

export function PrivacyBlock() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setConsent(getConsent());
  }, []);

  const handleReset = useCallback(() => {
    setResetting(true);
    // Pequeño delay para feedback visual
    setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY);
      setConsent(null);
      setResetting(false);
      toast.success(
        "Preferencia de cookies eliminada. El banner volverá a aparecer en tu próximo ingreso.",
        { duration: 4000 },
      );
    }, 400);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4">
        <div className="p-2 bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-indigo-600 dark:text-indigo-400">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">
            Privacidad y Seguridad
          </h3>
          <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
            Gestioná tus preferencias de cookies y protección de datos.
          </p>
        </div>
      </div>

      {/* ── ESTADO DEL CONSENTIMIENTO ── */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          {/* Icon */}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)]">
            <Cookie size={18} strokeWidth={1.8} />
          </span>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[var(--admin-text)] mb-1">
              Consentimiento de Cookies
            </h4>
            <p className="text-[13px] leading-relaxed text-[var(--admin-text-muted)] mb-4 max-w-xl">
              Tus preferencias sobre cookies se almacenan en tu navegador. Podés
              consultar el estado actual o reiniciarlo para que el banner de
              cookies vuelva a mostrarse.
            </p>

            {/* Estado actual */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[12px] font-medium text-[var(--admin-text-muted)]">
                Estado actual:
              </span>
              {consent === "accepted" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  Aceptadas
                </span>
              )}
              {consent === "rejected" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                  <XCircle size={12} />
                  Rechazadas
                </span>
              )}
              {!consent && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-[var(--admin-text-muted)]">
                  <HelpCircle size={12} />
                  Sin responder
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-[11px] font-bold text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)] transition-all disabled:opacity-40"
              >
                {resetting ? (
                  <FoodMini size={12} />
                ) : (
                  <RotateCcw size={13} strokeWidth={2} />
                )}
                {resetting ? "Reiniciando..." : "Reiniciar consentimiento"}
              </button>

              <Link
                href="/aviso-cookies"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-[11px] font-bold text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)] transition-all"
              >
                <ExternalLink size={13} strokeWidth={2} />
                Ver aviso completo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── INFORMACIÓN SOBRE COOKIES ── */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)]">
            <Info size={18} strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[var(--admin-text)] mb-1">
              ¿Qué cookies utilizamos?
            </h4>
            <p className="text-[13px] leading-relaxed text-[var(--admin-text-muted)] mb-3 max-w-xl">
              En NEO utilizamos exclusivamente cookies técnicas necesarias para
              el funcionamiento de la plataforma y cookies analíticas anónimas
              para mejorar la experiencia. No comercializamos datos personales
              ni compartimos información con terceros con fines publicitarios.
            </p>
            <ul className="space-y-1.5">
              {[
                {
                  label: "Técnicas (sesión, CSRF, preferencias)",
                  always: true,
                },
                {
                  label: "Analíticas (Vercel Analytics, anónimas)",
                  always: false,
                },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-[12px] text-[var(--admin-text-muted)]"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      item.always
                        ? "bg-emerald-500"
                        : "bg-[var(--admin-text-muted)]/40"
                    }`}
                  />
                  {item.label}
                  {item.always && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 ml-1">
                      Siempre activas
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── TUS DERECHOS GDPR ── */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)]">
            <FileText size={18} strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[var(--admin-text)] mb-1">
              Tus derechos sobre los datos
            </h4>
            <p className="text-[13px] leading-relaxed text-[var(--admin-text-muted)] mb-3 max-w-xl">
              De acuerdo con la normativa de protección de datos (GDPR/LOPD),
              como responsable del negocio tenés derecho a solicitar el acceso,
              rectificación, limitación del tratamiento y, cuando corresponda, la
              portabilidad de los datos asociados a tu cuenta.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-medium text-[var(--admin-text-muted)] italic">
                Para ejercer estos derechos, contactanos desde la sección{" "}
                <Link
                  href="/ayuda"
                  className="font-semibold text-[var(--admin-accent)] underline underline-offset-2 hover:no-underline"
                >
                  Soporte
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
