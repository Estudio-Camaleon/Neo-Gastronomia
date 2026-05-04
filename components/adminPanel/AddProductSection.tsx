"use client";

import { useState } from "react";
import { ProductModal } from "./ProductModal";
import { Plus } from "lucide-react";

export function AddProductSection({ negocioId }: { negocioId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        // Cambio: rounded-2xl -> rounded-neo (según tu tailwind.config)
        className="bg-primary text-white px-6 py-3 rounded-neo text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
      >
        <Plus size={18} strokeWidth={3} />
        Nuevo Producto
      </button>

      {/* 
          IMPORTANTE: El modal debe recibir la lógica de cierre 
          y preferiblemente manejar la carga mediante una Server Action 
          para evitar saturar las conexiones de Supabase.
      */}
      {isOpen && (
        <ProductModal negocioId={negocioId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
