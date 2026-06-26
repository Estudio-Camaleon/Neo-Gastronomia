"use client";

import { CheckCircle2, ArrowRight, Sparkles, Zap, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { useScrollReveal } from "@/core/hooks/useScrollReveal";

const allFeatures = [
  { label: "Menú QR digital", free: true, pro: true },
  { label: "Pedidos directos a WhatsApp", free: true, pro: true },
  { label: "Categorías y productos", free: "Hasta 50", pro: "Ilimitados" },
  { label: "Personalización de marca", free: false, pro: true },
  { label: "Estadísticas de ventas", free: false, pro: true },
  { label: "Exportación de datos", free: false, pro: true },
  { label: "Soporte prioritario", free: false, pro: true },
  { label: "Integración con Instagram", free: false, pro: true },
  { label: "Comisiones por venta", free: "0%", pro: "0%" },
] as const;

export function SubscriptionPlans() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section id="planes" className="py-16 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Planes transparentes
          </h2>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
            Empezá gratis. Escalá cuando lo necesites.
          </p>
          <p className="max-w-lg text-sm text-[var(--theme-text-muted)] mt-2">
            Sin comisiones por venta, sin sorpresas. Usá el plan gratuito todo el tiempo que quieras
            y actualizá solo cuando tu negocio pida más.
          </p>
        </div>

        {/* Comparativa lado a lado */}
        <div className="max-w-4xl mx-auto">
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
            {/* FREE — Azul */}
            <div
              className={`glass-card relative flex flex-col p-8 border border-blue-200/60 opacity-0 ${
                isVisible ? "animate-fade-in-up" : ""
              }`}
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Para empezar
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                Plan Esencial
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-[var(--theme-text)]">Gratis</span>
              </div>
              <p className="mt-3 text-sm text-[var(--theme-text-muted)]">
                Ideal para digitalizar tu local sin inversión inicial.
              </p>

              <ul className="mt-6 flex-1 space-y-3 mb-8">
                {allFeatures
                  .filter((f) => f.free)
                  .map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3 text-sm text-[var(--theme-text-muted)]">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        {feature.label}
                        {typeof feature.free === "string" && (
                          <span className="ml-1 text-[10px] font-bold text-blue-600">
                            {feature.free}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
              </ul>

              <Link
                href="/registro"
                className="w-full group flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black uppercase tracking-tight transition-all active:scale-95 bg-blue-500 text-white hover:bg-blue-600 shadow-[0_4px_14px_rgba(59,130,246,0.2)]"
              >
                Comenzar gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* PRO — Dorado */}
            <div
              className={`glass-card relative flex flex-col p-8 opacity-0 ${
                isVisible ? "animate-fade-in-up" : ""
              } border-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.12)]`}
              style={{ animationDelay: "150ms" }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 bg-amber-400 text-amber-950 shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
                <Crown className="h-3 w-3" />
                Más elegido
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  Para crecer
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                Plan Pro
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-500">$30.000</span>
                <span className="text-sm font-medium text-[var(--theme-text-muted)]">/mes</span>
              </div>
              <p className="mt-3 text-sm text-[var(--theme-text-muted)]">
                Todo lo que necesitás para escalar tu negocio al máximo.
              </p>

              <ul className="mt-6 flex-1 space-y-3 mb-8">
                {allFeatures.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-3 text-sm text-[var(--theme-text-muted)]">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      {feature.label}
                      {typeof feature.pro === "string" && (
                        <span className="ml-1 text-[10px] font-bold text-amber-600">
                          {feature.pro}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/registro?plan=pro"
                className="w-full group flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black uppercase tracking-tight transition-all active:scale-95 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 hover:from-amber-400 hover:to-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
              >
                <Sparkles className="h-4 w-4" />
                Empezar con PRO
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Nota al pie */}
          <div className={`text-center opacity-0 ${isVisible ? "animate-fade-in-up" : ""}`} style={{ animationDelay: "300ms" }}>
            <p className="text-xs text-[var(--theme-text-muted)]">
              <Lock className="h-3 w-3 inline mr-1" />
              Sin comisiones por venta en ningún plan. Cancelá el plan Pro cuando quieras.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
