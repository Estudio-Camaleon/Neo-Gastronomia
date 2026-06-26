"use client";

import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";
import { ArrowRight, CheckCircle, TrendingUp, BellRing } from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pb-12 pt-16 sm:pb-16 sm:pt-20 md:pb-24 md:pt-28"
    >
      <div className="pointer-events-none absolute right-0 top-24 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-[var(--theme-primary-soft-2)] blur-3xl opacity-20 sm:opacity-28" />

      <div className="relative mx-auto grid max-w-[92rem] items-center gap-6 md:gap-12 px-4 lg:grid-cols-[1fr_1.1fr] xl:grid-cols-[0.9fr_1.1fr] lg:px-8">
        {/* --- COLUMNA IZQUIERDA: Copy y CTA --- */}
        <div className="space-y-5 sm:space-y-8 lg:pr-2 xl:pr-6">
          <div className="space-y-4 sm:space-y-6 max-w-3xl">
            <h1 className="text-fluid-4xl sm:text-fluid-5xl md:text-7xl font-black uppercase leading-[0.9] text-[var(--theme-text)] animate-fade-in-up delay-100">
              Menú digital y pedidos{" "}
              <span className="text-[var(--theme-primary)]">
                sin comisiones
              </span>
            </h1>

            <p className="max-w-2xl text-fluid-sm sm:text-lg md:text-xl font-medium leading-relaxed text-[var(--theme-text-muted)] animate-fade-in-up delay-200">
              Modernizá la atención de tu local. Creá tu menú en minutos, recibí
              pedidos directamente en tu WhatsApp y gestioná tus ventas desde un
              panel centralizado.
            </p>

            <div className="flex flex-wrap gap-x-2 gap-y-1.5 animate-fade-in-up delay-300">
              {[
                { icon: CheckCircle, label: "Sin comisiones ocultas" },
                { icon: CheckCircle, label: "Setup en 5 minutos" },
                { icon: CheckCircle, label: "Sin registro de tarjeta" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-border)] bg-white/70 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-[var(--theme-text-muted)] shadow-sm"
                >
                  <Icon className="h-3 w-3 text-[var(--theme-primary)]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 animate-fade-in-up delay-400">
            <div className="neo-panel flex flex-col gap-3 rounded-[20px] sm:rounded-[28px] sm:flex-row sm:items-center">
              <TransitionLink
                href="/registro"
                className="group flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[var(--theme-primary)] px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-black uppercase tracking-tight text-white transition-all hover:opacity-90 active:scale-95 w-full sm:w-auto touch-target"
              >
                Crear mi menú gratis
                <ArrowRight className="h-3.5 sm:h-4 w-3.5 sm:w-4 transition-transform group-hover:translate-x-1" />
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: Mockup del Panel de Gestión --- */}
        <div className="relative mx-auto w-full max-w-lg sm:max-w-2xl lg:max-w-none animate-fade-in-up delay-500 mt-4 sm:mt-8 lg:mt-0">
          <div className="absolute -left-4 sm:-left-6 top-8 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[var(--theme-primary-soft)] blur-2xl opacity-80" />
          <div className="absolute -right-4 sm:-right-6 bottom-10 h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-[var(--theme-primary-soft-2)] blur-2xl opacity-60" />

          {/* Floating badges - hidden below sm, visible sm+ */}
          <div className="absolute -top-3 -right-3 z-10 hidden animate-float sm:flex items-center gap-2 rounded-xl border border-[var(--theme-border)] bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-black uppercase tracking-tight text-[var(--theme-text)]">
              +40% pedidos
            </span>
          </div>
          <div
            className="absolute -bottom-3 -left-3 z-10 hidden animate-float sm:flex items-center gap-2 rounded-xl border border-[var(--theme-border)] bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm"
            style={{ animationDelay: "2s" }}
          >
            <BellRing className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-tight text-[var(--theme-text)]">
              Notificación al instante
            </span>
          </div>

          {/* Contenedor principal estilo "Ventana de App" */}
          <div className="relative rounded-[24px] sm:rounded-[32px] border border-[var(--theme-border)] bg-white/40 p-2 sm:p-4 backdrop-blur-md shadow-[0_30px_60px_rgba(31,107,61,0.12)]">
            {/* Barra superior del navegador (Mac style) */}
            <div className="flex items-center gap-2 px-3 pb-3 pt-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm" />
              <div className="ml-4 flex h-7 flex-1 items-center rounded-lg bg-white/70 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-muted)] border border-white/40">
                neo.com/admin/dashboard
              </div>
            </div>

            {/* Contenedor de la Imagen / Captura */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] sm:rounded-[20px] border border-[var(--theme-border)] bg-white shadow-inner">
              {/* 
                  💡 INSTRUCCIÓN PARA VOS:
                  1. Toma una captura de tu panel admin.
                  2. Guárdala en la carpeta 'public/images/' con el nombre 'dashboard-mockup.webp'.
                  3. El componente Image la cargará automáticamente ocupando todo el recuadro.
               */}
              <Image
                src="/images/portadas/FullcaptureDashboard.png"
                alt="Panel de gestión NEO"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                className="object-cover object-top"
                priority
              />

              {/* Animated mouse cursor */}
              <div className="animate-cursor absolute z-20 pointer-events-none">
                <div className="animate-cursor-click">
                  <svg
                    className="h-5 w-5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -left-0.5 h-6 w-6 rounded-full bg-white/30 animate-ping" />
              </div>

              {/* --- FALLBACK TEMPORAL --- */}
              {/* Si aún no subes la imagen, se mostrará este wireframe estético para que no quede vacío */}
              <div className="absolute inset-0 flex flex-col p-4 sm:p-6 bg-[var(--theme-background)] -z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 w-32 bg-[var(--theme-border)] rounded-full opacity-50" />
                  <div className="h-8 w-8 bg-[var(--theme-primary-soft)] rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="h-20 bg-white rounded-xl border border-[var(--theme-border)] shadow-sm" />
                  <div className="h-20 bg-white rounded-xl border border-[var(--theme-border)] shadow-sm" />
                  <div className="h-20 bg-white rounded-xl border border-[var(--theme-border)] shadow-sm" />
                </div>
                <div className="flex-1 bg-white rounded-xl border border-[var(--theme-border)] shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
