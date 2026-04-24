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
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {/* Botón para "Todos" */}
      <button
        onClick={() => onSelectCategory("Todos")}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          selectedCategory === "Todos"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:border-blue-600"
        }`}
      >
        Todos
      </button>

      {/* Categorías dinámicas */}
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === cat
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-600"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
