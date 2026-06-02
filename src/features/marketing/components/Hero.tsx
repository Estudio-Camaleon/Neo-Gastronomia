"use client";

import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  BellRing,
} from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pb-12 pt-16 sm:pb-16 sm:pt-24 md:pb-24 md:pt-28"
    >
      <div className="pointer-events-none absolute -top-20 left-0 h-56 w-56 rounded-full bg-[var(--theme-primary-soft)] blur-3xl opacity-45" />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-[var(--theme-primary-soft-2)] blur-3xl opacity-28" />

      <div className="relative mx-auto grid max-w-[92rem] items-center gap-6 md:gap-12 px-4 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.2fr_0.8fr] lg:px-8">
        {/* --- COLUMNA IZQUIERDA: Copy y CTA --- */}
        <div className="space-y-5 sm:space-y-8 lg:pr-2 xl:pr-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              "0% Comisiones",
              "Setup en 5 min",
              "Autogestionable",
              "Soporte 24/7",
            ].map((item) => (
              <span
                key={item}
                className="neo-chip inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:bg-[var(--theme-primary-soft-2)] active:scale-95"
              >
                <CheckCircle className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                {item}
              </span>
            ))}
          </div>

          <div className="space-y-4 sm:space-y-6 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter text-[var(--theme-text)] animate-fade-in-up delay-100">
              Menú digital y pedidos{" "}
              <span className="text-[var(--theme-primary)]">
                sin comisiones
              </span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-lg md:text-xl font-medium leading-relaxed text-[var(--theme-text-muted)] animate-fade-in-up delay-200">
              Modernizá la atención de tu local. Creá tu menú en minutos, recibí
              pedidos directamente en tu WhatsApp y gestioná tus ventas desde un
              panel centralizado.
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up delay-300">
            <div className="neo-panel flex flex-col gap-3 rounded-[20px] sm:rounded-[28px] sm:flex-row sm:items-center">
              <TransitionLink
                href="/registro"
                className="group flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[var(--theme-primary)] px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-black uppercase tracking-tight text-white transition-all hover:opacity-90 active:scale-95"
              >
                Crear mi menú gratis
                <ArrowRight className="h-3.5 sm:h-4 w-3.5 sm:w-4 transition-transform group-hover:translate-x-1" />
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: Mockup del Panel de Gestión --- */}
        <div className="relative mx-auto w-full max-w-lg sm:max-w-2xl lg:max-w-none animate-fade-in-up delay-500 mt-4 sm:mt-8 lg:mt-0">
          <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-[var(--theme-primary-soft)] blur-2xl opacity-80" />
          <div className="absolute -right-6 bottom-10 h-28 w-28 rounded-full bg-[var(--theme-primary-soft-2)] blur-2xl opacity-60" />

          {/* Contenedor principal estilo "Ventana de App" que flota suavemente */}
          <div className="animate-float relative rounded-[24px] sm:rounded-[32px] border border-[var(--theme-border)] bg-white/40 p-2 sm:p-4 backdrop-blur-md shadow-[0_30px_60px_rgba(31,107,61,0.12)]">
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

            {/* Badges Flotantes 3D (Se ocultan en móviles muy pequeños para no desbordar) */}
            <div className="hidden sm:flex absolute -left-8 top-[20%] rounded-2xl border border-[var(--theme-border)] bg-white/95 p-4 shadow-xl backdrop-blur-sm transition-transform hover:scale-105 duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                    Ventas Hoy
                  </p>
                  <p className="text-lg font-black tracking-tight text-[var(--theme-text)]">
                    $145.500
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -right-6 bottom-[15%] rounded-2xl border border-[var(--theme-border)] bg-white/95 p-4 shadow-xl backdrop-blur-sm transition-transform hover:scale-105 duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--theme-accent)] text-white shadow-[0_0_15px_rgba(141,187,122,0.5)]">
                  <BellRing className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                    Nuevo Pedido
                  </p>
                  <p className="text-sm font-black text-[var(--theme-text)]">
                    Mesa 4 • Listo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
