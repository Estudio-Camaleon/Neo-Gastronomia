"use client";

import { motion } from "framer-motion";
import { categoryVariants } from "../variants";
import type { Categoria } from "@/features/public-menu/types";
import { useRef, useCallback } from "react";

interface CategoryTabsProps {
  categorias: Categoria[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  scrollable?: boolean;
  className?: string;
}

export function CategoryTabs({
  categorias,
  activeCategory,
  onSelectCategory,
  scrollable = false,
  className = "",
}: CategoryTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;
      if (e.key === "ArrowRight") {
        nextIndex = (index + 1) % categorias.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (index - 1 + categorias.length) % categorias.length;
      }
      if (nextIndex !== null && categorias[nextIndex]) {
        e.preventDefault();
        onSelectCategory(categorias[nextIndex].id);
        const buttons = listRef.current?.querySelectorAll('[role="tab"]');
        (buttons?.[nextIndex] as HTMLButtonElement)?.focus();
      }
    },
    [categorias, onSelectCategory],
  );

  if (categorias.length === 0) return null;

  return (
    <nav aria-label="Categorías del menú" className={className}>
      <motion.div
        ref={listRef}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.03 },
          },
        }}
        initial="hidden"
        animate="visible"
        className={`flex gap-1.5 ${
          scrollable
            ? "overflow-x-auto flex-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex-wrap justify-center"
        }`}
        role="tablist"
        aria-label="Categorías del menú"
      >
        {categorias.map((cat, i) => (
          <motion.button
            key={cat.id}
            variants={categoryVariants}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => onSelectCategory(cat.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            whileTap={{ scale: 0.95 }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-[var(--color-custom-900)] text-white shadow-md shadow-black/10"
                : "border border-[var(--color-custom-200)] bg-[var(--color-custom-surface-strong)] text-[var(--color-custom-700)] hover:border-[var(--color-custom-400)] hover:text-[var(--color-custom-900)]"
            }`}
          >
            {cat.nombre}
          </motion.button>
        ))}
      </motion.div>
    </nav>
  );
}
