"use client";

import { useState } from "react";
import { crearCategoria, eliminarCategoria } from "@/app/actions/categorias";
import { Tag, Plus, Trash2, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

interface CategoriaManagerProps {
  negocioId: string;
  categorias: any[];
}

export function CategoriaManager({
  negocioId,
  categorias,
}: CategoriaManagerProps) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevoNombre.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    setIsPending(true);

    try {
      // La Server Action ahora maneja la creación del slug y la vinculación al negocio_id
      const res = await crearCategoria(negocioId, nuevoNombre);

      if (res.success) {
        setNuevoNombre("");
        toast.success("CATEGORÍA AÑADIDA", {
          description: `"${nuevoNombre.toUpperCase()}" se sumó a tu menú.`,
        });
      } else {
        // Manejo de error de duplicados (Constraint de la DB)
        if (res.error?.includes("duplicate key")) {
          toast.error("ERROR: Esta categoría ya existe en tu local.");
        } else {
          toast.error("Error al crear", { description: res.error });
        }
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async (id: string, nombre: string) => {
    if (
      !confirm(
        `¿Eliminar la categoría "${nombre}"? Esto afectará a los productos vinculados.`,
      )
    )
      return;

    try {
      const res = await eliminarCategoria(id);
      if (res.success) {
        toast.success("CATEGORÍA ELIMINADA");
      } else {
        toast.error("No se pudo eliminar", { description: res.error });
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    }
  };

  return (
    <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 space-y-6 shadow-sm animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tag className="text-primary w-5 h-5" />
        </div>
        <h2 className="font-black uppercase italic text-lg tracking-tighter leading-none">
          Categorías del Menú
        </h2>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAdd} className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
          Nueva Sección
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-50" />
            <input
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="EJ: BURGUERS, BEBIDAS..."
              className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border focus:border-primary outline-none font-bold uppercase italic text-xs transition-all"
              disabled={isPending}
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !nuevoNombre.trim()}
            className="bg-black text-white px-6 rounded-neo hover:invert transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Plus size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Lista de Categorías */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
          Lista Activa ({categorias.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center gap-2 bg-gray-50 dark:bg-white/5 pl-4 pr-2 py-2.5 rounded-full border-2 border-border hover:border-primary/50 transition-all"
            >
              <span className="text-[10px] font-black uppercase italic tracking-tight">
                {cat.nombre}
              </span>
              <button
                onClick={() => handleRemove(cat.id, cat.nombre)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-error transition-all"
                title="Eliminar categoría"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {categorias.length === 0 && (
            <div className="w-full py-8 text-center border-2 border-dashed border-border rounded-neo opacity-30">
              <p className="text-[10px] font-bold uppercase italic">
                Sin categorías definidas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nota Técnica */}
      <div className="pt-4 border-t border-dashed border-border">
        <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest leading-tight">
          El sistema genera automáticamente el slug para la URL pública.
        </p>
      </div>
    </section>
  );
}
