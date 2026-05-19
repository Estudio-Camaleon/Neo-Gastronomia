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
import { Button } from "@/components/ui/button";
import { CategorySelect } from "../components/CategorySelect";
// Importamos el contrato rey del catálogo para consistencia total
import type { UnifiedProduct } from "../components/ProductTable";

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
  initialData?: UnifiedProduct | null; // Sincronizado aguas arriba con el Modal y la Tabla
  onSuccess?: () => void;
}

export function ProductoForm({
  negocioId,
  categorias,
  initialData,
  onSuccess,
}: ProductoFormProps) {
  const [isPending, setIsPending] = useState(false);

  // Estado maestro unificado de campos base
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio || "",
    imagen_url: initialData?.imagen_url || null,
    categoria_id: initialData?.categoria_id || "",
    disponible: initialData?.disponible ?? true,
  });

  // Mapeo seguro de estructuras JSONB a tipos interactivos de TypeScript
  const [variantes, setVariantes] = useState<Variant[]>(
    (initialData?.configuracion?.variantes as unknown as Variant[]) || [],
  );
  const [gruposOpciones, setGruposOpciones] = useState<JSONBExtraGroup[]>(
    (initialData?.configuracion
      ?.grupos_opciones as unknown as JSONBExtraGroup[]) || [],
  );

  // --- HANDLERS DINÁMICOS (VARIACIONES Y GRUPOS DE EXTRAS) ---
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
      // Normalización estricta de tipos numéricos antes de empujar el payload
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

      toast.success(initialData ? "CAMBIOS GUARDADOS" : "ÍTEM DESPLEGADO", {
        icon: <CheckCircle className="text-black" />,
        description: `${formData.nombre.toUpperCase()} se sincronizó correctamente.`,
      });

      if (onSuccess) onSuccess();
    } catch {
      toast.error("ERROR AL GUARDAR", { description: "Error con Supabase." });
    } finally {
      setFormData((prev) => ({ ...prev })); // Fix menor para asegurar limpieza de render loops
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-4 border-black p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-sans w-full max-w-5xl"
    >
      {/* HEADER BRUTALISTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-black pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#A3FF00] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Package className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none text-black">
              {initialData ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mt-1">
              ENGINE DE INVENTARIO MULTI-TENANT v3.0
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="md:hidden flex items-center justify-center gap-2 bg-black text-white p-4 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#A3FF00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          <span>Salvar</span>
        </button>
      </div>

      {/* CUERPO DEL FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: INFORMACIÓN CORE */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Nombre Comercial
            </label>
            <input
              required
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full p-3 bg-white border-2 border-black font-bold outline-none text-sm uppercase text-black"
              placeholder="Ej: Triple Bacon Burger"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Descripción Corta
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full p-3 bg-white border-2 border-black font-medium outline-none text-sm resize-none h-20 text-black"
              placeholder="Detalla los ingredientes del plato..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-black">
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
                className="w-full p-3 bg-white border-2 border-black font-mono font-black text-sm text-black"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <CategorySelect
                negocioId={negocioId}
                selectedId={formData.categoria_id}
                onChange={(id) =>
                  setFormData({ ...formData, categoria_id: id })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 border-2 border-black">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) =>
                setFormData({ ...formData, disponible: e.target.checked })
              }
              className="w-4 h-4 accent-black border-2 border-black cursor-pointer"
            />
            <label
              htmlFor="disponible"
              className="text-xs font-black uppercase tracking-wider cursor-pointer text-black"
            >
              ¿Habilitar stock para venta inmediata?
            </label>
          </div>
        </div>

        {/* COLUMNA DERECHA: CONFIGURADORES COMPLEJOS (JSONB) */}
        <div className="lg:col-span-7 space-y-6 border-t-4 lg:border-t-0 lg:border-l-4 border-dashed border-black pt-6 lg:pt-0 lg:pl-6">
          {/* SECCIÓN VARIANTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-black bg-black text-white px-2 py-0.5 uppercase tracking-wider">
                [01] Tamaños / Variaciones
              </h3>
              <button
                type="button"
                onClick={agregarVariante}
                className="text-[10px] font-black uppercase tracking-tight flex items-center gap-1 text-black bg-[#A3FF00] border border-black px-2 py-0.5"
              >
                <Plus size={10} strokeWidth={3} /> Añadir
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {variantes.map((v, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center bg-gray-50 p-2 border border-black"
                >
                  <input
                    type="text"
                    required
                    value={v.nombre}
                    onChange={(e) =>
                      actualizarVariante(idx, { nombre: e.target.value })
                    }
                    placeholder="Ej: Grande"
                    className="flex-1 p-1.5 bg-white border border-black text-xs font-bold text-black uppercase"
                  />
                  <input
                    type="number"
                    required
                    value={v.precio}
                    onChange={(e) =>
                      actualizarVariante(idx, {
                        precio:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    placeholder="Precio"
                    className="w-24 p-1.5 bg-white border border-black text-xs font-mono font-bold text-black"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarVariante(idx)}
                    className="p-1.5 text-red-600 hover:bg-black hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {variantes.length === 0 && (
                <p className="text-[11px] text-gray-400 font-mono italic">
                  No se definieron variantes de precio base.
                </p>
              )}
            </div>
          </div>

          {/* SECCIÓN MODIFICADORES COMPLEJOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-black bg-black text-white px-2 py-0.5 uppercase tracking-wider">
                [02] Grupos de Opciones (Adiciones / Salsas)
              </h3>
              <button
                type="button"
                onClick={agregarGrupoOpcion}
                className="text-[10px] font-black uppercase tracking-tight flex items-center gap-1 text-black bg-[#A3FF00] border border-black px-2 py-0.5"
              >
                <ListPlus size={12} /> Crear Grupo
              </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {gruposOpciones.map((grupo) => (
                <div
                  key={grupo.id}
                  className="border-2 border-black bg-white p-3 space-y-3 shadow-[2px_2px_0px_0px_#000000]"
                >
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={grupo.titulo}
                      onChange={(e) =>
                        actualizarGrupoOpcion(grupo.id, e.target.value)
                      }
                      placeholder="Nombre del Grupo (Ej: Elige tus salsas)"
                      className="flex-1 p-2 bg-gray-50 border border-black text-xs font-black uppercase text-black"
                    />
                    <button
                      type="button"
                      onClick={() => agregarItemAGrupo(grupo.id)}
                      className="text-[9px] font-black uppercase bg-black text-white px-2 py-1.5"
                    >
                      + Item
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarGrupoOpcion(grupo.id)}
                      className="p-1.5 text-red-600 border border-black hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Sub-items del Grupo */}
                  <div className="space-y-1.5 pl-4 border-l-2 border-black">
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
                          className="flex-1 p-1 bg-white border border-gray-400 text-xs font-medium text-black"
                        />
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
                          placeholder="+$0"
                          className="w-20 p-1 bg-white border border-gray-400 text-xs font-mono text-black"
                        />
                        <button
                          type="button"
                          onClick={() => eliminarItemDeGrupo(grupo.id, item.id)}
                          className="text-red-500 hover:text-black"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACCIONES DE RED */}
      <div className="mt-8 pt-6 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-wide">
          * LOS MODIFICADORES AFECTAN EL TICKET FINAL EN PRODUCCIÓN
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-[#A3FF00] hover:bg-black hover:text-white border-2 border-black text-black font-black uppercase text-sm px-10 py-5 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> SINCRONIZANDO...
            </>
          ) : (
            <>
              <Save size={16} strokeWidth={2.5} /> Guardar Cambios en Servidor
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
