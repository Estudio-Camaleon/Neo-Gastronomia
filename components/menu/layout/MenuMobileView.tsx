"use client";

import { useState } from "react";
import { MenuCard } from "../ui/MenuCard";
import { CartFloatingButton } from "../cart/CartFloatingButton";
import { PublicCart } from "../cart/PublicCart";

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

interface MenuMobileViewProps {
  negocioId: string;
  categorias: CategoriaConProductos[]; // Cambiado de any[]
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export function MenuMobileView({
  negocioId,
  categorias,
  activeCategory,
  setActiveCategory,
}: MenuMobileViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const categoriaSeleccionada = categorias.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x -mx-4 px-4 sticky top-0 bg-bg-main dark:bg-bg-dark z-30">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider italic border-2 whitespace-nowrap transition-all snap-start ${
              activeCategory === cat.id
                ? "bg-primary border-primary text-white shadow-md"
                : "bg-white dark:bg-bg-darker border-border dark:border-border-dark text-text-primary dark:text-text-inverse"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {categoriaSeleccionada?.productos.map(
          (
            producto, // Removido any
          ) => (
            <MenuCard key={producto.id} producto={producto} />
          ),
        )}
      </div>

      <CartFloatingButton onClick={() => setIsCartOpen(true)} />

      {isCartOpen && (
        <PublicCart
          negocioId={negocioId}
          isDrawer={true}
          onCloseDrawer={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}
