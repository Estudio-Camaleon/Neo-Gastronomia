"use client";

import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useScrollReveal } from "@/core/hooks/useScrollReveal";

export function SubscriptionPlans() {
  const { ref, isVisible } = useScrollReveal(0.2);

  const plans = [
    {
      name: "Plan Esencial",
      price: "Gratis",
      description:
        "Ideal para empezar a digitalizar tu local sin costos fijos.",
      features: [
        "Menú QR autogestionable",
        "Pedidos directos a WhatsApp",
        "Hasta 50 productos",
        "Soporte por email",
      ],
      cta: "Comenzar gratis",
      href: "/registro",
      popular: false,
    },
    {
      name: "Plan Pro",
      price: "$15.000",
      period: "/mes",
      description: "Todo lo que necesitas para escalar tu negocio al máximo.",
      features: [
        "Productos y categorías ilimitadas",
        "Estadísticas de ventas",
        "Marca blanca (tu logo y colores)",
        "Soporte prioritario 24/7",
        "Integración con Instagram",
      ],
      cta: "Prueba gratis de 14 días",
      href: "/registro?plan=pro",
      popular: true,
    },
  ];

  return (
    <section id="planes" className="py-16 relative" ref={ref}>
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Planes transparentes
          </h2>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
            Elegí el plan perfecto para tu local
          </p>
          <p className="max-w-md text-sm text-[var(--theme-text-muted)] mt-2">
            Sin comisiones por venta. Pagás solo por la tecnología que usás.
          </p>
        </div>

        {/* Grid de Planes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`glass-card relative flex flex-col p-8 opacity-0 ${
                isVisible ? "animate-fade-in-up" : ""
              } ${
                plan.popular
                  ? "border-[var(--theme-primary)] shadow-[0_0_30px_rgba(31,107,61,0.15)]"
                  : "border-[var(--theme-border)]"
              }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Badge del plan destacado */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 neo-chip px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Más elegido
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[var(--theme-text)]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm font-medium text-[var(--theme-text-muted)]">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-[var(--theme-text-muted)] min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--theme-text-muted)]"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[var(--theme-primary)] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full group flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black uppercase tracking-tight transition-all active:scale-95 ${
                  plan.popular
                    ? "bg-[var(--theme-primary)] text-white hover:opacity-90 shadow-[0_4px_14px_rgba(31,107,61,0.16)]"
                    : "bg-[var(--theme-accent-secondary-soft)] text-[var(--theme-accent-secondary)] hover:bg-[var(--theme-accent-secondary)] hover:text-white border border-[var(--theme-accent-secondary)]/20"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
