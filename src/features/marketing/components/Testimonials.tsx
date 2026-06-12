"use client";

import { Quote, Star } from "lucide-react";
import { useScrollReveal } from "@/core/hooks/useScrollReveal";

export function Testimonials() {
  const { ref, isVisible } = useScrollReveal(0.2);

  const reviews = [
    {
      author: "Martín G.",
      business: "Pizzería Nápoles",
      content:
        "Dejamos de pagarle el 30% a las apps de delivery. Ahora nuestros clientes de la zona nos piden directo por WhatsApp usando nuestro QR. El sistema se paga solo en el primer día del mes.",
    },
    {
      author: "Lucía F.",
      business: "Café Central",
      content:
        "La facilidad para cambiar los precios en contexto de inflación nos salvó. Antes teníamos que tachar menús impresos, ahora lo hago en 2 minutos desde el celular y se actualiza al instante.",
    },
    {
      author: "Diego R.",
      business: "Burger Lab",
      content:
        "Nuestros camareros ya no pierden tiempo tomando notas en la mesa. La gente se sienta, escanea el QR, elige tranquilo y el pedido llega directo a nuestra caja. Excelente plataforma.",
    },
  ];

  return (
    <section id="testimonials" className="py-16 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-3 text-center items-center">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Casos de éxito
          </h2>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
            Locales que ya optimizaron sus ventas
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, idx) => (
            <article
              key={idx}
              className={`glass-card relative flex flex-col justify-between gap-6 border border-[var(--theme-border)] p-6 opacity-0 ${
                isVisible ? "animate-fade-in-up" : ""
              }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-[var(--theme-primary-soft-2)] opacity-50" />

              <div className="space-y-4 relative z-10">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[var(--theme-primary)] text-[var(--theme-primary)]"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium leading-relaxed text-[var(--theme-text-muted)] italic">
                  "{review.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-[var(--theme-border)] pt-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] font-black">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--theme-text)]">
                    {review.author}
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)]">
                    {review.business}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
