"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "neo_cookie_consent";

type ConsentChoice = "accepted" | "rejected" | null;

function getStoredConsent(): ConsentChoice {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "accepted" || stored === "rejected") return stored;
  return null;
}

function setStoredConsent(choice: "accepted" | "rejected") {
  localStorage.setItem(STORAGE_KEY, choice);
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getStoredConsent());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleAccept = () => {
    setStoredConsent("accepted");
    setConsent("accepted");
  };

  const handleReject = () => {
    setStoredConsent("rejected");
    setConsent("rejected");
  };

  // No mostrar hasta hidratar (evita flash), ni si ya respondió
  if (!mounted || consent !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        role="dialog"
        aria-modal="false"
        aria-label="Aviso de cookies"
        className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-[var(--neo-border)] bg-[var(--neo-surface)]/95 backdrop-blur-xl shadow-2xl shadow-black/10"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-4">
          {/* Icono + texto */}
          <div className="flex items-start gap-4 sm:items-center sm:flex-1">
            <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--neo-brand)]/10 text-[var(--neo-brand)]">
              <Cookie size={20} strokeWidth={1.8} />
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--neo-text)] leading-tight">
                Este sitio utiliza cookies
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--neo-muted)] max-w-2xl">
                Usamos cookies esenciales para el funcionamiento y cookies
                analíticas (anónimas) para mejorar tu experiencia. Podés
                aceptarlas o rechazarlas.{" "}
                <Link
                  href="/aviso-cookies"
                  className="inline-flex items-center gap-1 font-semibold text-[var(--neo-brand)] underline-offset-2 underline hover:no-underline transition-all"
                >
                  <ShieldCheck size={13} strokeWidth={2} />
                  Más información
                </Link>
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--neo-border)] px-4 py-2.5 text-[12px] font-bold text-[var(--neo-muted)] hover:bg-[var(--neo-border)]/40 hover:text-[var(--neo-text)] transition-all"
            >
              <X size={14} strokeWidth={2.5} />
              Rechazar
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--neo-brand)] px-5 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[var(--neo-brand)]/20 hover:brightness-110 active:scale-[0.97] transition-all"
            >
              <Cookie size={14} strokeWidth={2.5} />
              Aceptar todas
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
