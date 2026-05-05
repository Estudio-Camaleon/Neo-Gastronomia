"use client";

import { useEffect, useState, useCallback } from "react";
import { crearCategoria, eliminarCategoria } from "@/app/actions/categorias";
import { createClient } from "@/lib/supabase/client";
import { Tag, Plus, Trash2, Loader2, Hash, X } from "lucide-react";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

interface CategoriaBase {
  id: string;
  nombre: string;
  slug: string;
  negocio_id: string;
}

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
  const supabase = createClient();

  // Traer las categorías asociadas al local (Estable con useCallback)
  const cargarCategorias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre, slug, negocio_id")
        .eq("negocio_id", negocioId)
        .order("nombre", { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al refrescar categorías:", err);
    } finally {
      setLoadingList(false);
    }
  }, [supabase, negocioId]);

  // Suscripción Realtime para actualizar las burbujas al instante sin renders en cascada
  useEffect(() => {
    // Encapsulamiento seguro para evitar ejecuciones asíncronas directas en el hilo de montaje
    const inicializarComponente = async () => {
      await cargarCategorias();
    };

    inicializarComponente();

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
    if (!nuevoNombre.trim() || isPending) return;

    setIsPending(true);

    try {
      const res = await crearCategoria(negocioId, nuevoNombre.trim());

      if (res.success) {
        setNuevoNombre("");
        toast.success("CATEGORÍA AÑADIDA 🎉");
      } else {
        if (res.error?.includes("duplicate key")) {
          toast.error("ERROR: Esta categoría ya existe en tu local.");
        } else {
          toast.error("Error al crear", { description: res.error });
        }
      }
    } catch {
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
    } catch {
      toast.error("Error al procesar la solicitud");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-bg-darker w-full max-w-lg rounded-super border-2 border-border dark:border-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Cabecera del Modal */}
        <div className="p-6 flex justify-between items-center border-b-2 border-border dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Tag size={18} />
            </div>
            <h2 className="font-black uppercase italic text-lg tracking-tighter text-text-primary dark:text-text-inverse">
              Categorías del Menú
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-primary dark:text-text-inverse hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo / Formulario e Inputs */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
              Nueva Sección
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-50" />
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="EJ: BURGUERS, BEBIDAS..."
                  className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border dark:border-border-dark focus:border-primary text-text-primary dark:text-text-inverse outline-none font-bold uppercase italic text-xs transition-all placeholder:font-normal placeholder:normal-case"
                  disabled={isPending || loadingList}
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !nuevoNombre.trim() || loadingList}
                className="bg-black text-white dark:bg-primary px-6 rounded-neo hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 flex items-center justify-center border-t border-white/10"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} strokeWidth={3} />
                )}
              </button>
            </div>
          </form>

          {/* Lista de Categorías Activas */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic ml-1">
              Lista Activa ({categorias.length})
            </p>

            {loadingList ? (
              <div className="py-6 flex items-center justify-center text-xs font-mono text-text-muted gap-2">
                <Loader2 className="animate-spin text-primary" size={16} />
                <span>Sincronizando secciones...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="group flex items-center gap-2 bg-gray-50 dark:bg-white/5 pl-4 pr-2 py-2 rounded-full border-2 border-border dark:border-border-dark hover:border-primary/50 transition-all"
                  >
                    <span className="text-[10px] font-black uppercase italic tracking-tight text-text-primary dark:text-text-inverse">
                      {cat.nombre}
                    </span>
                    <button
                      key={`remove-${cat.id}`}
                      type="button"
                      onClick={() => handleRemove(cat.id, cat.nombre)}
                      className="md:opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-error transition-all"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {categorias.length === 0 && (
                  <div className="w-full py-8 text-center border-2 border-dashed border-border dark:border-border-dark rounded-neo opacity-40">
                    <p className="text-[10px] font-bold uppercase italic text-text-muted">
                      Sin categorías definidas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nota Técnica */}
          <div className="pt-4 border-t border-dashed border-border dark:border-border-dark">
            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest leading-tight">
              El sistema genera automáticamente el slug para la URL pública.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
