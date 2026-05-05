// components/menu/MenuWrapper.tsx
"use client";

import { useState } from "react";
import { MenuMobileView } from "./layout/MenuMobileView";
import { MenuTabletView } from "./layout/MenuTabletView";
import { MenuDesktopView } from "./layout/MenuDesktopView";

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

interface MenuWrapperProps {
  negocioId: string;
  categorias: CategoriaConProductos[];
  colorConfig: string;
}

export function MenuWrapper({
  negocioId,
  categorias,
  colorConfig,
}: MenuWrapperProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    categorias[0]?.id || "",
  );

  // Forzamos un fallback si viene negro o vacío para notar el cambio en desarrollo
  const finalColor =
    !colorConfig || colorConfig === "#000000" ? "#10b981" : colorConfig;

  return (
    <div
      style={{ "--custom-primary": finalColor } as React.CSSProperties}
      className="w-full text-text-primary dark:text-text-inverse custom-theme-container"
    >
      {/* VISTA MOBILE */}
      <div className="block md:hidden">
        <MenuMobileView
          negocioId={negocioId}
          categorias={categorias}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* VISTA TABLET */}
      <div className="hidden md:block lg:hidden">
        <MenuTabletView
          negocioId={negocioId}
          categorias={categorias}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* VISTA DESKTOP */}
      <div className="hidden lg:block">
        <MenuDesktopView
          negocioId={negocioId}
          categorias={categorias}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>
    </div>
  );
}
