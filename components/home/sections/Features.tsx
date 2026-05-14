import "../style/home.css";

// Interfaz exportable para posible uso en otras vistas
export interface FeatureItem {
  title: string;
  desc: string;
  icon: string;
  tag: string;
}

export function Features() {
  const items: FeatureItem[] = [
    {
      title: "Catálogo digital",
      desc: "Crea y organiza tus productos con imágenes, precios y descripciones en una interfaz de alta gama.",
      icon: "📋",
      tag: "Gestión",
    },
    {
      title: "Gestión de pedidos",
      desc: "Recibe y administra pedidos en tiempo real con un motor de sincronización ultra rápido.",
      icon: "⚡",
      tag: "Realtime",
    },
    {
      title: "Control de clientes",
      desc: "Base de datos inteligente para conocer los hábitos de tus Neo-Compradores.",
      icon: "👥",
      tag: "Lealtad",
    },
    {
      title: "Estadísticas",
      desc: "Analítica avanzada con reportes visuales para escalar la rentabilidad de tu negocio.",
      icon: "📈",
      tag: "Data",
    },
  ];

  return (
    <section
      id="features"
      // scroll-mt-20 -> scroll-mt-32 (para que no pegue al navbar al navegar)
      className="neo-home py-24 md:py-40 relative overflow-hidden scroll-mt-32"
    >
      {/* Luz ambiental de fondo - Optimizada para no causar lag en scroll */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[var(--theme-primary)] opacity-[0.03] blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-[var(--theme-primary)] font-mono text-[10px] md:text-xs tracking-[0.3em] mb-4 uppercase">
              // Capacidades del sistema
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1]">
              Ingeniería aplicada a la <br className="hidden md:block" />
              <span className="opacity-40">gastronomía moderna.</span>
            </h3>
          </div>

          <div className="hidden md:block w-px h-24 bg-[var(--theme-border)] opacity-30 mx-8"></div>

          <p className="text-[var(--theme-text-muted)] max-w-sm text-base md:text-sm leading-relaxed border-l-2 md:border-l-0 border-[var(--theme-primary)] pl-6 md:pl-0 opacity-80">
            NEO no es solo software, es una ventaja competitiva diseñada para la
            eficiencia absoluta del flujo de trabajo gastronómico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="glass-card group p-8 flex flex-col justify-between min-h-[340px] transition-all duration-500 hover:bg-white/[0.03]"
            >
              <div>
                <div className="flex justify-between items-center mb-12">
                  <span className="font-mono text-xs text-[var(--theme-primary)] opacity-40 group-hover:opacity-100 transition-opacity">
                    0{i + 1}
                  </span>
                  <div className="px-3 py-1 rounded-full border border-[var(--theme-border)] text-[9px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] group-hover:text-[var(--theme-primary)] group-hover:border-[var(--theme-primary)] transition-all duration-300">
                    {item.tag}
                  </div>
                </div>

                <h4 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-[var(--theme-primary)] transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-[var(--theme-text-muted)] text-sm leading-relaxed group-hover:text-[var(--theme-text)] transition-colors duration-300">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span
                  role="img"
                  aria-label={item.title}
                  className="text-3xl grayscale group-hover:grayscale-0 group-hover:scale-125 transition-all duration-700 ease-out"
                >
                  {item.icon}
                </span>
                <div className="w-12 h-[1px] bg-[var(--theme-border)] group-hover:w-20 group-hover:bg-[var(--theme-primary)] transition-all duration-500 shadow-[0_0_8px_var(--theme-primary)]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
