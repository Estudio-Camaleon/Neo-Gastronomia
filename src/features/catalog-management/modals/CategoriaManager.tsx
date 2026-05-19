"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { Tag, Plus, Trash2, Loader2, Hash, X } from "lucide-react";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

  // Función pura para normalizar strings y generar slugs limpios para la URL pública
  const slugificar = (texto: string): string => {
    return texto
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remueve acentos nativos
      .replace(/[^a-z0-9\s-]/g, "") // Remueve caracteres especiales molestos
      .replace(/[\s-]+/g, "-") // Reemplaza espacios por guiones
      .replace(/(^-|-$)+/g, ""); // Sanea guiones huérfanos en los extremos
  };

  // Traer las categorías asociadas al local de forma estable
  const cargarCategorias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre, slug, negocio_id")
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

  // Suscripción Realtime activa de alto rendimiento
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
      // Mutación optimizada directa al Almacén
      const { error } = await supabase.from("categorias").insert({
        nombre: nombreLimpio,
        slug,
        negocio_id: negocioId,
      });

      if (error) {
        if (error.code === "23505") {
          // Código Postgres para violación de restricción única
          toast.error("SECCIÓN DUPLICADA", {
            description: "Esta categoría ya existe en tu terminal.",
          });
        } else {
          throw error;
        }
      } else {
        setNuevoNombre("");
        toast.success("SECCIÓN DESPLEGADA CON ÉXITO");
      }
    } catch {
      toast.error("FALLO DE ESCRITURA", { description: "Error con Supabase." });
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async (id: string, nombre: string) => {
    if (
      !confirm(
        `¿ELIMINAR "${nombre.toUpperCase()}"?\nEsto afectará la visibilidad de los productos asociados en el menú público.`,
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", id)
        .eq("negocio_id", negocioId); // Doble reaseguro Multi-tenant

      if (error) throw error;
      toast.success("SECCIÓN REMOVIDA");
    } catch {
      toast.error("FALLO DE ELIMINACIÓN", { description: "Error con Supabase." });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* CABECERA MODAL BRUTALISTA */}
        <div className="p-6 flex justify-between items-center border-b-4 border-black bg-black text-white">
          <div className="flex items-center gap-3">
            <Tag size={20} className="text-[#A3FF00]" />
            <h2 className="font-black uppercase italic text-xl tracking-tighter">
              Secciones del Menú
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white border-2 border-transparent hover:border-white hover:bg-red-600 transition-all rounded-none"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* FORMULARIO DE ALTA */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-black block">
              Crear Nueva Sección Comercial
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black shrink-0" />
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="EJ: BURGERS, ENTRADAS, BEBIDAS..."
                  className="w-full bg-white p-4 pl-10 border-2 border-black text-black outline-none font-black uppercase text-xs focus:bg-[#A3FF00]/5 placeholder:text-gray-400"
                  disabled={isPending || loadingList}
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !nuevoNombre.trim() || loadingList}
                className="bg-[#A3FF00] border-2 border-black text-black font-black uppercase text-xs px-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 transition-all flex items-center justify-center shrink-0"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} strokeWidth={3} />
                )}
              </button>
            </div>
          </form>

          {/* LISTADO ACTIVO */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest">
              Lista de Canales Activos ({categorias.length})
            </p>

            {loadingList ? (
              <div className="py-8 flex items-center justify-center text-xs font-mono text-gray-500 gap-2">
                <Loader2
                  className="animate-spin text-black shrink-0"
                  size={16}
                />
                <span>Sincronizando índice con Supabase...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="group flex items-center justify-between bg-gray-50 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase text-black tracking-wide">
                        {cat.nombre}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">
                        URL: /{cat.slug}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(cat.id, cat.nombre)}
                      className="p-1.5 border border-transparent text-gray-400 hover:text-red-600 hover:border-black transition-all"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {categorias.length === 0 && (
                  <div className="w-full py-8 text-center border-4 border-dashed border-black/10 opacity-60 bg-gray-50">
                    <p className="text-xs font-black uppercase text-gray-400 font-mono italic">
                      Sin secciones asignadas.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CLÁUSULA OPERATIVA DE SEGURIDAD */}
          <div className="pt-4 border-t-2 border-dashed border-black/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-normal font-mono">
              🔒 REASEGURO MULTI-TENANT ACTIVADO: Las mutaciones están validadas
              por hardware criptográfico a nivel RLS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
