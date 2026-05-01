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
        className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
      >
        <Plus size={18} strokeWidth={3} />
        Nuevo Producto
      </button>

      {isOpen && (
        <ProductModal negocioId={negocioId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
