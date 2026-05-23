import { BadgePercent, Sparkles, Truck, ChevronRight } from "lucide-react";

export function Testimonials() {
  const promos = [
    {
      title: "2x1 en rolls",
      subtitle: "Sushi Lab",
      label: "Hasta las 22 hs",
      accent: "bg-[linear-gradient(135deg,rgba(31,107,61,0.2),rgba(141,187,122,0.24))]",
    },
    {
      title: "20% OFF combos",
      subtitle: "Burger Corner",
      label: "Envío gratis",
      accent: "bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(238,245,233,0.9))]",
    },
    {
      title: "Bowl + bebida",
      subtitle: "Healthy Bowl",
      label: "Disponible ahora",
      accent: "bg-[linear-gradient(135deg,rgba(141,187,122,0.22),rgba(255,255,255,0.9))]",
    },
  ];

  return (
    <section id="promotions" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
              Promociones y banners
            </h2>
            <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
              Contenido visual para empujar la conversión.
            </p>
          </div>
          <p className="max-w-md text-sm text-[var(--theme-text-muted)]">
            Espacios destacados para promociones activas, banners web y llamados
            a la acción que se noten sin saturar la pantalla.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="glass-card relative overflow-hidden border border-[var(--theme-border)] bg-[linear-gradient(135deg,rgba(31,107,61,0.92),rgba(47,126,73,0.88))] p-6 md:p-8 text-white">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                Banner principal
              </div>
              <div className="space-y-3 max-w-xl">
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.92]">
                  Promos activas para decidir rápido
                </h3>
                <p className="text-sm md:text-base text-white/80 max-w-lg">
                  Un banner hero con contraste fuerte, mensaje claro y un CTA
                  directo para llevar al usuario al restaurante o al combo.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  "Combo clásico",
                  "Envío gratis",
                  "2x1 hoy",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {promos.map((promo) => (
              <article
                key={promo.title}
                className={`glass-card border border-[var(--theme-border)] p-5 ${promo.accent}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)]">
                      <BadgePercent className="h-3.5 w-3.5" />
                      {promo.label}
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                      {promo.title}
                    </h3>
                    <p className="text-sm font-medium text-[var(--theme-text-muted)]">
                      {promo.subtitle}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-[var(--theme-primary)] shadow-sm">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--theme-border)] pt-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                    Banner web
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--theme-primary)]" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
