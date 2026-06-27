"use client";

import { FaWhatsapp } from "react-icons/fa";
import {
  QrCode,
  LayoutDashboard,
  Palette,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useScrollReveal } from "@/core/hooks/useScrollReveal";

export function Features() {
  const { ref, isVisible } = useScrollReveal(0.2);

  const featuresList = [
    {
      title: "Menú QR Dinámico",
      desc: "Evitá reimprimir cartas. Actualizá precios y stock en tiempo real desde tu celular o PC.",
      icon: <QrCode className="h-5 w-5" />,
    },
    {
      title: "Directo a WhatsApp",
      desc: "Los pedidos llegan formateados y listos a tu WhatsApp, sin aplicaciones intermediarias.",
      icon: <FaWhatsapp className="h-5 w-5" />,
    },
    {
      title: "Panel de Control",
      desc: "Administrá tu catálogo, categorías, horarios de atención y datos de tu local fácilmente.",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Marca Blanca",
      desc: "El menú lleva tu logo y tus colores. Reforzá la identidad de tu marca, no la nuestra.",
      icon: <Palette className="h-5 w-5" />,
    },
    {
      title: "Sin Descargas",
      desc: "Tus clientes acceden directamente desde su navegador web, sin fricciones ni registros.",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Aumentá tus Ventas",
      desc: "Al no pagar 30% de comisiones a las apps de delivery, tu margen de ganancia es completo.",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <section id="features" className="py-16 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
              Todo lo que necesitas
            </h2>
            <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
              Control total sobre tu catálogo y tus ganancias
            </p>
          </div>
          <p className="max-w-md text-sm text-[var(--theme-text-muted)]">
            Diseñado específicamente para optimizar la operativa de
            restaurantes, pizzerías, cafeterías y food trucks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {featuresList.map((feat, idx) => (
            <div
              key={idx}
              className={`group glass-card p-6 sm:p-7 flex flex-col gap-4 border border-[var(--theme-border)] min-h-[180px] sm:min-h-[200px] opacity-0 transition-all duration-300 hover:border-[var(--theme-primary-soft-2)] hover:shadow-[0_20px_50px_rgba(31,107,61,0.1)] ${
                isVisible ? "animate-fade-in-up" : ""
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl bg-[var(--theme-primary-soft)] border border-[var(--theme-border)] text-[var(--theme-primary)] shadow-[0_0_15px_rgba(31,107,61,0.08)] transition-transform duration-300 group-hover:scale-110">
                {feat.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--theme-text)]">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
