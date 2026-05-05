"use client";

import { MenuCard } from "../ui/MenuCard";

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

interface MenuTabletViewProps {
  negocioId: string;
  categorias: CategoriaConProductos[]; // Cambiado de any[]
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export function MenuTabletView({
  categorias,
  activeCategory,
  setActiveCategory,
}: MenuTabletViewProps) {
  const categoriaSeleccionada = categorias.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-text-primary dark:text-text-inverse">
      {/* Selector de Categorías Estilo Tabs Compactas */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-border dark:border-border-dark pb-4">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-3 rounded-neo border-2 font-black uppercase text-xs italic tracking-wide transition-all ${
              activeCategory === cat.id
                ? "bg-black text-white dark:bg-primary border-black dark:border-primary shadow-sm"
                : "bg-white dark:bg-bg-darker border-border dark:border-border-dark text-text-primary dark:text-text-inverse hover:border-primary/50"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grilla Expandida a 2 Columnas */}
      <div className="grid grid-cols-2 gap-6">
        {categoriaSeleccionada?.productos.map(
          (
            producto, // Removido any
          ) => (
            <MenuCard key={producto.id} producto={producto} />
          ),
        )}
      </div>
    </div>
  );
}
