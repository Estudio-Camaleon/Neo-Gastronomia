"use client";

import { useState } from "react";
import {
  upsertProductAction,
  JSONBExtraGroup,
  JSONBExtraItem,
} from "@/features/admin/catalog/actions";
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
      className="bg-[var(--admin-surface)] rounded-xl font-sans w-full max-w-5xl flex flex-col h-full"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[var(--admin-border)] shrink-0 bg-[var(--admin-bg)]/50 rounded-t-xl pr-14">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg shadow-sm text-[var(--admin-text-muted)]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--admin-text)] leading-tight">
              {initialData ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-xs font-medium text-[var(--admin-text-muted)] mt-1">
              Completa los detalles para tu catálogo.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="md:hidden flex items-center justify-center gap-2 bg-[var(--admin-accent)] hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--admin-text)] block">
                Nombre Comercial
              </label>
              <input
                required
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                placeholder="Ej: Triple Bacon Burger"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--admin-text)] block">
                Descripción Corta
              </label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] resize-none h-24 focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                placeholder="Detalla los ingredientes del plato..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--admin-text)] block">
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
                  className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] font-medium text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all rounded-lg"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <CategorySelect
                  negocioId={negocioId}
                  selectedId={formData.categoria_id || ""}
                  onChange={(id) =>
                    setFormData({ ...formData, categoria_id: id })
                  }
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-4 bg-[var(--admin-bg)]/50 border border-[var(--admin-border)] rounded-xl p-4 mt-2">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-[var(--admin-text)] block">
                  Estado de Venta
                </label>
                <p className="text-xs text-[var(--admin-text-muted)]">
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
          <div className="lg:col-span-7 space-y-8 border-t lg:border-t-0 lg:border-l border-[var(--admin-border)] pt-8 lg:pt-0 lg:pl-8">
            {/* SECCIÓN VARIANTES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--admin-border)]">
                <h3 className="text-sm font-bold text-[var(--admin-text)]">
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
                    className="flex gap-2 items-center bg-[var(--admin-surface)] p-2 border border-[var(--admin-border)] rounded-lg shadow-sm"
                  >
                    <input
                      type="text"
                      required
                      value={v.nombre}
                      onChange={(e) =>
                        actualizarVariante(idx, { nombre: e.target.value })
                      }
                      placeholder="Ej: Grande"
                      className="flex-1 p-2 bg-[var(--admin-bg)] border-transparent rounded-md text-sm font-medium text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] outline-none transition-all"
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] text-sm">
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
                        className="w-24 p-2 pl-6 bg-[var(--admin-bg)] border-transparent rounded-md text-sm font-medium text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarVariante(idx)}
                      className="p-2 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {variantes.length === 0 && (
                  <p className="text-xs text-[var(--admin-text-muted)] italic">
                    Sin variantes (usa el precio base).
                  </p>
                )}
              </div>
            </div>

            {/* SECCIÓN MODIFICADORES COMPLEJOS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--admin-border)]">
                <h3 className="text-sm font-bold text-[var(--admin-text)]">
                  Grupos de Extras / Salsas
                </h3>
                <button
                  type="button"
                  onClick={agregarGrupoOpcion}
                  className="text-xs font-semibold flex items-center gap-1.5 text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <ListPlus size={14} /> Crear Grupo
                </button>
              </div>

              <div className="space-y-5">
                {gruposOpciones.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="border border-[var(--admin-border)] bg-[var(--admin-bg)]/30 rounded-xl p-4 space-y-4"
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
                        className="flex-1 p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-sm font-semibold text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                      />
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => agregarItemAGrupo(grupo.id)}
                          className="px-3 py-2 text-xs font-semibold bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)]/50 hover:bg-[var(--admin-accent)]/10 transition-colors"
                        >
                          + Ítem
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarGrupoOpcion(grupo.id)}
                          className="px-3 py-2 text-xs font-semibold bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                        >
                          Eliminar Grupo
                        </button>
                      </div>
                    </div>

                    {/* Sub-items del Grupo */}
                    <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-[var(--admin-border)]">
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
                            className="flex-1 p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                          />
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] text-sm">
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
                              className="w-20 p-2 pl-7 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              eliminarItemDeGrupo(grupo.id, item.id)
                            }
                            className="p-2 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {grupo.items.length === 0 && (
                        <p className="text-xs text-[var(--admin-text-muted)] italic mt-2">
                          Añade opciones a este grupo.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {gruposOpciones.length === 0 && (
                  <div className="border border-dashed border-[var(--admin-border)] rounded-xl p-6 flex flex-col items-center justify-center text-center text-[var(--admin-text-muted)]">
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
      <div className="p-6 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 mt-auto">
        <p className="text-xs font-medium text-[var(--admin-text-muted)]">
          Los cambios impactarán en el catálogo público al instante.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-[var(--admin-accent)] hover:opacity-90 text-white rounded-lg font-semibold text-sm px-8 py-3 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
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
