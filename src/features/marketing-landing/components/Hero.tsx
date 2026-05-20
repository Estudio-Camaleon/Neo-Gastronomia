"use client";

import { TransitionLink } from "@/components/ui/transition-link";
import {
  ArrowRight,
  Search,
  CheckCircle,
  MapPin,
  Sparkles,
  Clock3,
  Star,
  BadgePercent,
  ChevronRight,
  Store,
} from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-28"
    >
      <div className="absolute -top-20 left-0 h-64 w-64 rounded-full bg-[var(--theme-primary-soft)] blur-3xl opacity-70" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[var(--theme-primary-soft-2)] blur-3xl opacity-50" />
      <div className="absolute inset-x-0 top-0 mx-auto h-[420px] max-w-6xl rounded-[40px] border border-[var(--theme-border)] bg-white/35" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-border)] bg-white/75 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-[var(--theme-primary)] animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Descubrí locales y promos cerca tuyo</span>
          </div>

          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-[var(--theme-text)] sm:text-5xl md:text-7xl">
              Encontrá dónde comer{" "}
              <span className="text-[var(--theme-primary)]">sin perder tiempo</span>
            </h1>

            <p className="max-w-2xl text-md font-medium leading-relaxed text-[var(--theme-text-muted)] sm:text-lg md:text-xl">
              Buscá restaurantes, mirá promociones activas y explorá categorías
              gastronómicas con una experiencia rápida, clara y pensada para
              mobile first.
            </p>
          </div>

          <div className="space-y-4">
            <div className="neo-panel flex flex-col gap-3 rounded-[28px] p-4 md:flex-row md:items-center md:p-5">
              <div className="flex-1 flex items-center gap-3 rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3">
                <Search className="h-5 w-5 text-[var(--theme-primary)]" />
                <input
                  aria-label="Buscador principal"
                  placeholder="Buscar por restaurante, comida o promo"
                  className="w-full bg-transparent text-sm font-medium text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-muted)]"
                />
              </div>
              <TransitionLink
                href="/registro"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-[var(--theme-primary)] px-5 py-3.5 text-sm font-black uppercase tracking-tight text-white transition-all hover:opacity-90 active:scale-95"
              >
                Explorar ahora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </TransitionLink>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                "Cerca mío",
                "Envío gratis",
                "Abiertos ahora",
                "2x1 hoy",
              ].map((item) => (
                <span
                  key={item}
                  className="neo-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest"
                >
                  <BadgePercent className="h-3.5 w-3.5" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2 text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--theme-primary)]" />
              <span>Filtros rápidos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--theme-primary)]" />
              <span>Responsive completo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--theme-primary)]" />
              <span>Promos destacadas</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-[var(--theme-primary-soft)] blur-2xl opacity-80" />
          <div className="absolute -right-6 bottom-10 h-28 w-28 rounded-full bg-[var(--theme-primary-soft-2)] blur-2xl opacity-60" />

          <div className="neo-panel relative overflow-hidden rounded-[32px] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--theme-border)] bg-white/70 px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                  Mapa visual
                </p>
                <p className="text-sm font-bold text-[var(--theme-text)]">
                  Descubrimiento gastronómico
                </p>
              </div>
              <div className="neo-chip rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                Hoy
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4 rounded-[28px] border border-[var(--theme-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(238,245,233,0.82))] p-5">
                <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(31,107,61,0.12),rgba(141,187,122,0.2))] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--theme-text-muted)]">
                        Promo activa
                      </p>
                      <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                        20% OFF en combos
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                      <BadgePercent className="h-6 w-6 text-[var(--theme-primary)]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Hamburguesas", "32 locales"],
                    ["Pizzas", "18 locales"],
                    ["Sushi", "14 locales"],
                    ["Healthy", "12 locales"],
                  ].map(([label, meta]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[var(--theme-border)] bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-tight text-[var(--theme-text)]">
                          {label}
                        </span>
                        <Clock3 className="h-4 w-4 text-[var(--theme-primary)]" />
                      </div>
                      <p className="mt-3 text-xs font-medium text-[var(--theme-text-muted)]">
                        {meta}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-[var(--theme-border)] bg-white/88 p-5">
                {["La Mesa Verde", "Sushi Lab", "Burger Corner"].map((name, idx) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--theme-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,244,236,0.7))] p-4"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                      <Store className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-black uppercase tracking-tight text-[var(--theme-text)]">
                          {name}
                        </h3>
                        <span className="flex items-center gap-1 text-xs font-black text-[var(--theme-primary)]">
                          <Star className="h-3.5 w-3.5 fill-[var(--theme-primary)] text-[var(--theme-primary)]" />
                          {(4.7 - idx * 0.1).toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[var(--theme-text-muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          1.2 km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          25-35 min
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--theme-primary)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
