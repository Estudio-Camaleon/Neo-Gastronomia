"use client";

import { useState } from "react";
import { Plus, FolderPlus, Layers } from "lucide-react";
import { ProductModal } from "../modals/ProductModal";
import { CategoriaManager } from "../modals/CategoriaManager";
// 1. IMPORTANTE: Importamos la interfaz oficial y la tabla juntas
import { ProductTable, type UnifiedProduct } from "./ProductTable";
import { Button } from "@/components/ui/button";

interface AddProductSectionProps {
  negocioId: string;
}

export function AddProductSection({ negocioId }: AddProductSectionProps) {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // 2. Sincronizamos el estado local con el contrato oficial
  const [productoAEditar, setProductoAEditar] = useState<UnifiedProduct | null>(
    null,
  );

  // 3. Sincronizamos el argumento de la función de apertura
  const handleAbrirEdicion = (producto: UnifiedProduct) => {
    setProductoAEditar(producto);
    setIsProductOpen(true);
  };

  const handleCerrarModal = () => {
    setProductoAEditar(null);
    setIsProductOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Contenedor Maestro Brutalista de Control */}
      <div className="bg-white border-4 border-black p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 stroke-[3]" /> CONTROL DE CATÁLOGO
          </h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
            Gestión multi-tenant de inventario, stock y modificadores jsonb.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => setIsCategoryOpen(true)}
            className="flex-1 md:flex-initial bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-gray-100 font-black uppercase text-xs p-3 flex items-center justify-center gap-2"
          >
            <FolderPlus size={16} strokeWidth={2.5} /> Secciones
          </Button>

          <Button
            onClick={() => setIsProductOpen(true)}
            className="flex-1 md:flex-initial bg-[#A3FF00] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-white font-black uppercase text-xs p-3 flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} /> Agregar Ítem
          </Button>
        </div>
      </div>

      {/* Grid Tabla de Datos */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-4 bg-black text-white font-mono text-xs uppercase tracking-widest">
          💻 Terminal de Productos Activos
        </div>

        {/* Aquí la prop onEdit se vuelve 100% azul/verde y válida */}
        <ProductTable negocioId={negocioId} onEdit={handleAbrirEdicion} />
      </div>

      {/* Orquestación de Modales */}
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
