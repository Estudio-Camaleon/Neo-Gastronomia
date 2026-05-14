import "../style/home.css";

export function Pricing() {
  interface PlanPricing {
    title: string;
    price: string;
    description: string;
    features: string[];
    highlight: boolean;
    cta: string;
  }

  const planes: PlanPricing[] = [
    {
      title: "Básico",
      price: "$0",
      description:
        "Para entusiastas y pequeños locales que inician su viaje digital.",
      features: [
        "Catálogo digital",
        "Pedidos por WhatsApp",
        "Soporte vía mail",
      ],
      highlight: false,
      cta: "Empezar gratis",
    },
    {
      title: "Pro",
      price: "$29",
      description:
        "La potencia total diseñada para negocios que buscan escalabilidad.",
      features: [
        "Pedidos ilimitados",
        "Analytics en tiempo real",
        "Dominio .com incluido",
        "Gestión de Multi-sucursal",
      ],
      highlight: true,
      cta: "Subir a Pro",
    },
  ];

  return (
    <section
      id="precios"
      className="neo-home py-20 md:py-32 px-6 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header de Sección */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[var(--theme-primary)] font-mono text-[10px] md:text-xs tracking-[0.3em] mb-4 uppercase">
            // Modelo de suscripción
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
            Escala sin <span className="opacity-40 italic">fricción.</span>
          </h3>
        </div>

        {/* Grid de Planes */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {planes.map((plan, i) => (
            <div
              key={i}
              className={`glass-card relative overflow-hidden flex flex-col transition-all duration-500 ${
                plan.highlight
                  ? "p-8 md:p-12 border-[var(--theme-primary)]/50 bg-white/[0.04] lg:scale-105 z-20 shadow-[0_0_60px_-15px_rgba(157,183,28,0.15)]"
                  : "p-8 md:p-10 opacity-90 lg:scale-95 z-10 border-white/5 hover:opacity-100"
              }`}
            >
              {/* Badge Popular con diseño industrial */}
              {plan.highlight && (
                <div className="absolute top-0 right-0 overflow-hidden w-32 h-32">
                  <div className="bg-[var(--theme-primary)] text-[var(--theme-background)] text-[9px] font-black py-1.5 w-[150%] absolute top-6 right-[-35%] rotate-45 text-center uppercase tracking-tighter shadow-lg">
                    Recomendado
                  </div>
                </div>
              )}

              <div className="mb-10">
                <h4
                  className={`text-2xl font-bold mb-3 ${plan.highlight ? "text-[var(--theme-primary)]" : "text-white"}`}
                >
                  {plan.title}
                </h4>
                <p className="text-[var(--theme-text-muted)] text-sm leading-relaxed antialiased">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-6xl font-bold tracking-tighter">
                  {plan.price}
                </span>
                <span className="text-[var(--theme-text-muted)] font-mono text-[10px] uppercase tracking-[0.2em]">
                  / Ciclo Mensual
                </span>
              </div>

              <ul className="space-y-6 mb-12 flex-grow">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-4 text-sm font-medium group/item"
                  >
                    <span
                      className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-transform group-hover/item:scale-150 ${
                        plan.highlight
                          ? "bg-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)]"
                          : "bg-[var(--theme-border)]"
                      }`}
                    ></span>
                    <span className="opacity-80 group-hover/item:opacity-100 transition-opacity">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                  plan.highlight
                    ? "btn-elegant shadow-xl shadow-[var(--theme-primary)]/10"
                    : "rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                }`}
              >
                {plan.cta}
              </button>

              {/* Efecto de resplandor interno para el plan Pro */}
              {plan.highlight && (
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[var(--theme-primary)] opacity-[0.08] blur-[50px] pointer-events-none group-hover:opacity-[0.12] transition-opacity"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-[var(--theme-text-muted)] text-[10px] font-mono uppercase tracking-[0.3em] opacity-60">
            * Precios finales en USD. Facturación segura vía Stripe.
          </p>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[var(--theme-border)] to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
