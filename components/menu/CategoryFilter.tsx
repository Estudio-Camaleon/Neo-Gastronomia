"use client";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  // Combinamos "Todos" con las categorías recibidas
  const allCategories = ["Todos", ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {allCategories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              isSelected
                ? "bg-primary border-primary text-text-primary dark:text-text-inverse"
                : "bg-surface dark:bg-surface-dark border-border dark:border-border-dark text-text-secondary hover:border-primary hover:text-text-primary"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
