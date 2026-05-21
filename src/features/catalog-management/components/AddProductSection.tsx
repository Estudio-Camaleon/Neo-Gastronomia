"use client";

import { useState } from "react";
import { Plus, FolderPlus, Layers, Package } from "lucide-react";
import { ProductModal } from "../modals/ProductModal";
import { CategoriaManager } from "../modals/CategoriaManager";
import { ProductTable, type UnifiedProduct } from "./ProductTable";

interface AddProductSectionProps {
  negocioId: string;
}

export function AddProductSection({ negocioId }: AddProductSectionProps) {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<UnifiedProduct | null>(
    null,
  );

  const handleAbrirEdicion = (producto: UnifiedProduct) => {
    setProductoAEditar(producto);
    setIsProductOpen(true);
  };

  const handleCerrarModal = () => {
    setProductoAEditar(null);
    setIsProductOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="admin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--admin-surface)] border border-[var(--admin-border)] dark:bg-zinc-900/90 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--admin-text)] flex items-center gap-2">
            <Layers className="h-6 w-6 text-[var(--admin-accent)]" />
            Catálogo de Productos
          </h2>
          <p className="text-sm text-[var(--admin-text-muted)] font-medium">
            Gestiona tu inventario, secciones y variantes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsCategoryOpen(true)}
            className="flex-1 md:flex-initial bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 rounded-lg font-semibold text-sm px-4 py-2.5 flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <FolderPlus size={16} /> Secciones
          </button>

          <button
            onClick={() => setIsProductOpen(true)}
            className="flex-1 md:flex-initial bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent)]/90 rounded-lg font-semibold text-sm px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={16} /> Agregar Ítem
          </button>
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden bg-[var(--admin-surface)] border border-[var(--admin-border)] dark:bg-zinc-900/90 rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-[var(--admin-border)] bg-gray-50/50 dark:bg-zinc-800/40 flex items-center gap-2">
          <Package className="h-4 w-4 text-[var(--admin-text-muted)]" />
          <span className="font-semibold text-gray-700 dark:text-zinc-300 text-sm">
            Ítems Activos
          </span>
        </div>

        <ProductTable negocioId={negocioId} onEdit={handleAbrirEdicion} />
      </div>

      {isProductOpen && (
        <ProductModal
          negocioId={negocioId}
          initialData={productoAEditar}
          onClose={handleCerrarModal}
        />
      )}

      {isCategoryOpen && (
        <CategoriaManager
          negocioId={negocioId}
          onClose={() => setIsCategoryOpen(false)}
        />
      )}
    </div>
  );
}
