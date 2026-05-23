import { Flame, Pizza, Sandwich, Salad, Coffee, Bike, CakeSlice } from "lucide-react";

export function Features() {
  const featuresList = [
    {
      title: "Hamburguesas",
      desc: "Locales con combos, papas y bebidas para resolver rápido el antojo.",
      count: "32 locales",
      icon: <Pizza className="h-5 w-5" />,
    },
    {
      title: "Pizzas",
      desc: "Muzzarella, napolitana y opciones gourmet para entrega o retiro.",
      count: "18 locales",
      icon: <Sandwich className="h-5 w-5" />,
    },
    {
      title: "Sushi",
      desc: "Rolls, combinados y promo nights con disponibilidad en tiempo real.",
      count: "14 locales",
      icon: <Salad className="h-5 w-5" />,
    },
    {
      title: "Healthy",
      desc: "Bowls, ensaladas y menús livianos para una decisión más simple.",
      count: "12 locales",
      icon: <Coffee className="h-5 w-5" />,
    },
    {
      title: "Postres",
      desc: "Dulces destacados, combos con café y cierre de pedido perfecto.",
      count: "9 locales",
      icon: <CakeSlice className="h-5 w-5" />,
    },
    {
      title: "Envío rápido",
      desc: "Opciones con delivery veloz y seguimiento más claro para el usuario.",
      count: "24 zonas",
      icon: <Bike className="h-5 w-5" />,
    },
  ];

  return (
    <section id="categories" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
              Categorías gastronómicas
            </h2>
            <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
              Explorá por tipo de comida y encontrá opciones más rápido.
            </p>
          </div>
          <p className="max-w-md text-sm text-[var(--theme-text-muted)]">
            Un acceso visual a las categorías más buscadas para que el usuario
            llegue al restaurante correcto sin navegar de más.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {featuresList.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card p-5 flex flex-col justify-between gap-5 border border-[var(--theme-border)] min-h-[180px]"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--theme-primary-soft)] border border-[var(--theme-border)] text-[var(--theme-primary)] shadow-[0_0_15px_rgba(31,107,61,0.08)]">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--theme-text)]">
                  {feat.title}
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--theme-border)] pt-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                  {feat.count}
                </span>
                <Flame className="h-4 w-4 text-[var(--theme-primary)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
