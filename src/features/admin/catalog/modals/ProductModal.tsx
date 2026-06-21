"use client";

import { useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { ProductoForm } from "../forms/ProductoForm";
import { UnsavedChangesModal } from "@/components/ui/unsaved-changes-modal";
import { useScrollLock } from "@/core/hooks/useScrollLock";
import type { UnifiedProduct } from "../components/ProductTable";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const submitRef = useRef<(() => Promise<void>) | null>(null);
  useScrollLock(true);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
      return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  const confirmSave = useCallback(() => {
    setShowUnsavedModal(false);
    submitRef.current?.();
  }, []);

  const discardClose = useCallback(() => {
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
          <ProductoForm
            negocioId={negocioId}
            initialData={initialData}
            onSuccess={onClose}
            onUnsavedChange={setHasUnsavedChanges}
            submitRef={submitRef}
          />
        </div>
      </div>

      <UnsavedChangesModal
        open={showUnsavedModal}
        onConfirm={confirmSave}
        onCancel={cancelClose}
        onDiscard={discardClose}
      />
    </div>
  );
}
