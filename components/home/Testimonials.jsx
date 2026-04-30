export function Testimonials() {
  const testimonials = [
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
    <section className="py-24 px-6 bg-bg-main dark:bg-bg-darker border-t border-border dark:border-border-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-text-primary dark:text-text-inverse tracking-tight">
            Lo que dicen nuestros usuarios
          </h3>
          <div className="mt-4 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-primary text-xl">
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group p-8 bg-surface dark:bg-surface-dark rounded-[2rem] border border-border dark:border-border-dark shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="mb-6 text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                <svg
                  width="32"
                  height="24"
                  viewBox="0 0 32 24"
                  fill="currentColor"
                >
                  <path d="M0 24V11.6364C0 4.54545 5.09091 0 11.6364 0V5.09091C8.72727 5.09091 6.54545 7.27273 6.54545 10.1818H11.6364V24H0ZM20.3636 24V11.6364C20.3636 4.54545 25.4545 0 32 0V5.09091C29.0909 5.09091 26.9091 7.27273 26.9091 10.1818H32V24H20.3636Z" />
                </svg>
              </div>

              <p className="text-text-secondary text-lg leading-relaxed mb-8 min-h-[100px]">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4 border-t border-border dark:border-border-dark pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">
                  {t.initials}
                </div>
                <div>
                  <div className="font-black text-text-primary dark:text-text-inverse leading-none mb-1">
                    {t.name}
                  </div>
                  <div className="text-text-muted text-xs uppercase tracking-widest font-bold">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
