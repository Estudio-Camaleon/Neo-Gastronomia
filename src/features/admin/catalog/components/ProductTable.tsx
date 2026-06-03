"use client";

import { useEffect, useState, useCallback } from "react";
import { Edit3, Trash2, Tag, Package } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/core/lib/supabase/client";
import Image from "next/image";
import { IngredientBadge } from "./IngredientBadge";
import { deleteProductAction } from "../actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";

const supabase = createClient();

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
  } | null;
  categorias: { nombre: string } | null;
}

interface ProductTableProps {
  negocioId: string;
  onEdit: (producto: UnifiedProduct) => void;
}

const PAGE_SIZE = 10;

export function ProductTable({ negocioId, onEdit }: ProductTableProps) {
  const [productos, setProductos] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const cargarProductos = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error, count } = await supabase
          .from("productos")
          .select(
            `id, nombre, descripcion, precio, imagen_url, disponible, categoria_id, configuracion, categorias(nombre)`,
            { count: "exact" },
          )
          .eq("negocio_id", negocioId)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        setProductos((data as unknown as UnifiedProduct[]) || []);
        if (count !== null) setTotalCount(count);
      } catch (error) {
        console.error("Error Sync Catálogo:", error);
        toast.error("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    },
    [supabase, negocioId],
  );

  useEffect(() => {
    cargarProductos(page);

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
          cargarProductos(page);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [cargarProductos, supabase, negocioId, page]);

  const handleEliminar = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProductAction(deleteConfirm.id);
      toast.success("Producto eliminado correctamente");
    } catch {
      toast.error("Error al eliminar el producto");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="admin-card p-4 flex items-center gap-4 animate-pulse"
          >
            <div className="w-12 h-12 rounded-xl shimmer-loader" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded-lg shimmer-loader" />
              <div className="h-3 w-32 rounded-lg shimmer-loader" />
            </div>
            <div className="h-4 w-20 rounded-lg shimmer-loader" />
            <div className="h-6 w-16 rounded-lg shimmer-loader" />
            <div className="h-8 w-20 rounded-lg shimmer-loader" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
            <th className="p-4 pl-6 border-b border-[var(--admin-border)]">
              Producto
            </th>
            <th className="p-4 hidden md:table-cell border-b border-[var(--admin-border)]">
              Sección
            </th>
            <th className="p-4 border-b border-[var(--admin-border)]">
              Precio
            </th>
            <th className="p-4 border-b border-[var(--admin-border)]">
              Estado
            </th>
            <th className="p-4 pr-6 text-right border-b border-[var(--admin-border)]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)] text-sm">
          {productos.map((prod) => (
            <tr
              key={prod.id}
              className="hover:bg-[var(--admin-accent)]/5 transition-all duration-200 group"
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
                    onClick={() =>
                      setDeleteConfirm({ id: prod.id, nombre: prod.nombre })
                    }
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
                className="p-16 text-center text-sm font-medium text-[var(--admin-text-muted)]"
              >
                No hay productos registrados en el catálogo.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]/30">
          <span className="text-xs font-medium text-[var(--admin-text-muted)]">
            {totalCount} producto{totalCount !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs font-medium text-[var(--admin-text-muted)] px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Eliminar Producto"
          message={`¿Eliminar irreversiblemente "${deleteConfirm.nombre}"?`}
          confirmLabel="Eliminar"
          variant="danger"
          onConfirm={handleEliminar}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
