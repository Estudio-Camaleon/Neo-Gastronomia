"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Edit3, Trash2, Tag, Package, Search, X, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/core/lib/supabase/client";
import Image from "next/image";
import { IngredientBadge } from "./IngredientBadge";
import { deleteProductAction, toggleProductAction } from "../actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDebounce } from "@/core/hooks/useDebounce";
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
  created_at: string | null;
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

const PAGE_SIZE = 20;
const formatPrecio = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(n);
const formatDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date(d)) : "—";

export function ProductTable({ negocioId, onEdit }: ProductTableProps) {
  const [productos, setProductos] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rawSearch, setRawSearch] = useState("");
  const searchQuery = useDebounce(rawSearch);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const cargarProductos = useCallback(
    async (pageNum: number, query?: string) => {
      setLoading(true);
      try {
        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let request = supabase
          .from("productos")
          .select(
            `id, nombre, descripcion, precio, imagen_url, disponible, created_at, categoria_id, configuracion, categorias(nombre)`,
            { count: "exact" },
          )
          .eq("negocio_id", negocioId)
          .order("created_at", { ascending: false });

        if (query) {
          request = request.ilike("nombre", `%${query}%`);
        }

        const { data, error, count } = await request
          .range(from, to)
          .returns<UnifiedProduct[]>();

        if (error) throw error;
        setProductos(data || []);
        if (count !== null) setTotalCount(count);
      } catch (error) {
        console.error("Error Sync Catálogo:", error);
        toast.error("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    },
    [negocioId],
  );

  // Use refs to avoid stale closures in Realtime callback
  const pageRef = useRef(page);
  const searchRef = useRef(searchQuery);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { searchRef.current = searchQuery; }, [searchQuery]);

  // Separate channel subscription — stable, doesn't depend on page/search
  useEffect(() => {
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
          cargarProductos(pageRef.current, searchRef.current);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [negocioId, cargarProductos]);

  useEffect(() => {
    cargarProductos(page, searchQuery);
  }, [page, searchQuery, cargarProductos]);

  const handleToggleDisponible = async (prod: UnifiedProduct) => {
    try {
      await toggleProductAction(prod.id, !prod.disponible);
      toast.success(
        prod.disponible
          ? `"${prod.nombre}" pausado`
          : `"${prod.nombre}" activado`,
      );
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const handleEliminar = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProductAction(deleteConfirm.id);
      toast.success("Producto eliminado correctamente");
    } catch {
      toast.error("Error al eliminar el producto");
    }
  };

  const hayBusqueda = searchQuery.trim().length > 0;
  const sinResultados = hayBusqueda && productos.length === 0 && !loading;

  // ── Shimmer skeleton ──
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="admin-card p-4 flex items-center gap-4 animate-pulse"
          >
            <div className="w-12 h-12 rounded-xl neo-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded-lg neo-shimmer" />
              <div className="h-3 w-32 rounded-lg neo-shimmer" />
            </div>
            <div className="h-4 w-20 rounded-lg neo-shimmer hidden sm:block" />
            <div className="h-6 w-16 rounded-lg neo-shimmer hidden sm:block" />
            <div className="h-8 w-20 rounded-lg neo-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* ── Search bar ── */}
      <div className="px-4 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/30">
        <div className="flex items-center gap-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--admin-accent)]/30 focus-within:border-[var(--admin-accent)] transition-all">
          <Search size={16} className="text-[var(--admin-text-muted)] shrink-0" />
          <input
            type="text"
            placeholder="Buscar producto por nombre…"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            aria-label="Buscar producto"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]"
          />
          {rawSearch && (
            <button
              onClick={() => setRawSearch("")}
              aria-label="Limpiar búsqueda"
              className="p-0.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <table className="w-full text-left border-collapse min-w-[400px]">
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
            <th className="p-3 pl-4 sm:pl-6 border-b border-[var(--admin-border)]">
              Producto
            </th>
            <th className="p-3 hidden lg:table-cell border-b border-[var(--admin-border)]">
              Sección
            </th>
            <th className="p-3 border-b border-[var(--admin-border)] hidden sm:table-cell">
              Precio
            </th>
            <th className="p-3 border-b border-[var(--admin-border)] hidden lg:table-cell">
              Cargado
            </th>
            <th className="p-3 border-b border-[var(--admin-border)] hidden sm:table-cell">
              Estado
            </th>
            <th className="p-3 pr-4 sm:pr-6 text-right border-b border-[var(--admin-border)]">
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
              <td className="p-3 pl-4 sm:pl-6">
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-10 h-10 shrink-0 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] overflow-hidden shadow-sm">
                    {prod.imagen_url && !imgErrors.has(prod.id) ? (
                      <Image
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="40px"
                        onError={() => setImgErrors((prev) => new Set(prev).add(prod.id))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-[var(--admin-text)] leading-tight flex items-center gap-2 flex-wrap text-sm">
                      {prod.nombre}
                      <span className="lg:hidden inline-flex items-center gap-1 text-[9px] font-medium text-[var(--admin-text-muted)] bg-[var(--admin-bg)] px-1.5 py-0.5 rounded border border-[var(--admin-border)] whitespace-nowrap">
                        {prod.categorias?.nombre || "General"}
                      </span>
                    </p>
                    <IngredientBadge configuracion={prod.configuracion} />
                    <p className="text-[11px] text-[var(--admin-text-muted)] line-clamp-1 max-w-[160px] sm:max-w-[220px]">
                      {prod.descripcion || "Sin descripción"}
                    </p>
                    {/* Mobile-only price + status row */}
                    <div className="flex sm:hidden items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[var(--admin-text)]">
                        {formatPrecio(prod.precio)}
                      </span>
                      {prod.disponible ? (
                        <span className="text-[10px] font-semibold admin-success-text admin-success-bg px-1.5 py-0.5 rounded-full border admin-success-border leading-tight">
                          Activo
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[var(--admin-text-muted)] bg-[var(--admin-bg)] px-1.5 py-0.5 rounded-full border border-[var(--admin-border)] leading-tight">
                          Pausado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-3 hidden lg:table-cell">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text)] bg-[var(--admin-bg)] px-2 py-1 rounded-md border border-[var(--admin-border)] whitespace-nowrap">
                  <Tag size={12} /> {prod.categorias?.nombre || "General"}
                </span>
              </td>
              <td className="p-3 font-semibold text-[var(--admin-text)] hidden sm:table-cell text-sm whitespace-nowrap">
                {formatPrecio(prod.precio)}
              </td>
              <td className="p-3 hidden lg:table-cell text-xs text-[var(--admin-text-muted)] whitespace-nowrap">
                {formatDate(prod.created_at)}
              </td>
              <td className="p-3 hidden sm:table-cell">
                {prod.disponible ? (
                  <Badge
                    variant="default"
                    className="admin-success-bg admin-success-text admin-success-border text-[11px]"
                  >
                    Activo
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border-[var(--admin-border)] text-[11px]"
                  >
                    Pausado
                  </Badge>
                )}
              </td>
              <td className="p-3 pr-4 sm:pr-6 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => handleToggleDisponible(prod)}
                    className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                      prod.disponible
                        ? "text-green-500 hover:bg-green-500/10 hover:border-green-500/20"
                        : "text-[var(--admin-text-muted)] hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20"
                    }`}
                    title={prod.disponible ? "Pausar producto" : "Activar producto"}
                    aria-label={`${prod.disponible ? "Pausar" : "Activar"} ${prod.nombre}`}
                  >
                    {prod.disponible ? <Power size={15} /> : <PowerOff size={15} />}
                  </button>
                  <button
                    onClick={() => onEdit(prod)}
                    className="p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded-lg transition-colors border border-transparent hover:border-[var(--admin-accent)]/20"
                    title="Editar producto"
                    aria-label={`Editar ${prod.nombre}`}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({ id: prod.id, nombre: prod.nombre })
                    }
                    className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Eliminar producto"
                    aria-label={`Eliminar ${prod.nombre}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {/* ── No results (search with no match) ── */}
          {sinResultados && (
            <tr>
              <td colSpan={5} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
                    <Search size={36} strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-black tracking-tight text-[var(--admin-text)] mb-1">
                    Sin resultados
                  </p>
                  <p className="text-sm font-medium text-[var(--admin-text-muted)]">
                    No hay productos que coincidan con <strong>&quot;{searchQuery}&quot;</strong>
                  </p>
                </div>
              </td>
            </tr>
          )}

          {/* ── Empty catalog ── */}
          {!hayBusqueda && productos.length === 0 && !loading && (
            <tr>
              <td colSpan={5} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
                    <Package size={36} strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-black tracking-tight text-[var(--admin-text)] mb-1">
                    Catálogo vacío
                  </p>
                  <p className="text-sm font-medium text-[var(--admin-text-muted)] max-w-sm">
                    No hay productos registrados. Creá tu primer producto usando el botón superior.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]/30">
          <span className="text-xs font-medium text-[var(--admin-text-muted)]">
            {totalCount} producto{totalCount !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pageNum = start + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                      pageNum === page
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 hover:text-[var(--admin-text)]"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
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
