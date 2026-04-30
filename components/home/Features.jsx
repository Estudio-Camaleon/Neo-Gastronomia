export function Features() {
  const items = [
    {
      title: "Catálogo digital",
      desc: "Crea y organiza tus productos con imágenes, precios y descripciones.",
      icon: "📋",
    },
    {
      title: "Gestión de pedidos",
      desc: "Recibe y administra pedidos en tiempo real desde cualquier lugar.",
      icon: "⚡",
    },
    {
      title: "Control de clientes",
      desc: "Mantén tu base de clientes organizada y mejora su experiencia.",
      icon: "👥",
    },
    {
      title: "Reportes y estadísticas",
      desc: "Toma mejores decisiones con datos claros y actualizados.",
      icon: "📈",
    },
  ];

  return (
    <section className="py-24 bg-bg-main dark:bg-bg-darker transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-primary font-black tracking-widest text-sm mb-3 uppercase">
            Funcionalidades
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-text-primary dark:text-text-inverse tracking-tight">
            Todo lo que necesitas para crecer
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="group p-8 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-3xl hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-lg border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  0{i + 1}
                </div>
                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-300">
                  {item.icon}
                </span>
              </div>

              <h4 className="text-xl font-bold mb-3 text-text-primary dark:text-text-inverse">
                {item.title}
              </h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
