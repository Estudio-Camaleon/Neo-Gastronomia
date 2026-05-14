"use client";

import { useState } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { ProductModal } from "./modals/ProductModal";
import { CategoriaManager } from "./modals/CategoriaManager";
import { ProductTable } from "./ui/ProductTable";
import { Button, Card } from "../ui"; // Importamos del Core
interface AddProductSectionProps {
  negocioId: string;
}
export function AddProductSection({ negocioId }: AddProductSectionProps) {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Barra de Acciones con Card */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Gestión de Inventario
          </h2>
          <p className="text-xs text-text-muted font-mono uppercase">
            Control de stock y categorías en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={FolderPlus}
            onClick={() => setIsCategoryOpen(true)}
          >
            Categorías
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsProductOpen(true)}
          >
            Nuevo Producto
          </Button>
        </div>
      </Card>

      {/* Tabla envuelta en Card para consistencia de sombras */}
      <Card title="Listado de Productos" className="p-0 overflow-hidden">
        <ProductTable negocioId={negocioId} />
      </Card>

      {/* Modales se mantienen igual */}
      {isProductOpen && (
        <ProductModal
          negocioId={negocioId}
          onClose={() => setIsProductOpen(false)}
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
