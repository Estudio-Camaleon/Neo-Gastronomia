"use client";

import { motion } from "framer-motion";
import { categoryVariants } from "./variants";
import type { Categoria } from "@/features/public-menu/types";

interface CategoryTabsProps {
  categorias: Categoria[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryTabs({
  categorias,
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  if (categorias.length === 0) return null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.03 },
        },
      }}
      initial="hidden"
      animate="visible"
      className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
      role="tablist"
      aria-label="Categorías del menú"
    >
      {categorias.map((cat) => (
        <motion.button
          key={cat.id}
          variants={categoryVariants}
          type="button"
          role="tab"
          aria-selected={activeCategory === cat.id}
          onClick={() => onSelectCategory(cat.id)}
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
  );
}
