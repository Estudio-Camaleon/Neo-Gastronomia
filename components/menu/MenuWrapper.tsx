"use client";

import { MenuUnifiedView } from "./layout/MenuUnifiedView";

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
  return (
    <MenuUnifiedView
      negocioId={negocioId}
      categorias={categorias}
      colorConfig={colorConfig}
    />
  );
}
