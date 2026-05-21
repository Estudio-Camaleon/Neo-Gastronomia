import { MapPin, Star, Clock3, ChevronRight, Bike, Store } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  const restaurants = [
    {
      name: "La Mesa Verde",
      cuisine: "Hamburguesas y papas",
      rating: 4.8,
      time: "25-35 min",
      distance: "1.2 km",
      promo: "Envío gratis hoy",
    },
    {
      name: "Sushi Lab",
      cuisine: "Sushi y combinados",
      rating: 4.7,
      time: "20-30 min",
      distance: "0.8 km",
      promo: "2x1 en rolls",
    },
    {
      name: "Burger Corner",
      cuisine: "Combos clásicos",
      rating: 4.6,
      time: "15-25 min",
      distance: "1.4 km",
      promo: "20% OFF en combos",
    },
    {
      name: "Healthy Bowl",
      cuisine: "Bowls y ensaladas",
      rating: 4.9,
      time: "18-28 min",
      distance: "2.0 km",
      promo: "Bowl + bebida",
    },
    {
      name: "Pizza Norte",
      cuisine: "Pizzas artesanales",
      rating: 4.5,
      time: "30-40 min",
      distance: "2.4 km",
      promo: "Promo familiar",
    },
    {
      name: "Café Central",
      cuisine: "Desayunos y brunch",
      rating: 4.9,
      time: "10-20 min",
      distance: "0.5 km",
      promo: "Coffee + croissant",
    },
  ];

  return (
    <section id="featured" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
              Restaurantes destacados
            </h2>
            <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[var(--theme-text)] max-w-3xl">
              Opciones recomendadas para explorar primero.
            </p>
          </div>
          <Link
            href="#promotions"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--theme-primary)]"
          >
            Ver promociones
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant, idx) => (
            <article
              key={restaurant.name}
              className="glass-card overflow-hidden border border-[var(--theme-border)] bg-white/82"
            >
              <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,rgba(31,107,61,0.16),rgba(255,255,255,0.6))]">
                <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)]">
                  Destacado
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-[var(--theme-primary)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  {restaurant.promo}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(247,244,236,0.95))]" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Store className="h-7 w-7 text-[var(--theme-primary)]" />
                  </div>
                  <div className="rounded-2xl bg-white/85 px-3 py-2 backdrop-blur">
                    <span className="flex items-center gap-1 text-sm font-black text-[var(--theme-text)]">
                      <Star className="h-4 w-4 fill-[var(--theme-primary)] text-[var(--theme-primary)]" />
                      {restaurant.rating.toFixed(1)}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-muted)]">
                      {idx % 2 === 0 ? "Muy pedido" : "Alta conversión"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[var(--theme-text)]">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    {restaurant.cuisine}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-[var(--theme-text-muted)]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-soft)] px-3 py-1 font-black uppercase tracking-widest">
                    <MapPin className="h-3.5 w-3.5" />
                    {restaurant.distance}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-soft)] px-3 py-1 font-black uppercase tracking-widest">
                    <Clock3 className="h-3.5 w-3.5" />
                    {restaurant.time}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--theme-border)] pt-4">
                  <div className="text-sm font-black uppercase tracking-tight text-[var(--theme-primary)]">
                    {restaurant.promo}
                  </div>
                  <Link
                    href="/registro"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-primary)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                  >
                    Ver menú
                    <Bike className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
