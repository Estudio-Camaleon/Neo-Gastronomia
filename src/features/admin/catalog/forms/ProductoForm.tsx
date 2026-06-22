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
  X,
  Trash2,
  CheckCircle,
  ListPlus,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { CategorySelect } from "../components/CategorySelect";
import type { UnifiedProduct } from "../components/ProductTable";
import { Switch } from "@/components/ui/switch";
import { FoodIconPicker } from "@/components/ui/food-icon-picker";

export interface Variant {
  nombre: string;
  precio: number;
}

interface ProductoFormProps {
  negocioId: string;
  initialData?: UnifiedProduct | null;
  onSuccess?: () => void;
  onUnsavedChange?: (hasChanges: boolean) => void;
  submitRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function ProductoForm({
  negocioId,
  initialData,
  onSuccess,
  onUnsavedChange,
  submitRef,
}: ProductoFormProps) {
  const [isPending, setIsPending] = useState(false);
  const submitLabel = initialData ? "Guardar Cambios" : "Cargar Producto";
  const savedOnceRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio ?? "",
    imagenes: (() => {
      const imgs: string[] = [];
      if (initialData?.imagen_url) imgs.push(initialData.imagen_url);
      const extras = initialData?.configuracion?.imagenes_extra ?? [];
      for (const url of extras) {
        if (url) imgs.push(url);
      }
      return imgs.length > 0 ? imgs : [""];
    })(),
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
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCreatingCategory(true);
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñ]+/g, "-")
        .replace(/á/g, "a")
        .replace(/é/g, "e")
        .replace(/í/g, "i")
        .replace(/ó/g, "o")
        .replace(/ú/g, "u")
        .replace(/ñ/g, "n")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
      const { createCategoryAction } = await import(
        "@/features/admin/catalog/actions"
      );
      await createCategoryAction(name, slug);
      setShowNewCategory(false);
      setNewCategoryName("");
      setCategoryRefreshKey((k) => k + 1);
      toast.success(`Categoría "${name}" creada`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al crear categoría";
      toast.error("Error", { description: msg });
    } finally {
      setCreatingCategory(false);
    }
  };

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragGroupItem, setDragGroupItem] = useState<{
    grupoId: string;
    itemIndex: number;
  } | null>(null);
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);

  const moveVariant = (from: number, to: number) => {
    const nuevas = [...variantes];
    const [movido] = nuevas.splice(from, 1);
    nuevas.splice(to, 0, movido);
    setVariantes(nuevas);
  };

  const moveGroupItem = (grupoId: string, from: number, to: number) => {
    setGruposOpciones(
      gruposOpciones.map((g) => {
        if (g.id !== grupoId) return g;
        const nuevosItems = [...g.items];
        const [movido] = nuevosItems.splice(from, 1);
        nuevosItems.splice(to, 0, movido);
        return { ...g, items: nuevosItems };
      }),
    );
  };

  const moveImage = (from: number, to: number) => {
    const nuevas = [...formData.imagenes];
    const [movido] = nuevas.splice(from, 1);
    nuevas.splice(to, 0, movido);
    setFormData((prev) => ({ ...prev, imagenes: nuevas }));
  };

  const addImageSlot = () => {
    if (formData.imagenes.length >= 3) return;
    setFormData((prev) => ({ ...prev, imagenes: [...prev.imagenes, ""] }));
  };

  const removeImageSlot = (idx: number) => {
    if (formData.imagenes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== idx),
    }));
  };

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
          icono: String(i["icono"] || ""),
          max: i["max"] != null ? Number(i["max"]) : undefined,
        })),
    }));
  });

  useEffect(() => {
    if (!submitRef) return;
    submitRef.current = async () => {
      formRef.current?.requestSubmit();
    };
    return () => { submitRef.current = null; };
  }, [submitRef]);

  const [touched, setTouched] = useState<Record<string, true>>({});

  const touch = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));

  const allErrors = (() => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e["nombre"] = "El nombre es obligatorio";
    if (!formData.categoria_id) e["categoria_id"] = "Seleccioná una categoría";
    if (Number(formData.precio) < 0) e["precio"] = "No puede ser negativo";
    if (formData.precio === "" && variantes.length === 0)
      e["precio"] = "Ingresá un precio";
    variantes.forEach((v, i) => {
      if (!v.nombre.trim()) e[`v_n_${i}`] = "Obligatorio";
      if (v.precio < 0) e[`v_p_${i}`] = "Inválido";
    });
    gruposOpciones.forEach((g) => {
      if (!g.titulo.trim()) e[`g_t_${g.id}`] = "Obligatorio";
      g.items.forEach((item) => {
        if (!item.nombre.trim())
          e[`g_i_n_${g.id}_${item.id}`] = "Obligatorio";
      });
    });
    return e;
  })();

  const err = (key: string): string | undefined =>
    touched[key] ? allErrors[key] : undefined;

  const errBorder = "border-red-400 focus:border-red-500 focus:ring-red-500";

  useEffect(() => {
    if (!onUnsavedChange) return;
    if (savedOnceRef.current) {
      onUnsavedChange(false);
      return;
    }
    const getInitialImages = (): string[] => {
      const imgs: string[] = [];
      if (initialData?.imagen_url) imgs.push(initialData.imagen_url);
      const extras = initialData?.configuracion?.imagenes_extra ?? [];
      for (const url of extras) {
        if (url) imgs.push(url);
      }
      return imgs.length > 0 ? imgs : [""];
    };
    const hasChanges =
      formData.nombre !== (initialData?.nombre || "") ||
      formData.descripcion !== (initialData?.descripcion || "") ||
      formData.precio !== (initialData?.precio ?? "") ||
      JSON.stringify(formData.imagenes) !== JSON.stringify(getInitialImages()) ||
      formData.categoria_id !== (initialData?.categoria_id || "") ||
      formData.disponible !== (initialData?.disponible ?? true) ||
      JSON.stringify(variantes) !==
        JSON.stringify(initialData?.configuracion?.variantes || []) ||
      JSON.stringify(gruposOpciones) !==
        JSON.stringify(initialData?.configuracion?.grupos_opciones || []);
    onUnsavedChange(hasChanges);
  }, [formData, variantes, gruposOpciones, initialData, onUnsavedChange]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negocioId) return toast.error("Error crítico: Negocio ID ausente.");

    // Touch all fields
    const allKeys = [
      "nombre",
      "precio",
      "categoria_id",
      ...variantes.flatMap((_, i) => [`v_n_${i}`, `v_p_${i}`]),
      ...gruposOpciones.flatMap((g) => [
        `g_t_${g.id}`,
        ...g.items.map((item) => `g_i_n_${g.id}_${item.id}`),
      ]),
    ];
    setTouched(Object.fromEntries(allKeys.map((k) => [k, true as const])));

    if (Object.keys(allErrors).length > 0) {
      toast.error("Corregí los campos marcados antes de guardar");
      setIsPending(false);
      return;
    }

    setIsPending(true);

    try {
      const precio = Number(formData.precio) || 0;

      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio,
        imagen_url: formData.imagenes[0] || null,
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
          imagenes_extra: formData.imagenes.slice(1).filter(Boolean) as string[],
        },
      };

      await upsertProductAction(payload, initialData?.id);

      toast.success(initialData ? "Producto actualizado" : "Producto creado", {
        icon: <CheckCircle className="text-[var(--admin-accent)]" />,
      });

      savedOnceRef.current = true;
      onUnsavedChange?.(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Hubo un problema de conexión.";
      toast.error("Error al guardar el producto", { description: msg });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex h-full min-h-0 w-full max-w-7xl flex-col rounded-xl bg-[var(--admin-surface)] font-sans"
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
            <div className="hidden lg:block rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/30 overflow-hidden">
              <div className="flex items-stretch gap-0">
                <div className="w-24 shrink-0 bg-[var(--admin-bg)] overflow-hidden relative">
                  {formData.imagenes[0] ? (
                    <img
                      src={formData.imagenes[0]}
                      alt={formData.nombre || "Vista previa"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[88px] items-center justify-center text-[var(--admin-text-muted)]/30">
                      <Package size={28} />
                    </div>
                  )}
                  {formData.imagenes.length > 1 && (
                    <div className="absolute bottom-0.5 right-0.5 rounded-full bg-black/60 px-1.5 py-[1px] text-[8px] font-bold text-white">
                      +{formData.imagenes.length}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 px-3 py-2.5 space-y-1">
                  <p className="text-sm font-bold text-[var(--admin-text)] truncate leading-tight">
                    {formData.nombre || "Sin nombre"}
                  </p>
                  <p className="text-[11px] text-[var(--admin-text-muted)] truncate">
                    {formData.descripcion || "Sin descripción"}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base font-black text-[var(--admin-accent)] leading-none">
                      ${(formData.precio || 0).toLocaleString("es-AR")}
                    </span>
                    <span
                      className={`ml-auto inline-block rounded-full px-2 py-[1px] text-[9px] font-bold uppercase tracking-wide ${
                        formData.disponible
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {formData.disponible ? "Disponible" : "Oculto"}
                    </span>
                  </div>
                  {variantes.length > 0 && (
                    <p className="text-[10px] text-[var(--admin-text-muted)]">
                      {variantes.length} variante{variantes.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--admin-text)]">
                  Categoría
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory((prev) => !prev);
                    setNewCategoryName("");
                  }}
                  className="inline-flex items-center justify-center size-7 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)]/30 hover:bg-[var(--admin-accent)]/10 transition-all"
                  title={showNewCategory ? "Cancelar" : "Crear nueva categoría"}
                >
                  {showNewCategory ? <X size={14} /> : <Plus size={14} />}
                </button>
              </div>
              {showNewCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nombre de la nueva sección"
                    className="flex-1 p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                      if (e.key === "Escape") {
                        setShowNewCategory(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    className="shrink-0 px-4 py-2.5 text-xs font-semibold bg-[var(--admin-accent)] text-white rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {creatingCategory ? "..." : "Crear"}
                  </button>
                </div>
              ) : (
                <CategorySelect
                  key={categoryRefreshKey}
                  negocioId={negocioId}
                  selectedId={formData.categoria_id || ""}
                  hideLabel
                  onChange={(id) => {
                    setFormData((prev) => ({ ...prev, categoria_id: id }));
                    touch("categoria_id");
                  }}
                  onBlur={() => touch("categoria_id")}
                />
              )}
              {err("categoria_id") && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{err("categoria_id")}</p>
              )}
            </div>

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
                onBlur={() => touch("nombre")}
                className={`w-full p-2.5 bg-[var(--admin-bg)] border rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 transition-all ${
                  err("nombre")
                    ? errBorder
                    : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                }`}
                placeholder="Ej: Triple Bacon Burger"
              />
              {err("nombre") && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{err("nombre")}</p>
              )}
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
                maxLength={300}
                className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] resize-none h-24 focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                placeholder="Detalla los ingredientes del plato..."
              />
              <div className="flex justify-end">
                <span
                  className={`text-[10px] tabular-nums font-medium transition-colors ${
                    (formData.descripcion || "").length >= 280
                      ? "text-amber-500 opacity-100"
                      : "text-[var(--admin-text-muted)] opacity-60"
                  }`}
                >
                  {(formData.descripcion || "").length}/300
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--admin-text)] block">
                Imágenes del Producto
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formData.imagenes.map((url, idx) => (
                  <div
                    key={`img-${idx}`}
                    draggable
                    onDragStart={() => setDragImageIndex(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (
                        dragImageIndex !== null &&
                        dragImageIndex !== idx
                      ) {
                        moveImage(dragImageIndex, idx);
                        setDragImageIndex(idx);
                      }
                    }}
                    onDragEnd={() => setDragImageIndex(null)}
                    className={`relative flex flex-col gap-1.5 rounded-xl border bg-[var(--admin-bg)]/30 p-2 transition-all ${
                      dragImageIndex === idx
                        ? "border-[var(--admin-accent)] opacity-60"
                        : "border-[var(--admin-border)]"
                    }`}
                  >
                    <div className="flex items-center gap-1 px-1">
                      <span
                        className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
                        title="Arrastrar para reordenar"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
                        </svg>
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider ml-1">
                          ★ Principal
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        {formData.imagenes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageSlot(idx)}
                            className="p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)] rounded-md transition-colors"
                            title="Eliminar imagen"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <ImageUpload
                      compact
                      value={url}
                      onChange={(newUrl) =>
                        setFormData((prev) => {
                          const next = [...prev.imagenes];
                          next[idx] = newUrl === "" ? "" : newUrl;
                          return { ...prev, imagenes: next };
                        })
                      }
                      alt={`Imagen ${idx + 1}`}
                    />
                  </div>
                ))}
                {formData.imagenes.length < 3 && (
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--admin-border)] min-h-[130px] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/5 transition-all cursor-pointer"
                  >
                    <Plus size={24} />
                    <span className="text-xs font-medium mt-1">
                      Agregar imagen
                    </span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--admin-text-muted)] opacity-70 leading-relaxed">
                Arrastrá para reordenar. La primera imagen es la principal. Máximo 3 imágenes (5MB c/u, JPG/PNG/WEBP).
              </p>
            </div>

          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-8 border-t border-[var(--admin-border)] pt-8 lg:col-span-7 lg:min-h-0 lg:border-l lg:border-t-0 lg:pl-8">
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
                  disabled={variantes.length > 0}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    setFormData((prev) => ({ ...prev, precio: isNaN(val) ? "" : val }));
                  }}
                  onBlur={() => touch("precio")}
                  className={`w-full p-2.5 bg-[var(--admin-bg)] border font-medium text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 transition-all rounded-lg disabled:opacity-40 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                    err("precio")
                      ? errBorder
                      : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                  }`}
                  placeholder="0.00"
                />
                {err("precio") && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{err("precio")}</p>
                )}
                {variantes.length > 0 && !err("precio") && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    Usá las variantes para definir precios.
                  </p>
                )}
              </div>

            </div>

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
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null && dragIndex !== idx) {
                        moveVariant(dragIndex, idx);
                        setDragIndex(idx);
                      }
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`flex flex-wrap gap-2 items-center bg-[var(--admin-surface)] p-2 border rounded-lg shadow-sm transition-all ${
                      dragIndex === idx
                        ? "border-[var(--admin-accent)] opacity-60"
                        : "border-[var(--admin-border)]"
                    }`}
                  >
                    <span
                      className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors p-1"
                      title="Arrastrar para reordenar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={v.nombre}
                      onChange={(e) =>
                        actualizarVariante(idx, { nombre: e.target.value })
                      }
                      onBlur={() => touch(`v_n_${idx}`)}
                      placeholder="Ej: Grande"
                      className={`flex-1 min-w-[100px] p-2 bg-[var(--admin-bg)] rounded-md text-sm font-medium text-[var(--admin-text)] focus:ring-1 outline-none transition-all ${
                        err(`v_n_${idx}`)
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-transparent focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                      }`}
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        required
                        value={v.precio || ""}
                        onChange={(e) => {
                          const val = e.target.valueAsNumber;
                          actualizarVariante(idx, {
                            precio: isNaN(val) ? 0 : val,
                          });
                        }}
                        onBlur={() => touch(`v_p_${idx}`)}
                        placeholder="0"
                        className={`w-24 p-2 pl-6 bg-[var(--admin-bg)] rounded-md text-sm font-medium text-[var(--admin-text)] focus:ring-1 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                          err(`v_p_${idx}`)
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-transparent focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                        }`}
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
                        onBlur={() => touch(`g_t_${grupo.id}`)}
                        placeholder="Nombre (Ej: Elige tus salsas)"
                        className={`flex-1 p-2 bg-[var(--admin-surface)] border rounded-md text-sm font-semibold text-[var(--admin-text)] focus:outline-none focus:ring-1 transition-all ${
                          err(`g_t_${grupo.id}`)
                            ? errBorder
                            : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                        }`}
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

                    {/* Config switches: requerido / multiple */}
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={grupo.requerido}
                          onCheckedChange={(checked) => {
                            setGruposOpciones(
                              gruposOpciones.map((g) =>
                                g.id === grupo.id ? { ...g, requerido: checked } : g,
                              ),
                            );
                          }}
                          className="data-[state=checked]:bg-[var(--admin-accent)]"
                        />
                        <span className="text-xs font-medium text-[var(--admin-text)]">
                          Requerido
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={grupo.multiple}
                          onCheckedChange={(checked) => {
                            setGruposOpciones(
                              gruposOpciones.map((g) =>
                                g.id === grupo.id ? { ...g, multiple: checked } : g,
                              ),
                            );
                          }}
                          className="data-[state=checked]:bg-[var(--admin-accent)]"
                        />
                        <span className="text-xs font-medium text-[var(--admin-text)]">
                          Selección múltiple
                        </span>
                      </label>
                    </div>

                    {/* Sub-items del Grupo */}
                    <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-[var(--admin-border)]">
                      {grupo.items?.map((item, itemIdx) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() =>
                            setDragGroupItem({ grupoId: grupo.id, itemIndex: itemIdx })
                          }
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (
                              dragGroupItem &&
                              dragGroupItem.grupoId === grupo.id &&
                              dragGroupItem.itemIndex !== itemIdx
                            ) {
                              moveGroupItem(grupo.id, dragGroupItem.itemIndex, itemIdx);
                              setDragGroupItem({ grupoId: grupo.id, itemIndex: itemIdx });
                            }
                          }}
                          onDragEnd={() => setDragGroupItem(null)}
                          className={`flex flex-wrap gap-2 items-center rounded-md transition-all ${
                            dragGroupItem?.grupoId === grupo.id &&
                            dragGroupItem?.itemIndex === itemIdx
                              ? "opacity-60"
                              : ""
                          }`}
                        >
                          <span
                            className="cursor-grab active:cursor-grabbing text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors p-1 shrink-0"
                            title="Arrastrar para reordenar"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
                            </svg>
                          </span>
                          <FoodIconPicker
                            value={item.icono || ""}
                            onChange={(icono) =>
                              actualizarItemDeGrupo(grupo.id, item.id, { icono })
                            }
                          />
                          <input
                            type="text"
                            required
                            value={item.nombre}
                            onChange={(e) =>
                              actualizarItemDeGrupo(grupo.id, item.id, {
                                nombre: e.target.value,
                              })
                            }
                            onBlur={() => touch(`g_i_n_${grupo.id}_${item.id}`)}
                            placeholder="Ingrediente extra"
                            className={`flex-1 min-w-[80px] p-2 bg-[var(--admin-surface)] border rounded-md text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 transition-all ${
                              err(`g_i_n_${grupo.id}_${item.id}`)
                                ? errBorder
                                : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                            }`}
                          />
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] text-sm">
                              +$
                            </span>
                            <input
                              type="number"
                              required
                              value={item.precio || ""}
                              onChange={(e) => {
                                const val = e.target.valueAsNumber;
                                actualizarItemDeGrupo(grupo.id, item.id, {
                                  precio: isNaN(val) ? 0 : val,
                                });
                              }}
                              placeholder="0"
                              className="w-20 p-2 pl-7 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                          <input
                            type="number"
                            min={1}
                            value={item.max ?? ""}
                            onChange={(e) => {
                              const val = e.target.valueAsNumber;
                              actualizarItemDeGrupo(grupo.id, item.id, {
                                max: e.target.value === "" ? undefined : (isNaN(val) ? undefined : val),
                              });
                            }}
                            placeholder="∞"
                            title="Cantidad máxima por cliente"
                            className="w-14 p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-sm text-[var(--admin-text-muted)] text-center focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
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
