"use client";

import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useScrollReveal } from "@/core/hooks/useScrollReveal";

export function Pricing() {
  const { ref } = useScrollReveal(0.2);

  return (
    <section id="how-it-works" className="py-16 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col gap-3 text-center items-center">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Guías y tutoriales
          </h2>
          <div>
            <BookOpen className="h-20 w-20" />
          </div>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
            Aprendé a usar NEO en minutos
          </p>

          <p className="max-w-lg text-sm text-[var(--theme-text-muted)] mt-2">
            Seguí nuestras guías paso a paso para configurar tu menú digital,
            personalizar tu marca y recibir pedidos sin complicaciones.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/ayuda/guias"
            className="group flex items-center gap-3 rounded-xl px-8 py-4 text-base font-black uppercase tracking-tight transition-all active:scale-95 bg-[var(--theme-primary)] text-white hover:opacity-90 shadow-[0_4px_14px_rgba(31,107,61,0.16)]"
          >
            Entrar a aprender
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
