"use client";

import {
  Edit3,
  Trash2,
  Tag,
  EyeOff,
  Package,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProductTableProps {
  productos: any[];
}

export function ProductTable({ productos }: ProductTableProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleEliminar = async (id: string, nombre: string) => {
    const confirmar = confirm(`¿Estás seguro de eliminar "${nombre}"?`);
    if (!confirmar) return;

    try {
      const { error } = await supabase.from("productos").delete().eq("id", id);

      if (error) throw error;

      toast.success("PRODUCTO ELIMINADO");
      router.refresh();
    } catch (error: any) {
      toast.error("ERROR AL ELIMINAR", {
        description: error.message,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-border/50 bg-gray-50/50 dark:bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                Detalle del Producto
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hidden md:table-cell">
                Categoría
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                Precio
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                Estado
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border/30">
            {productos.map((prod) => (
              <tr
                key={prod.id}
                className="group hover:bg-primary/5 transition-colors"
              >
                {/* INFO PRINCIPAL */}
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 border-border group-hover:border-primary transition-colors bg-bg-main flex items-center justify-center">
                      {prod.imagen_url ? (
                        <img
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package
                          className="text-border group-hover:text-primary transition-colors"
                          size={20}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-black uppercase italic text-sm leading-tight tracking-tighter">
                        {prod.nombre}
                      </p>
                      <p className="text-[10px] font-bold text-text-muted line-clamp-1 max-w-[200px]">
                        {prod.descripcion || "Sin descripción técnica añadida"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CATEGORÍA */}
                <td className="p-6 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter italic bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-border w-fit">
                    <Tag size={10} className="text-primary" />
                    {prod.categorias?.nombre || "General"}
                  </div>
                </td>

                {/* PRECIO */}
                <td className="p-6">
                  <span className="font-black italic text-lg tracking-tighter">
                    $
                    {Number(prod.precio).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </td>

                {/* ESTADO DISPONIBLE */}
                <td className="p-6">
                  {prod.disponible ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Activo
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error opacity-60">
                      <EyeOff size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Pausado
                      </span>
                    </div>
                  )}
                </td>

                {/* ACCIONES */}
                <td className="p-6">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button
                      className="p-2.5 bg-white dark:bg-bg-dark border-2 border-border rounded-neo text-text-muted hover:text-primary hover:border-primary transition-all active:scale-90"
                      title="Editar Producto"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminar(prod.id, prod.nombre)}
                      className="p-2.5 bg-white dark:bg-bg-dark border-2 border-border rounded-neo text-text-muted hover:text-error hover:border-error transition-all active:scale-90"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productos.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-full border-2 border-dashed border-border">
              <Package size={40} className="text-border" />
            </div>
            <div className="space-y-1">
              <p className="font-black uppercase italic tracking-tighter text-text-muted">
                No se detectaron productos en el radar
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted opacity-50">
                Inicia la carga desde el formulario superior
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer de la tabla */}
      <div className="p-4 bg-gray-50/50 dark:bg-white/5 border-t-2 border-border/30 flex justify-between items-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
          Mostrando {productos.length} items registrados
        </p>
        <div className="flex gap-2">
          <button className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
            Exportar CSV <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
