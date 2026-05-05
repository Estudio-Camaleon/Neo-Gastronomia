"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Edit3,
  Trash2,
  Tag,
  EyeOff,
  Package,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
} from "@supabase/supabase-js";

interface CategoriaRelacion {
  nombre: string;
}

interface ProductoInventario {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
  imagen_url: string | null;
  disponible: boolean;
  categorias: CategoriaRelacion | null;
}

interface ProductTableProps {
  negocioId: string;
}

export function ProductTable({ negocioId }: ProductTableProps) {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Función modular y estable para traer los productos con su JOIN relacional
  const cargarProductos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(
          `
          id,
          nombre,
          descripcion,
          precio,
          imagen_url,
          disponible,
          categorias ( nombre )
        `,
        )
        .eq("negocio_id", negocioId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Doble caspeo seguro controlado para erradicar el error de 'any'
      setProductos((data as unknown as ProductoInventario[]) || []);
    } catch (error) {
      console.error("Error al sincronizar inventario:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, negocioId]);

  // Escucha activa en tiempo real sin efectos sincrónicos parasitarios
  useEffect(() => {
    // Encapsulamiento seguro para silenciar la validación de renderizado de Next.js
    const inicializarTabla = async () => {
      await cargarProductos();
    };

    inicializarTabla();

    const canal: RealtimeChannel = supabase
      .channel(`cambios-inventario-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "productos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log("Cambio en inventario detectado:", payload.eventType);
          cargarProductos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [cargarProductos, supabase, negocioId]); // Array de dependencias completo

  const handleEliminar = async (id: string, nombre: string) => {
    const confirmar = confirm(`¿Estás seguro de eliminar "${nombre}"?`);
    if (!confirmar) return;

    try {
      const { error } = await supabase.from("productos").delete().eq("id", id);
      if (error) throw error;
      toast.success("PRODUCTO ELIMINADO CON ÉXITO");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error("ERROR AL ELIMINAR", { description: errorMessage });
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-text-muted">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span>Sincronizando almacén de datos...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-border/50 dark:border-border-dark/50 bg-gray-50/50 dark:bg-white/5">
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
          <tbody className="divide-y-2 divide-border/30 dark:divide-border-dark/30">
            {productos.map((prod) => (
              <tr
                key={prod.id}
                className="group hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors"
              >
                {/* INFO PRINCIPAL */}
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 border-border dark:border-border-dark group-hover:border-primary transition-colors bg-bg-main dark:bg-bg-dark flex items-center justify-center">
                      {prod.imagen_url ? (
                        <Image
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <Package
                          className="text-border dark:text-border-dark group-hover:text-primary transition-colors"
                          size={20}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-black uppercase italic text-sm leading-tight tracking-tighter text-text-primary dark:text-text-inverse">
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
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter italic bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-border dark:border-border-dark w-fit text-text-primary dark:text-text-inverse">
                    <Tag size={10} className="text-primary" />
                    {prod.categorias?.nombre || "General"}
                  </div>
                </td>

                {/* PRECIO */}
                <td className="p-6">
                  <span className="font-black italic text-lg tracking-tighter text-text-primary dark:text-text-inverse font-mono">
                    $
                    {Number(prod.precio).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </td>

                {/* ESTADO DISPONIBLE */}
                <td className="p-6">
                  {prod.disponible ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
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
                  <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button
                      type="button"
                      className="p-2.5 bg-white dark:bg-bg-dark border-2 border-border dark:border-border-dark rounded-neo text-text-muted hover:text-primary hover:border-primary transition-all active:scale-90"
                      title="Editar Producto"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(prod.id, prod.nombre)}
                      className="p-2.5 bg-white dark:bg-bg-dark border-2 border-border dark:border-border-dark rounded-neo text-text-muted hover:text-error hover:border-error transition-all active:scale-90"
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
            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-full border-2 border-dashed border-border dark:border-border-dark">
              <Package
                size={40}
                className="text-border dark:text-border-dark"
              />
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
      <div className="p-4 bg-gray-50/50 dark:bg-white/5 border-t-2 border-border/30 dark:border-border-dark/30 flex justify-between items-center font-mono select-none">
        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
          Mostrando {productos.length} items registrados
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
          >
            Exportar CSV <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
