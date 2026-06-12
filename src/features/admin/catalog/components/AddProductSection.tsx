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
      {/* HEADER CARD */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-sm">
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
            className="flex-1 md:flex-initial bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] rounded-lg font-semibold text-sm px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <FolderPlus size={16} /> Categorias
          </button>

          <button
            onClick={() => setIsProductOpen(true)}
            className="flex-1 md:flex-initial bg-[var(--admin-accent)] text-white hover:opacity-90 rounded-lg font-semibold text-sm px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={16} /> Crear Producto
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 flex items-center gap-2">
          <Package className="h-4 w-4 text-[var(--admin-text-muted)]" />
          <span className="font-semibold text-[var(--admin-text)] text-sm">
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
