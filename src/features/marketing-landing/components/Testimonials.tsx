import { MessageSquare, Star } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      quote:
        "Pasamos de procesar carritos de WhatsApp desordenados a recibir pedidos con el formato exacto de nuestro sistema. El cambio en la velocidad de la cocina fue radical.",
      author: "Matias G.",
      role: "Fundador, Burger Corner",
      stars: 5,
    },
    {
      quote:
        "Editar precios y dar de baja stock de ingredientes en hora pico tomaba minutos con plataformas pesadas. Con NEO impacta al instante en los celulares de los clientes.",
      author: "Sofia R.",
      role: "Operaciones, Sushi Lab",
      stars: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Prueba Social
          </h2>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">
            Validado por{" "}
            <span className="text-[var(--theme-primary)]">
              operadores reales
            </span>
          </p>
        </div>

        {/* Layout De Comentarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="glass-card p-6 md:p-8 border border-[var(--theme-border)] bg-[rgba(23,25,12,0.3)] flex flex-col justify-between space-y-6"
            >
              {/* Estrellas e Icono */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[var(--theme-primary)] text-[var(--theme-primary)]"
                    />
                  ))}
                </div>
                <MessageSquare className="h-4 w-4 text-[var(--theme-primary)]/40" />
              </div>

              {/* Contenido del testimonio */}
              <p className="text-sm md:text-base text-[var(--theme-text-muted)] italic leading-relaxed">
                "{rev.quote}"
              </p>

              {/* Autor */}
              <div className="border-t border-[var(--theme-border)] pt-4">
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  {rev.author}
                </h4>
                <p className="text-xs text-[var(--theme-text-muted)] font-mono">
                  {rev.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
