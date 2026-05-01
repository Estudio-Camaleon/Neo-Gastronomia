"use client";

import { useState } from "react";
import { CategorySelect } from "./CategorySelect";
import { crearProducto } from "@/app/actions/productos";
import { toast } from "sonner";
import { X } from "lucide-react";

export function ProductModal({
  negocioId,
  onClose,
}: {
  negocioId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!categoriaId) {
      toast.error("Por favor, selecciona una categoría.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      precio: formData.get("precio") as string,
      descripcion: formData.get("descripcion") as string,
      categoriaId: categoriaId,
    };

    const res = await crearProducto(data, negocioId);

    if (res.success) {
      toast.success("¡Producto creado con éxito!");
      onClose();
    } else {
      toast.error("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-surface dark:bg-bg-dark w-full max-w-md rounded-[32px] border border-border dark:border-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex justify-between items-center border-b border-border dark:border-border-dark">
          <h2 className="text-xl font-black text-text-primary dark:text-text-inverse uppercase tracking-tighter">
            Nuevo Producto
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-main dark:hover:bg-bg-darker rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">
              Nombre del Producto
            </label>
            <input
              required
              name="nombre"
              type="text"
              placeholder="Ej: Burger Triple Cheddar"
              className="w-full bg-bg-main dark:bg-bg-darker border-2 border-border dark:border-border-dark p-3 rounded-xl focus:border-primary outline-none transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">
                Precio ($)
              </label>
              <input
                required
                name="precio"
                type="number"
                placeholder="0.00"
                className="w-full bg-bg-main dark:bg-bg-darker border-2 border-border dark:border-border-dark p-3 rounded-xl focus:border-primary outline-none transition-all font-bold"
              />
            </div>
            <CategorySelect
              selectedId={categoriaId}
              onChange={setCategoriaId}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">
              Descripción (Opcional)
            </label>
            <textarea
              name="descripcion"
              rows={2}
              placeholder="Detalla los ingredientes..."
              className="w-full bg-bg-main dark:bg-bg-darker border-2 border-border dark:border-border-dark p-3 rounded-xl focus:border-primary outline-none transition-all font-medium text-sm"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear Producto 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
