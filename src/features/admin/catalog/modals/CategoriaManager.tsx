"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { Tag, Plus, Trash2, Loader2, Hash, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { CategoriaRow } from "@/core/types/domain";

const supabase = createClient();

type CategoriaBase = CategoriaRow;

interface CategoriaManagerProps {
  negocioId: string;
  onClose: () => void;
}

export function CategoriaManager({
  negocioId,
  onClose,
}: CategoriaManagerProps) {
  const [categorias, setCategorias] = useState<CategoriaBase[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const slugificar = (texto: string): string => {
    return texto
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const cargarCategorias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("nombre", { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoadingList(false);
    }
  }, [supabase, negocioId]);

  useEffect(() => {
    cargarCategorias();

    const canal: RealtimeChannel = supabase
      .channel(`realtime-categorias-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categorias",
          filter: `negocio_id=eq.${negocioId}`,
        },
        () => {
          cargarCategorias();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [cargarCategorias, supabase, negocioId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = nuevoNombre.trim();
    if (!nombreLimpio || isPending) return;

    setIsPending(true);
    const slug = slugificar(nombreLimpio);

    try {
      const { error } = await supabase.from("categorias").insert({
        nombre: nombreLimpio,
        slug,
        negocio_id: negocioId,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Categoría duplicada", {
            description: "Ya existe una sección con ese nombre.",
          });
        } else {
          throw error;
        }
      } else {
        setNuevoNombre("");
        toast.success("Categoría creada con éxito");
      }
    } catch {
      toast.error("Error al crear la categoría");
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", deleteConfirm.id)
        .eq("negocio_id", negocioId);

      if (error) throw error;
      toast.success("Categoría eliminada");
    } catch {
      toast.error("Error al eliminar la categoría");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="categoria-manager-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[var(--admin-surface)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--admin-border)]">
        <div className="px-6 py-4 flex justify-between items-center border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[var(--admin-accent)]" />
            <h2
              id="categoria-manager-title"
              className="font-bold text-[var(--admin-text)] text-lg"
            >
              Secciones del Menú
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-border)]/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="text-sm font-semibold text-[var(--admin-text)] block">
              Crear Nueva Sección
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Hamburguesas, Bebidas..."
                  className="w-full bg-[var(--admin-bg)] py-2.5 pl-9 pr-3 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all disabled:opacity-50"
                  disabled={isPending || loadingList}
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !nuevoNombre.trim() || loadingList}
                className="bg-[var(--admin-accent)] hover:opacity-90 text-white font-semibold text-sm px-4 rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} />
                )}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--admin-border)]/50">
              <p className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Secciones Activas
              </p>
              <span className="text-xs font-semibold bg-[var(--admin-bg)] text-[var(--admin-text)] border border-[var(--admin-border)] px-2 py-0.5 rounded-full">
                {categorias.length}
              </span>
            </div>

            {loadingList ? (
              <div className="py-8 flex flex-col items-center justify-center text-sm text-[var(--admin-text-muted)] gap-3">
                <Loader2
                  className="animate-spin text-[var(--admin-accent)]"
                  size={24}
                />
                <span>Cargando secciones...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="group flex items-center justify-between bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg p-3 shadow-sm hover:border-[var(--admin-accent)]/50 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[var(--admin-text)]">
                        {cat.nombre}
                      </span>
                      <span className="text-xs text-[var(--admin-text-muted)]">
                        /{cat.slug}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({ id: cat.id, nombre: cat.nombre })
                      }
                      className="p-2 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar sección"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {categorias.length === 0 && (
                  <div className="w-full py-8 text-center border border-dashed border-[var(--admin-border)] rounded-xl bg-[var(--admin-bg)]/30">
                    <p className="text-sm text-[var(--admin-text-muted)]">
                      Aún no has creado ninguna sección.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmModal
          title="Eliminar Sección"
          message={`¿Eliminar la categoría "${deleteConfirm.nombre}"? Los productos asociados quedarán sin sección.`}
          confirmLabel="Eliminar"
          variant="danger"
          onConfirm={handleRemove}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
