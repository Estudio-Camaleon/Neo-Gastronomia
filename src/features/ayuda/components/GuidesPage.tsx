"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Search,
  ChevronRight,
} from "lucide-react";
import { guideCategories, getGuidesByCategory } from "../data/guias";
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
          size={40}
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
            Ver guía <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </a>
  );
}

export function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = getGuidesByCategory(activeCategory).filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="neo-home font-sans min-h-screen w-full">
      <div className="neo-home-shell relative mx-auto flex min-h-screen w-full flex-col">
        <div className="relative z-10 flex min-h-screen flex-col w-full">
          {/* ── Navbar ── */}
          <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
            <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between rounded-[20px] glass-card">
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
                  href="/ayuda"
                  className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Centro de Ayuda
                </a>
              </div>
            </nav>
          </header>

          <main className="flex-grow w-full">
            {/* ── Hero ── */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary-soft)] px-4 py-1.5 text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-wider mb-6">
                  <BookOpen size={12} />
                  Guías y Tutoriales
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text)] leading-tight tracking-tight">
                  Aprendé a usar NEO
                </h1>
                <p className="mt-4 text-sm sm:text-base text-[var(--theme-text-muted)] max-w-xl mx-auto leading-relaxed">
                  Tutoriales paso a paso para configurar y sacarle el máximo
                  provecho a tu catálogo digital.
                </p>

                {/* Buscador */}
                <div className="relative max-w-md mx-auto mt-8">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscá tutoriales..."
                    aria-label="Buscar tutoriales"
                    className="w-full rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-strong)] py-3 pl-11 pr-4 text-sm text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* ── Filtros ── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-8">
              <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap gap-2 justify-center">
                  {guideCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`text-[10px] font-bold px-4 py-2 rounded-full border transition-all ${
                        activeCategory === cat.slug
                          ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]"
                          : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Grid de guías ── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-16">
              <div className="mx-auto max-w-5xl">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filtered.map((guide) => (
                      <GuideCard key={guide.slug} {...guide} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center max-w-lg mx-auto">
                    <BookOpen
                      size={32}
                      className="mx-auto text-[var(--theme-text-muted)]/40 mb-3"
                    />
                    <p className="text-sm font-semibold text-[var(--theme-text)]">
                      {searchQuery
                        ? `No encontramos resultados para "${searchQuery}"`
                        : "No hay guías en esta categoría"}
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                      {searchQuery
                        ? "Probá con otros términos."
                        : "Probá explorando otra categoría."}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-[var(--theme-border)] px-4 sm:px-6 lg:px-8 py-6">
            <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl">
              <div className="text-[10px] text-[var(--theme-text-muted)]">
                NeoCatalog — Guías y tutoriales
              </div>
              <a
                href="/ayuda"
                className="text-[10px] font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors"
              >
                ← Volver al centro de ayuda
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
