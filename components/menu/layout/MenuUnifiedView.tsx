"use client";

import { useState } from "react";
import { MenuCard } from "../ui/MenuCard";
import { PublicCart } from "../cart/PublicCart";
import { CartFloatingButton } from "../cart/CartFloatingButton";
import { useCartStore } from "../store/useCartStore";

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

interface MenuUnifiedViewProps {
  negocioId: string;
  categorias: CategoriaConProductos[];
  colorConfig: string;
}

export function MenuUnifiedView({
  negocioId,
  categorias,
  colorConfig,
}: MenuUnifiedViewProps) {
  const cart = useCartStore((state) => state.cart);
  const [activeCategory, setActiveCategory] = useState<string>(
    categorias[0]?.id || "",
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categoriaSeleccionada =
    categorias.find((c) => c.id === activeCategory) || categorias[0];

  // Fallback de seguridad estricto para evitar renderizados transparentes
  const finalColor =
    !colorConfig || colorConfig === "#000000" ? "#1c7a42" : colorConfig;

  return (
    <div
      style={{ "--custom-brand-color": finalColor } as React.CSSProperties}
      className="w-full font-sans text-text-primary dark:text-text-inverse animate-in fade-in duration-500"
    >
      {/* 1. SELECTOR DE CATEGORÍAS EN MÓVILES (Scroll horizontal) */}
      <div className="block lg:hidden flex gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x -mx-4 px-4 sticky top-0 bg-bg-main dark:bg-bg-dark z-30">
        {categorias.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              // 🚀 CORREGIDO: Bypass reactivo al motor estático de Tailwind v4 en móviles
              style={
                isSelected
                  ? { backgroundColor: finalColor, borderColor: finalColor }
                  : {}
              }
              className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider italic border-2 whitespace-nowrap transition-all snap-start cursor-pointer select-none ${
                isSelected
                  ? "text-white shadow-md shadow-custom/10 scale-102"
                  : "bg-white dark:bg-bg-darker border-border dark:border-border-dark text-text-primary dark:text-text-inverse hover:border-gray-400"
              }`}
            >
              {cat.nombre}
            </button>
          );
        })}
      </div>

      {/* 2. GRILLA ESTRUCTURAL RESPONSIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-4 lg:mt-0">
        {/* SIDEBAR DE CATEGORÍAS (Solo visible en Desktop) */}
        <aside className="hidden lg:block col-span-1 sticky top-6 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-4 rounded-super shadow-sm transition-colors z-20">
          <p className="text-[9px] font-black uppercase text-text-muted tracking-widest px-2 mb-4 italic select-none">
            Secciones del Menú
          </p>
          <div className="flex flex-col gap-1.5">
            {categorias.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  // 🚀 CORREGIDO: Inyección directa e infalible en el DOM de escritorio
                  style={
                    isSelected
                      ? { backgroundColor: finalColor, borderColor: finalColor }
                      : {}
                  }
                  className={`w-full text-left px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider italic border-2 whitespace-nowrap transition-all cursor-pointer select-none ${
                    isSelected
                      ? "text-white shadow-md scale-102"
                      : "bg-white dark:bg-bg-darker border-border dark:border-border-dark text-text-primary dark:text-text-inverse hover:border-gray-400"
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </aside>

        {/* FEED CENTRAL DE ALIMENTOS */}
        <main className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 mb-2 select-none">
            {/* Forzamos el color del texto del título de la sección activa */}
            <h2
              style={{ color: finalColor }}
              className="text-xl font-black uppercase italic tracking-tighter whitespace-nowrap font-sans"
            >
              {categoriaSeleccionada?.nombre || "Catálogo"}
            </h2>
            {/* Forzamos el color de la línea punteada divisoria */}
            <div
              style={{ borderColor: finalColor }}
              className="h-[2px] w-full border-dashed border-b opacity-40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriaSeleccionada &&
            categoriaSeleccionada.productos.length > 0 ? (
              categoriaSeleccionada.productos.map((producto) => (
                // 🚀 CORREGIDO: Se inyecta la prop obligatoria colorConfig para hidratar las tarjetas individuales
                <MenuCard
                  key={producto.id}
                  producto={producto}
                  colorConfig={finalColor}
                />
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 py-12 text-center text-xs font-bold uppercase tracking-widest text-text-muted border-2 border-dashed border-border dark:border-border-dark rounded-super">
                Sin productos cargados en esta sección
              </div>
            )}
          </div>
        </main>

        {/* CONTENEDOR FIJO DEL CARRITO DE COMPRAS (Solo visible en Desktop) */}
        <aside className="hidden lg:flex col-span-1 sticky top-6 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-6 rounded-super shadow-md transition-colors z-20 flex-col justify-between min-h-[300px]">
          <div className="w-full">
            <div className="border-b-2 border-border dark:border-border-dark pb-3 flex items-center justify-between select-none mb-4">
              <h3 className="font-black uppercase italic tracking-tight text-xs text-text-primary dark:text-text-inverse flex items-center gap-2">
                Tu Pedido 🛒
              </h3>
              {cart.length > 0 && (
                <span
                  style={{
                    color: finalColor,
                    borderColor: `${finalColor}33`,
                    backgroundColor: `${finalColor}1a`,
                  }}
                  className="font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full border"
                >
                  {cart.reduce((acc, item) => acc + item.cantidad, 0)} ítems
                </span>
              )}
            </div>

            <PublicCart negocioId={negocioId} isDrawer={false} />
          </div>
        </aside>
      </div>

      {/* 3. CAPA FLOTANTE DEL CARRITO (Solo visible en Móviles y Tablets) */}
      <div className="block lg:hidden">
        <CartFloatingButton onClick={() => setIsCartOpen(true)} />
      </div>

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
