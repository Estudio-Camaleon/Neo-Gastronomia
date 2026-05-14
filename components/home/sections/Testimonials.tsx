import "../style/home.css";

export function Testimonials() {
  interface TestimonialItem {
    name: string;
    role: string;
    content: string;
    initials: string;
  }

  const testimonials: TestimonialItem[] = [
    {
      name: "Andrés García",
      role: "Dueño de Pizzería",
      content:
        "NEO cambió la forma en que recibo pedidos. ¡Ahora todo es mucho más rápido y ordenado! Mis clientes están encantados.",
      initials: "AG",
    },
    {
      name: "Mariana López",
      role: "Emprendedora",
      content:
        "La facilidad para actualizar precios es increíble. Ya no pierdo tiempo enviando PDFs por WhatsApp, solo mando mi link.",
      initials: "ML",
    },
    {
      name: "Carlos Ruiz",
      role: "Gastronómico",
      content:
        "El panel de control es súper intuitivo. Puedo ver mis ventas del día en segundos. Una herramienta indispensable.",
      initials: "CR",
    },
  ];

  return (
    <section
      id="testimonios"
      className="neo-home py-20 md:py-32 px-6 relative overflow-hidden scroll-mt-20"
    >
      {/* Línea divisoria minimalista */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--theme-border)] to-transparent opacity-30"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[var(--theme-primary)] font-mono text-[10px] md:text-xs tracking-[0.3em] mb-4 uppercase">
            // Experiencias NEO
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Confianza de <span className="opacity-40 italic">vanguardia.</span>
          </h3>

          <div
            className="flex justify-center gap-1.5"
            aria-label="Calificación de 5 estrellas"
          >
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-[var(--theme-primary)] fill-current drop-shadow-[0_0_8px_rgba(157,183,28,0.6)]"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="glass-card p-8 md:p-10 flex flex-col justify-between group hover:bg-white/[0.03] transition-all duration-500 h-full border-white/5"
            >
              <div>
                <div className="text-[var(--theme-primary)] opacity-20 mb-8 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out">
                  <svg
                    width="35"
                    height="25"
                    viewBox="0 0 32 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M0 24V11.6364C0 4.54545 5.09091 0 11.6364 0V5.09091C8.72727 5.09091 6.54545 7.27273 6.54545 10.1818H11.6364V24H0ZM20.3636 24V11.6364C20.3636 4.54545 25.4545 0 32 0V5.09091C29.0909 5.09091 26.9091 7.27273 26.9091 10.1818H32V24H20.3636Z" />
                  </svg>
                </div>

                <p className="text-lg md:text-xl font-medium leading-relaxed italic text-white opacity-80 group-hover:opacity-100 transition-opacity duration-500 antialiased">
                  &quot;{t.content}&quot;
                </p>
              </div>

              <footer className="flex items-center gap-5 pt-8 mt-10 border-t border-white/5">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-[var(--theme-primary)] blur-md opacity-0 group-hover:opacity-30 rounded-full transition-opacity duration-500"></div>
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center font-bold text-[var(--theme-primary)] tracking-tighter shadow-inner text-sm md:text-base">
                    {t.initials}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <cite className="not-italic font-bold text-base md:text-lg leading-tight tracking-tight text-white block truncate">
                    {t.name}
                  </cite>
                  <p className="text-[var(--theme-text-muted)] text-[10px] uppercase tracking-[0.2em] font-semibold mt-1 truncate">
                    {t.role}
                  </p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
