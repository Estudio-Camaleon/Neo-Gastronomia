export function Pricing() {
  const planes = [
    {
      title: "Básico",
      price: "$0",
      description: "Ideal para comenzar a digitalizarte.",
      features: ["Catálogo digital", "Pedidos por WhatsApp", "Soporte básico"],
      highlight: false,
    },
    {
      title: "Pro",
      price: "$29",
      description: "Para negocios que quieren escalar.",
      features: [
        "Pedidos ilimitados",
        "Estadísticas avanzadas",
        "Dominio personalizado",
        "Sin comisión por venta",
      ],
      highlight: true,
    },
  ];

  return (
    <section
      id="precios"
      className="py-24 px-6 bg-bg-main dark:bg-bg-darker transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-primary font-black tracking-widest text-sm mb-3 uppercase">
          Precios
        </h2>
        <h3 className="text-4xl md:text-5xl font-black text-text-primary dark:text-text-inverse tracking-tight">
          Elige el plan ideal para tu negocio
        </h3>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {planes.map((plan, i) => (
          <div
            key={i}
            className={`relative p-10 rounded-[2.5rem] border transition-all duration-300 ${
              plan.highlight
                ? "border-primary bg-surface dark:bg-surface-dark shadow-2xl shadow-primary/10 scale-105 z-10"
                : "border-border dark:border-border-dark bg-surface/50 dark:bg-surface-dark/50 backdrop-blur-sm"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                Recomendado
              </span>
            )}

            <h4 className="text-text-secondary font-bold text-lg mb-2">
              {plan.title}
            </h4>
            <p className="text-text-muted text-sm mb-6">{plan.description}</p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-text-primary dark:text-text-inverse">
                {plan.price}
              </span>
              <span className="text-text-muted font-medium">/mes</span>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-text-secondary font-medium"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg ${
                plan.highlight
                  ? "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
                  : "bg-text-primary dark:bg-text-inverse text-text-inverse dark:text-text-primary hover:opacity-90"
              }`}
            >
              Comenzar ahora
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
