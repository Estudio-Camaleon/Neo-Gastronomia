"use client";

import { MenuCard } from "../ui/MenuCard";
import { PublicCart } from "../cart/PublicCart";
import { useCartStore } from "../store/useCartStore";
import { ChevronRight } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
}

interface CategoriaConProductos {
  id: string;
  nombre: string;
  slug: string;
  productos: Producto[];
}

interface MenuDesktopViewProps {
  negocioId: string;
  categorias: CategoriaConProductos[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export function MenuDesktopView({
  negocioId,
  categorias,
  activeCategory,
  setActiveCategory,
}: MenuDesktopViewProps) {
  const cart = useCartStore((state) => state.cart);
  const categoriaSeleccionada = categorias.find((c) => c.id === activeCategory);

  return (
    <div className="grid grid-cols-4 gap-8 items-start animate-in fade-in duration-500 font-sans w-full text-text-primary dark:text-text-inverse">
      {/* COLUMNA 1: Selector Vertical Fijo de Secciones */}
      <aside className="col-span-1 sticky top-6 space-y-2 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-4 rounded-super shadow-sm transition-colors z-20">
        <p className="text-[9px] font-black uppercase text-text-muted tracking-widest px-2 mb-4 italic select-none">
          Secciones del Menú
        </p>
        <div className="space-y-1.5">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl font-black uppercase text-xs italic tracking-wide transition-all text-left ${
                activeCategory === cat.id
                  ? "bg-primary text-white pl-5 shadow-md shadow-primary/10"
                  : "hover:bg-gray-50 dark:hover:bg-white/5 text-text-primary dark:text-text-inverse"
              }`}
            >
              <span>{cat.nombre}</span>
              {activeCategory === cat.id && (
                <ChevronRight size={14} strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* COLUMNAS 2 Y 3: Feed Central de Alimentos */}
      <main className="col-span-2 space-y-6">
        <div className="flex items-center gap-4 mb-2 select-none">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-text-primary dark:text-text-inverse whitespace-nowrap">
            {categoriaSeleccionada?.nombre || "Catálogo"}
          </h2>
          <div className="h-[2px] w-full bg-border/40 dark:bg-border-dark/40 border-dashed border-b" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {categoriaSeleccionada?.productos.map((producto) => (
            <MenuCard key={producto.id} producto={producto} />
          ))}
        </div>
      </main>

      {/* COLUMNA 4: Módulo Lateral Fijo del Carrito de Compras */}
      <aside className="col-span-1 sticky top-6 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-6 rounded-super shadow-md transition-colors z-20 flex flex-col justify-between min-h-[300px]">
        <div className="w-full">
          <div className="border-b-2 border-border dark:border-border-dark pb-3 flex items-center justify-between select-none mb-4">
            <h3 className="font-black uppercase italic tracking-tight text-xs text-text-primary dark:text-text-inverse flex items-center gap-2">
              Tu Pedido 🛒
            </h3>
            {cart.length > 0 && (
              <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full animate-pulse">
                {cart.reduce((acc, item) => acc + item.cantidad, 0)} ítems
              </span>
            )}
          </div>

          {/* Dejamos que PublicCart controle su propio estado interno plano de forma exclusiva */}
          <PublicCart negocioId={negocioId} isDrawer={false} />
        </div>
      </aside>
    </div>
  );
}
