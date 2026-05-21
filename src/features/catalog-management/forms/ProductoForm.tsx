"use client";

import { useState } from "react";
import {
  upsertProductAction,
  JSONBExtraGroup,
  JSONBExtraItem,
} from "@/features/catalog-management/actions";
import { toast } from "sonner";
import {
  Package,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  ListPlus,
} from "lucide-react";
import { CategorySelect } from "../components/CategorySelect";
import type { UnifiedProduct } from "../components/ProductTable";
import { Switch } from "@/components/ui/switch";

export interface Variant {
  nombre: string;
  precio: number;
}

interface CategoriaOption {
  id: string;
  nombre: string;
}

interface ProductoFormProps {
  negocioId: string;
  categorias: CategoriaOption[];
  initialData?: UnifiedProduct | null;
  onSuccess?: () => void;
}

export function ProductoForm({
  negocioId,
  categorias,
  initialData,
  onSuccess,
}: ProductoFormProps) {
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio || "",
    imagen_url: initialData?.imagen_url || null,
    categoria_id: initialData?.categoria_id || "",
    disponible: initialData?.disponible ?? true,
  });

  const [variantes, setVariantes] = useState<Variant[]>(
    (initialData?.configuracion?.variantes as unknown as Variant[]) || [],
  );
  const [gruposOpciones, setGruposOpciones] = useState<JSONBExtraGroup[]>(
    (initialData?.configuracion
      ?.grupos_opciones as unknown as JSONBExtraGroup[]) || [],
  );

  const agregarVariante = () => {
    setVariantes([...variantes, { nombre: "", precio: 0 }]);
  };

  const eliminarVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  const actualizarVariante = (index: number, fields: Partial<Variant>) => {
    const nuevas = [...variantes];
    nuevas[index] = { ...nuevas[index], ...fields };
    setVariantes(nuevas);
  };

  const agregarGrupoOpcion = () => {
    const nuevoGrupo: JSONBExtraGroup = {
      id: crypto.randomUUID(),
      titulo: "",
      requerido: false,
      multiple: true,
      items: [],
    };
    setGruposOpciones([...gruposOpciones, nuevoGrupo]);
  };

  const eliminarGrupoOpcion = (grupoId: string) => {
    setGruposOpciones(gruposOpciones.filter((g) => g.id !== grupoId));
  };

  const actualizarGrupoOpcion = (grupoId: string, titulo: string) => {
    setGruposOpciones(
      gruposOpciones.map((g) => (g.id === grupoId ? { ...g, titulo } : g)),
    );
  };

  const agregarItemAGrupo = (grupoId: string) => {
    setGruposOpciones(
      gruposOpciones.map((g) => {
        if (g.id !== grupoId) return g;
        const nuevoItem: JSONBExtraItem = {
          id: crypto.randomUUID(),
          nombre: "",
          precio: 0,
        };
        return { ...g, items: [...g.items, nuevoItem] };
      }),
    );
  };

  const eliminarItemDeGrupo = (grupoId: string, itemId: string) => {
    setGruposOpciones(
      gruposOpciones.map((g) => {
        if (g.id !== grupoId) return g;
        return { ...g, items: g.items.filter((i) => i.id !== itemId) };
      }),
    );
  };

  const actualizarItemDeGrupo = (
    grupoId: string,
    itemId: string,
    fields: Partial<JSONBExtraItem>,
  ) => {
    setGruposOpciones(
      gruposOpciones.map((g) => {
        if (g.id !== grupoId) return g;
        return {
          ...g,
          items: g.items.map((i) =>
            i.id === itemId ? { ...i, ...fields } : i,
          ),
        };
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negocioId) return toast.error("Error crítico: Negocio ID ausente.");

    setIsPending(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: Number(formData.precio),
        imagen_url: formData.imagen_url || null,
        categoria_id: formData.categoria_id || null,
        disponible: formData.disponible,
        configuracion: {
          variantes: variantes.map((v) => ({
            nombre: v.nombre.trim(),
            precio: Number(v.precio),
          })),
          grupos_opciones: gruposOpciones.map((g) => ({
            ...g,
            titulo: g.titulo.trim(),
            items: g.items.map((i) => ({
              ...i,
              nombre: i.nombre.trim(),
              precio: Number(i.precio),
            })),
          })),
        },
      };

      await upsertProductAction(payload, initialData?.id);

      toast.success(initialData ? "Producto actualizado" : "Producto creado", {
        icon: <CheckCircle className="text-[var(--admin-accent)]" />,
      });

      if (onSuccess) onSuccess();
    } catch {
      toast.error("Error al guardar el producto", {
        description: "Hubo un problema de conexión.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 rounded-xl font-sans w-full max-w-5xl flex flex-col h-full"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-gray-50/50 dark:bg-zinc-800/40 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm text-gray-500 dark:text-zinc-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 leading-tight">
              {initialData ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mt-1">
              Completa los detalles para tu catálogo.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="md:hidden flex items-center justify-center gap-2 bg-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          <span>Guardar</span>
        </button>
      </div>

      {/* CUERPO INTERNO CON SCROLL */}
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-1 grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Nombre Comercial
              </label>
              <input
                required
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
                placeholder="Ej: Triple Bacon Burger"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Descripción Corta
              </label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-zinc-100 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
                placeholder="Detalla los ingredientes del plato..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Precio Base ($)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData({ ...formData, precio: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 font-medium text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <CategorySelect
                  negocioId={negocioId}
                  selectedId={formData.categoria_id || ""}
                  onChange={(id) =>
                    // CORREGIDO: Se cambió 'category_id' por 'categoria_id' para coincidir con tu useState
                    setFormData({ ...formData, categoria_id: id })
                  }
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 mt-2">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-zinc-100 block">
                  Estado de Venta
                </label>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  ¿Mostrar en el catálogo público?
                </p>
              </div>
              <Switch
                checked={formData.disponible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, disponible: checked })
                }
              />
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-7 space-y-8 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-zinc-800 pt-8 lg:pt-0 lg:pl-8">
            {/* SECCIÓN VARIANTES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                  Tamaños / Variaciones
                </h3>
                <button
                  type="button"
                  onClick={agregarVariante}
                  className="text-xs font-semibold flex items-center gap-1 text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <Plus size={14} /> Añadir
                </button>
              </div>

              <div className="space-y-3">
                {variantes.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center bg-white dark:bg-zinc-900 p-2 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm"
                  >
                    <input
                      type="text"
                      required
                      value={v.nombre}
                      onChange={(e) =>
                        actualizarVariante(idx, { nombre: e.target.value })
                      }
                      placeholder="Ej: Grande"
                      className="flex-1 p-2 bg-gray-50 dark:bg-zinc-800/50 border-transparent rounded-md text-sm font-medium text-gray-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] outline-none transition-all"
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        required
                        value={v.precio}
                        onChange={(e) =>
                          actualizarVariante(idx, {
                            precio:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                        placeholder="0.00"
                        className="w-24 p-2 pl-6 bg-gray-50 dark:bg-zinc-800/50 border-transparent rounded-md text-sm font-medium text-gray-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarVariante(idx)}
                      className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {variantes.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
                    Sin variantes (usa el precio base).
                  </p>
                )}
              </div>
            </div>

            {/* SECCIÓN MODIFICADORES COMPLEJOS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                  Grupos de Extras / Salsas
                </h3>
                <button
                  type="button"
                  onClick={agregarGrupoOpcion}
                  className="text-xs font-semibold flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <ListPlus size={14} /> Crear Grupo
                </button>
              </div>

              <div className="space-y-5">
                {gruposOpciones.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="border border-gray-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <input
                        type="text"
                        required
                        value={grupo.titulo}
                        onChange={(e) =>
                          actualizarGrupoOpcion(grupo.id, e.target.value)
                        }
                        placeholder="Nombre (Ej: Elige tus salsas)"
                        className="flex-1 p-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => agregarItemAGrupo(grupo.id)}
                          className="px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md text-gray-700 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        >
                          + Ítem
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarGrupoOpcion(grupo.id)}
                          className="px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md text-red-500 hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          Eliminar Grupo
                        </button>
                      </div>
                    </div>

                    {/* Sub-items del Grupo */}
                    <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-gray-200 dark:border-zinc-700">
                      {grupo.items?.map((item) => (
                        <div key={item.id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            required
                            value={item.nombre}
                            onChange={(e) =>
                              actualizarItemDeGrupo(grupo.id, item.id, {
                                nombre: e.target.value,
                              })
                            }
                            placeholder="Ingrediente extra"
                            className="flex-1 p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-sm">
                              +$
                            </span>
                            <input
                              type="number"
                              required
                              value={item.precio}
                              onChange={(e) =>
                                actualizarItemDeGrupo(grupo.id, item.id, {
                                  precio:
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value),
                                })
                              }
                              placeholder="0.00"
                              className="w-20 p-2 pl-7 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              eliminarItemDeGrupo(grupo.id, item.id)
                            }
                            className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {grupo.items.length === 0 && (
                        <p className="text-xs text-gray-400 dark:text-zinc-500 italic mt-2">
                          Añade opciones a este grupo.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {gruposOpciones.length === 0 && (
                  <div className="border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center text-center text-gray-500 dark:text-zinc-400">
                    <ListPlus className="mb-2 opacity-50" size={24} />
                    <span className="text-sm font-medium">
                      Sin grupos adicionales
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACCIONES */}
      <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 mt-auto">
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
          Los cambios impactarán en el catálogo público al instante.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-[var(--admin-text)] hover:bg-gray-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg font-semibold text-sm px-8 py-3 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save size={16} /> Guardar Producto
            </>
          )}
        </button>
      </div>
    </form>
  );
}
