"use client";

import { useEffect, useState, useCallback } from "react";
import { Edit3, Trash2, Tag, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/core/lib/supabase/client";
import Image from "next/image";
import { IngredientBadge } from "./IngredientBadge";
import { deleteProductAction } from "../actions";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";

// ... (Interface UnifiedProduct se mantiene igual)
export interface UnifiedProduct {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  categoria_id: string | null;
  disponible: boolean;
  configuracion: {
    grupos_opciones?: Array<Record<string, unknown>>;
    variantes?: Array<{ nombre: string; precio: number | string }>;
    grupo_extras?: Array<{
      id: string;
      titulo: string;
      requerido: boolean;
      multiple: boolean;
      items: Array<{ id: string; nombre: string; precio: number | string }>;
    }>;
  } | null;
  categorias: { nombre: string } | null;
}

interface ProductTableProps {
  negocioId: string;
  onEdit: (producto: UnifiedProduct) => void;
}

export function ProductTable({ negocioId, onEdit }: ProductTableProps) {
  const [productos, setProductos] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const cargarProductos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(
          `id, nombre, descripcion, precio, imagen_url, disponible, categoria_id, configuracion, categorias(nombre)`,
        )
        .eq("negocio_id", negocioId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProductos((data as unknown as UnifiedProduct[]) || []);
    } catch (error) {
      console.error("Error Sync Catálogo:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  }, [supabase, negocioId]);

  useEffect(() => {
    cargarProductos();

    const canal: RealtimeChannel = supabase
      .channel(`realtime-catalog-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "productos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        () => {
          cargarProductos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
    // CORREGIDO: Cambiamos 'cargarCategorias' por 'cargarProductos'
  }, [cargarProductos, supabase, negocioId]);

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar irreversiblemente "${nombre}"?`)) return;
    try {
      await deleteProductAction(id);
      toast.success("Producto eliminado correctamente");
    } catch {
      toast.error("Error al eliminar el producto");
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-sm text-[var(--admin-text-muted)]">
        <Loader2
          className="animate-spin text-[var(--admin-accent)]"
          size={28}
        />
        <span>Cargando catálogo...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/30 text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
            <th className="p-4 pl-6">Producto</th>
            <th className="p-4 hidden md:table-cell">Sección</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Estado</th>
            <th className="p-4 pr-6 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)] text-sm">
          {productos.map((prod) => (
            <tr
              key={prod.id}
              className="hover:bg-[var(--admin-border)]/20 transition-colors group bg-[var(--admin-surface)]"
            >
              <td className="p-4 pl-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 shrink-0 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] overflow-hidden shadow-sm">
                    {prod.imagen_url ? (
                      <Image
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[var(--admin-text)] leading-none">
                      {prod.nombre}
                    </p>
                    <IngredientBadge configuracion={prod.configuracion} />
                    <p className="text-xs text-[var(--admin-text-muted)] line-clamp-1 max-w-[240px]">
                      {prod.descripcion || "Sin descripción"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4 hidden md:table-cell">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text)] bg-[var(--admin-bg)] px-2.5 py-1 rounded-md border border-[var(--admin-border)]">
                  <Tag size={12} /> {prod.categorias?.nombre || "General"}
                </span>
              </td>
              <td className="p-4 font-semibold text-[var(--admin-text)]">
                ${Number(prod.precio).toFixed(2)}
              </td>
              <td className="p-4">
                {prod.disponible ? (
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  >
                    Activo
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border-[var(--admin-border)]"
                  >
                    Pausado
                  </Badge>
                )}
              </td>
              <td className="p-4 pr-6 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(prod)}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded-lg transition-colors border border-transparent hover:border-[var(--admin-accent)]/20"
                    title="Editar producto"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(prod.id, prod.nombre)}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Eliminar producto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {productos.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="p-12 text-center text-[var(--admin-text-muted)] bg-[var(--admin-surface)]"
              >
                No hay productos registrados en el catálogo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
