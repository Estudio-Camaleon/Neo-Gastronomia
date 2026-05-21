"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { X, Loader2 } from "lucide-react";
import { ProductoForm } from "../forms/ProductoForm";
import type { UnifiedProduct } from "../components/ProductTable";

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

  useEffect(() => {
    const fetchCategorias = async () => {
      const supabase = createClient();
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
      document.body.style.overflow = "unset";
    };
  }, [negocioId]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-zinc-800">
        <button
          onClick={onClose}
          className="absolute z-50 -top-3 -right-3 p-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 rounded-full border border-gray-200 dark:border-zinc-700 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="w-full h-full overflow-hidden flex flex-col rounded-2xl">
          {loadingCats ? (
            <div className="flex flex-col justify-center items-center h-[50vh] text-gray-500 dark:text-zinc-400 gap-3 bg-white dark:bg-zinc-900">
              <Loader2
                className="animate-spin text-[var(--admin-accent)]"
                size={32}
              />
              <p className="text-sm font-medium">Cargando formulario...</p>
            </div>
          ) : (
            <ProductoForm
              negocioId={negocioId}
              categorias={categorias}
              initialData={initialData}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
