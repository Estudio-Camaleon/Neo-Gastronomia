"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { X } from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { ProductoForm } from "../forms/ProductoForm";
import { UnsavedChangesModal } from "@/components/ui/unsaved-changes-modal";
import type { UnifiedProduct } from "../components/ProductTable";

const supabase = createClient();

interface Categoria {
  id: string;
  nombre: string;
}

interface ProductModalProps {
  negocioId: string;
  onClose: () => void;
  initialData?: UnifiedProduct | null;
}

export function ProductModal({
  negocioId,
  onClose,
  initialData = null,
}: ProductModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data } = await supabase
        .from("categorias")
        .select("id, nombre")
        .eq("negocio_id", negocioId);

      if (data) setCategorias(data);
      setLoadingCats(false);
    };
    fetchCategorias();

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [negocioId]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
      return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  const confirmClose = useCallback(() => {
    setShowUnsavedModal(false);
    onClose();
  }, [onClose]);

  const cancelClose = useCallback(() => {
    setShowUnsavedModal(false);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={initialData ? "Editar Producto" : "Nuevo Producto"}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl animate-in zoom-in-95 duration-200">
        {/* BOTÓN CERRAR CORREGIDO */}
        <button
          onClick={handleClose}
          className="absolute z-50 top-5 right-5 p-2 bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-border)]/50 rounded-full border border-[var(--admin-border)] shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl">
          {loadingCats ? (
            <div className="flex flex-col justify-center items-center h-[50vh] text-[var(--admin-text-muted)] gap-3 bg-[var(--admin-surface)]">
              <FoodMini size={28} />
              <p className="text-sm font-medium">Cargando formulario...</p>
            </div>
          ) : (
            <ProductoForm
              negocioId={negocioId}
              categorias={categorias}
              initialData={initialData}
              onSuccess={onClose}
              onUnsavedChange={setHasUnsavedChanges}
            />
          )}
        </div>
      </div>

      <UnsavedChangesModal
        open={showUnsavedModal}
        onConfirm={confirmClose}
        onCancel={cancelClose}
        onDiscard={confirmClose}
      />
    </div>
  );
}
