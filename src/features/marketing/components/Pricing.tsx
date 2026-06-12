"use client";

import { UserPlus, UtensilsCrossed, Share2, Palette } from "lucide-react";
import Link from "next/link";
import { useScrollReveal } from "@/core/hooks/useScrollReveal";

export function Pricing() {
  const { ref, isVisible } = useScrollReveal(0.2);

  const steps = [
    {
      number: "01",
      title: "Creá tu cuenta",
      desc: "Registrá tu local en segundos. Configurá tu logo, horarios y número de WhatsApp donde recibirás los pedidos.",
      icon: <UserPlus className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "Cargá tu menú",
      desc: "Añadí tus categorías, productos, descripciones y fotos desde nuestro panel de control intuitivo.",
      icon: <UtensilsCrossed className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Personalizá tu menú",
      desc: "Adaptá los colores, logo y banner de tu marca. Ofrecé una experiencia visual coherente con tu identidad.",
      icon: <Palette className="h-6 w-6" />,
    },
    {
      number: "04",
      title: "Compartí y vendé",
      desc: "Descargá tu código QR para las mesas o compartí el enlace en tus redes sociales para envíos.",
      icon: <Share2 className="h-6 w-6" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
              Simplicidad ante todo
            </h2>
            <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
              Empezá a recibir pedidos hoy mismo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => (
            <article
              key={step.number}
              className={`glass-card relative overflow-hidden border border-[var(--theme-border)] bg-white/82 p-8 opacity-0 ${
                isVisible ? "animate-fade-in-up" : ""
              }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="absolute right-[-8%] top-[-8%] text-6xl sm:text-9xl font-black text-[var(--theme-primary-soft)] opacity-25 sm:opacity-40 pointer-events-none">
                {step.number}
              </div>

              <div className="relative space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-primary)] text-white shadow-lg">
                  {step.icon}
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx === 0 && (
                  <Link
                    href="/registro"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--theme-primary)] hover:underline mt-4"
                  >
                    Comenzar gratis
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
