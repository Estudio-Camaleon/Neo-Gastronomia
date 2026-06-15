"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { Categoria, Producto } from "@/features/public-menu/types";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import { useIsMobile } from "@/core/hooks/useIsMobile";

interface UseMenuCatalogProps {
  categorias: Categoria[];
  uncategorizedProducts: Producto[];
  cart: CartItem[];
}

interface UseMenuCatalogReturn {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  activeCategory: string;
  isMobile: boolean;
  cartQuantityByProduct: Map<string, number>;
  categoriasToShow: Categoria[];
  scrollToCategory: (id: string) => void;
}

export function useMenuCatalog({
  categorias,
  uncategorizedProducts,
  cart,
}: UseMenuCatalogProps): UseMenuCatalogReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // ── Mobile detection ─────────────────────────────
  const isMobile = useIsMobile(1024);

  // ── Cart quantity by product ──────────────────────
  const cartQuantityByProduct = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => {
      map.set(
        item.producto_id,
        (map.get(item.producto_id) || 0) + item.cantidad,
      );
    });
    return map;
  }, [cart]);

  // ── Filtered categories (by search only — category buttons scroll, do not filter) ──
  const categoriasFiltradas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categorias;

    return categorias
      .map((categoria) => ({
        ...categoria,
        productos: categoria.productos.filter(
          (producto) =>
            producto.nombre.toLowerCase().includes(query) ||
            (producto.descripcion || "").toLowerCase().includes(query),
        ),
      }))
      .filter((categoria) => categoria.productos.length > 0);
  }, [categorias, searchQuery]);

  // ── Categories to display (all real categories + uncategorized fallback + search) ──
  const categoriasToShow = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = [...categoriasFiltradas];

    // uncategorized products as their own section at the end
    if (uncategorizedProducts && uncategorizedProducts.length > 0) {
      const filtered = query
        ? uncategorizedProducts.filter(
            (producto) =>
              producto.nombre.toLowerCase().includes(query) ||
              (producto.descripcion || "").toLowerCase().includes(query),
          )
        : uncategorizedProducts;

      if (filtered.length > 0) {
        result.push({
          id: "uncategorized",
          nombre: "Sin categoría",
          slug: "sin-categoria",
          productos: filtered,
        } as unknown as Categoria);
      }
    }

    return result;
  }, [
    categoriasFiltradas,
    uncategorizedProducts,
    searchQuery,
  ]);

  // ── Scroll to category ──────────────────────────────
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    const element = document.getElementById(`cat-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      scrollTimeoutRef.current = setTimeout(() => {
        const heading = element.querySelector("h3");
        heading?.focus({ preventScroll: true });
        scrollTimeoutRef.current = null;
      }, 500);
    }
  }, []);

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    isMobile,
    cartQuantityByProduct,
    categoriasToShow,
    scrollToCategory,
  };
}
