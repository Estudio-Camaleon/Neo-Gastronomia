"use client";

import Image from "next/image";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import type { Guide } from "../data/guias";
import { getRelatedGuides, guideCategories } from "../data/guias";
import "../../marketing/style/home.css";
import "../../marketing/style/shapes.css";

function GuideCard({
  title,
  description,
  category,
  readTime,
  slug,
}: {
  title: string;
  description: string;
  category: string;
  readTime: string;
  slug: string;
}) {
  const cat = guideCategories.find((c) => c.slug === category);
  const gradientMap: Record<string, string> = {
    empezando: "from-emerald-500/10 to-emerald-600/5",
    catalogo: "from-sky-500/10 to-sky-600/5",
    pedidos: "from-amber-500/10 to-amber-600/5",
    personalizacion: "from-violet-500/10 to-violet-600/5",
    facturacion: "from-rose-500/10 to-rose-600/5",
  };

  return (
    <a
      href={`/ayuda/guias/${slug}`}
      className="group glass-card overflow-hidden"
    >
      <div
        className={`aspect-[16/10] bg-gradient-to-br ${gradientMap[category] || "from-[var(--theme-primary-soft)] to-[var(--theme-primary-soft-2)]"} flex items-center justify-center relative`}
      >
        <BookOpen
          size={32}
          className="text-[var(--theme-primary)]/30 group-hover:scale-110 group-hover:text-[var(--theme-primary)]/50 transition-all duration-300"
        />
        <span className="absolute top-3 left-3 text-[9px] font-bold text-[var(--theme-primary)] bg-[var(--theme-surface-strong)]/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[var(--theme-border)]">
          {cat?.label || category}
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-sm font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-[var(--theme-text-muted)] mt-1.5 leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-[var(--theme-text-muted)] flex items-center gap-1">
            <Clock size={11} />
            {readTime}
          </span>
          <span className="text-[10px] font-semibold text-[var(--theme-primary)] flex items-center gap-0.5 group-hover:gap-1 transition-all">
            Leer <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </a>
  );
}

export function GuideDetail({ guide }: { guide: Guide }) {
  const related = getRelatedGuides(guide.slug);
  const cat = guideCategories.find((c) => c.slug === guide.category);
  const gradientMap: Record<string, string> = {
    empezando: "from-emerald-500/10 to-emerald-600/5",
    catalogo: "from-sky-500/10 to-sky-600/5",
    pedidos: "from-amber-500/10 to-amber-600/5",
    personalizacion: "from-violet-500/10 to-violet-600/5",
    facturacion: "from-rose-500/10 to-rose-600/5",
  };

  return (
    <div className="neo-home font-sans min-h-screen w-full">
      <div className="neo-home-shell relative mx-auto flex min-h-screen w-full flex-col">
        <div className="relative z-10 flex min-h-screen flex-col w-full">
          {/* ── Navbar ── */}
          <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
            <nav className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between rounded-[20px] glass-card">
              <a href="/" className="flex items-center gap-2 group shrink-0">
                <div className="p-1.5 sm:p-2 rounded-xl transition-transform group-hover:rotate-6 duration-300">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="NEO"
                    width={40}
                    height={40}
                    priority
                    sizes="40px"
                    className="object-contain w-9 h-9 sm:w-10 sm:h-10"
                  />
                </div>
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="/ayuda/guias"
                  className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Todas las guías
                </a>
              </div>
            </nav>
          </header>

          <main className="flex-grow w-full">
            {/* ── Header de la guía ── */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
              <div className="mx-auto max-w-3xl">
                <a
                  href="/ayuda/guias"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors mb-6"
                >
                  <ArrowLeft size={12} />
                  Volver a guías
                </a>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[9px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-soft)] px-2.5 py-1 rounded-full">
                    {cat?.label || guide.category}
                  </span>
                  <span className="text-[10px] text-[var(--theme-text-muted)] flex items-center gap-1">
                    <Clock size={11} />
                    {guide.readTime} de lectura
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--theme-text)] leading-tight tracking-tight">
                  {guide.title}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[var(--theme-text-muted)] leading-relaxed">
                  {guide.description}
                </p>
              </div>
            </section>

            {/* ── Pasos ── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-16">
              <div className="mx-auto max-w-3xl space-y-8">
                {guide.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-5 sm:p-6 relative overflow-hidden"
                  >
                    {/* Número de paso */}
                    <div className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-[var(--theme-text)]">
                          {step.title}
                        </h2>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-2 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Imagen del paso (placeholder si no hay imagen real) */}
                        {step.image && (
                          <div
                            className={`mt-4 aspect-video rounded-xl bg-gradient-to-br ${gradientMap[guide.category] || "from-[var(--theme-primary-soft)] to-[var(--theme-primary-soft-2)]"} flex items-center justify-center relative overflow-hidden`}
                          >
                            <div className="flex flex-col items-center gap-2 text-[var(--theme-primary)]/40">
                              <BookOpen size={32} />
                              <span className="text-[10px] font-medium">
                                {step.title}
                              </span>
                            </div>
                            {/* Cuando tengas la imagen real:
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 672px"
                            />
                            */}
                          </div>
                        )}

                        {/* Tip */}
                        {step.tip && (
                          <div className="mt-4 flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                            <Lightbulb
                              size={14}
                              className="text-amber-600 shrink-0 mt-0.5"
                            />
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              <span className="font-bold">Tip: </span>
                              {step.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Guías relacionadas ── */}
            {related.length > 0 && (
              <section className="px-4 sm:px-6 lg:px-8 pb-16">
                <div className="mx-auto max-w-4xl">
                  <h2 className="text-lg font-bold text-[var(--theme-text)] mb-5">
                    Guías relacionadas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {related.map((g) => (
                      <GuideCard key={g.slug} {...g} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-[var(--theme-border)] px-4 sm:px-6 lg:px-8 py-6">
            <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl">
              <div className="text-[10px] text-[var(--theme-text-muted)]">
                NeoCatalog — Guías y tutoriales
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <a
                  href="/ayuda/guias"
                  className="text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  Todas las guías
                </a>
                <a
                  href="/ayuda"
                  className="text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  Centro de Ayuda
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
