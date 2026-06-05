"use client";

import { useState, useEffect, useRef } from "react";
import { upsertProductAction } from "@/features/admin/catalog/actions";
import type { ExtraGroup, ExtraItem } from "@/core/types/domain";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import {
  Package,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  ListPlus,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
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
  onUnsavedChange?: (hasChanges: boolean) => void;
}

export function ProductoForm({
  negocioId,
  categorias,
  initialData,
  onSuccess,
  onUnsavedChange,
}: ProductoFormProps) {
  const [isPending, setIsPending] = useState(false);
  const submitLabel = initialData ? "Guardar Cambios" : "Cargar Producto";

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio ?? "",
    imagen_url: initialData?.imagen_url || null,
    categoria_id: initialData?.categoria_id || "",
    disponible: initialData?.disponible ?? true,
  });

  const [variantes, setVariantes] = useState<Variant[]>(() => {
    if (!initialData?.configuracion?.variantes) return [];
    return initialData.configuracion.variantes.map((v) => ({
      nombre: v.nombre,
      precio: Number(v.precio),
    }));
  });
  const [gruposOpciones, setGruposOpciones] = useState<ExtraGroup[]>(() => {
    if (!initialData?.configuracion?.grupos_opciones) return [];
    return initialData.configuracion.grupos_opciones.map((g: Record<string, unknown>) => ({
      id: String(g["id"] || ""),
      titulo: String(g["titulo"] || ""),
      requerido: Boolean(g["requerido"]),
      multiple: Boolean(g["multiple"]),
      items: (Array.isArray(g["items"]) ? g["items"] : []).map((i: Record<string, unknown>) => ({
        id: String(i["id"] || ""),
        nombre: String(i["nombre"] || ""),
        precio: Number(i["precio"]) || 0,
      })),
    }));
  });

  useEffect(() => {
    if (!onUnsavedChange) return;
    const hasChanges =
      formData.nombre !== (initialData?.nombre || "") ||
      formData.descripcion !== (initialData?.descripcion || "") ||
      formData.precio !== (initialData?.precio || "") ||
      formData.imagen_url !== (initialData?.imagen_url || null) ||
      formData.categoria_id !== (initialData?.categoria_id || "") ||
      formData.disponible !== (initialData?.disponible ?? true) ||
      JSON.stringify(variantes) !==
        JSON.stringify(initialData?.configuracion?.variantes || []) ||
      JSON.stringify(gruposOpciones) !==
        JSON.stringify(initialData?.configuracion?.grupos_opciones || []);
    onUnsavedChange(hasChanges);
  }, [formData, variantes, gruposOpciones, initialData, onUnsavedChange]);

  const variantIds = useRef<string[]>([]);
  const syncVariantIds = (len: number) => {
    while (variantIds.current.length < len) {
      variantIds.current.push(crypto.randomUUID());
    }
    if (variantIds.current.length > len) {
      variantIds.current = variantIds.current.slice(0, len);
    }
  };

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
    const nuevoGrupo: ExtraGroup = {
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
        const nuevoItem: ExtraItem = {
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
    fields: Partial<ExtraItem>,
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

  syncVariantIds(variantes.length);

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
      className="flex h-full min-h-0 w-full max-w-5xl flex-col rounded-xl bg-[var(--admin-surface)] font-sans"
    >
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-6 pr-14 shrink-0 md:flex-row md:items-center md:justify-between rounded-t-xl">
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

        <div className="md:ml-auto text-xs font-medium text-[var(--admin-text-muted)]">
          El formulario se guarda desde el botón inferior.
        </div>
      </div>

      {/* CUERPO INTERNO CON SCROLL */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-5 lg:col-span-5 lg:min-h-0">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--admin-text)] block">
                Nombre Comercial
              </label>
              <input
                required
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
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
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] resize-none h-24 focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                placeholder="Detalla los ingredientes del plato..."
              />
            </div>

            <div className="space-y-1.5">
              <ImageUpload
                value={formData.imagen_url ?? ""}
                onChange={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    imagen_url: url === "" ? null : url,
                  }))
                }
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
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, precio: e.target.value }))
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
                    setFormData((prev) => ({ ...prev, categoria_id: id }))
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
                  setFormData((prev) => ({ ...prev, disponible: checked }))
                }
              />
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-8 border-t border-[var(--admin-border)] pt-8 lg:col-span-7 lg:min-h-0 lg:border-l lg:border-t-0 lg:pl-8">
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
                    key={variantIds.current[idx]}
                    className="flex flex-wrap gap-2 items-center bg-[var(--admin-surface)] p-2 border border-[var(--admin-border)] rounded-lg shadow-sm"
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
                      className="p-2 text-[var(--admin-text-muted)] hover-admin-danger rounded-md transition-colors"
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
                          className="px-3 py-2 text-xs font-semibold bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md admin-danger-text hover-admin-danger transition-colors"
                        >
                          Eliminar Grupo
                        </button>
                      </div>
                    </div>

                    {/* Sub-items del Grupo */}
                    <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-[var(--admin-border)]">
                      {grupo.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap gap-2 items-center"
                        >
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
                            className="p-2 text-[var(--admin-text-muted)] hover-admin-danger rounded-md transition-colors"
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
      <div className="sticky bottom-0 z-10 mt-auto flex flex-col items-center justify-between gap-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-12px_30px_rgba(0,0,0,0.4)] rounded-b-xl sm:flex-row">
        <p className="text-xs font-medium text-[var(--admin-text-muted)]">
          Los cambios impactarán en el catálogo público al instante.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isPending ? (
            <>
                      <FoodMini size={14} /> {submitLabel}...
            </>
          ) : (
            <>
              <Save size={16} /> {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
