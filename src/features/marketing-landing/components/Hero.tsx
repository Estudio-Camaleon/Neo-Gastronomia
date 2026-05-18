"use client";

import Link from "next/link";
import { ArrowRight, Sparkles,CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <section id="hero" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Luces de Fondo de Alto Impacto */}
      <div className="absolute top-0 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-[var(--theme-primary)]/5 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Micro-badge Comercial */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-border)] bg-black/40 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-[var(--theme-primary)] animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Infraestructura Gastronómica v3.0</span>
        </div>

        {/* Copy Principal */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] max-w-5xl mx-auto text-white">
          Lanzá tu menú digital en <span className="text-[var(--theme-primary)] drop-shadow-[0_0_25px_rgba(157,183,28,0.2)]">tiempo real</span>
        </h1>

        <p className="text-md sm:text-lg md:text-xl text-[var(--theme-text-muted)] max-w-3xl mx-auto font-medium leading-relaxed">
          Unificá el control de tus pedidos por WhatsApp, editá tu catálogo al instante y blindá la experiencia de tus clientes sin intermediarios ni comisiones abusivas.
        </p>

        {/* Acciones de Conversión */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/registro"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--theme-primary)] text-black font-black uppercase tracking-tight text-sm px-8 py-4 rounded-md shadow-[0_4px_30px_rgba(157,183,28,0.25)] hover:bg-white transition-all transform active:scale-95"
          >
            Desplegar mi tienda gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-sm font-bold border border-[var(--theme-border)] bg-[var(--theme-surface)]/40 px-8 py-4 rounded-md hover:border-white transition-colors text-white"
          >
            Ver características
          </a>
        </div>

        {/* Beneficios Rápidos (Reducción de fricción B2B) */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[var(--theme-primary)]" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[var(--theme-primary)]" />
            <span>Configuración en 5 minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[var(--theme-primary)]" />
            <span>Soporte WhatsApp Directo</span>
          </div>
        </div>
      </div>
    </section>
  );
}