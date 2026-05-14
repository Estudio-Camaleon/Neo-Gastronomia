"use client";

import { useState } from "react";
import { guardarProducto } from "@/app/actions/productos";
import { toast } from "sonner";
import { Package, Loader2, Save, CheckCircle } from "lucide-react";
import { Button } from "../../ui"; // Importamos del Core

import { BasicInfoSection } from "./sections/BasicInfoSection";
import { CustomizationSection } from "./sections/CustomizationSection";

// --- INTERFACES ---
export interface Variant {
  nombre: string;
  precio: number | string;
}

export interface ExtraItem {
  id: string;
  nombre: string;
  precio: number | string;
}

export interface ExtraGroup {
  id: string;
  titulo: string;
  requerido: boolean;
  multiple: boolean;
  items: ExtraItem[];
}

interface CategoriaOption {
  id: string;
  nombre: string;
}

interface ProductoInitialData {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  imagen_url: string | null;
  categoria_id: string | null;
  disponible: boolean;
  configuracion?: {
    variantes?: Variant[];
    grupo_extras?: ExtraGroup[];
  } | null;
}

interface ProductoFormProps {
  negocioId: string;
  categorias: CategoriaOption[];
  initialData?: ProductoInitialData | null;
  onSuccess?: () => void;
}

export function ProductoForm({
  negocioId,
  categorias,
  initialData,
  onSuccess,
}: ProductoFormProps) {
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState<{
    nombre: string;
    descripcion: string;
    precio: string | number;
    imagen_url: string | null;
    categoria_id: string;
    disponible: boolean;
  }>({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio || "",
    imagen_url: initialData?.imagen_url || null,
    categoria_id: initialData?.categoria_id || "",
    disponible: initialData?.disponible ?? true,
  });

  const [variantes, setVariantes] = useState<Variant[]>(
    initialData?.configuracion?.variantes || [],
  );

  const [grupoExtras, setGrupoExtras] = useState<ExtraGroup[]>(
    initialData?.configuracion?.grupo_extras || [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!negocioId) {
      return toast.error("Error de sesión: No se detectó el ID del negocio.");
    }

    setIsPending(true);

    try {
      const variantesFormateadas = variantes.map((v) => ({
        ...v,
        precio: Number(v.precio),
      }));

      const extrasFormateados = grupoExtras.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i, precio: Number(i.precio) })),
      }));

      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: Number(formData.precio),
        imagen_url: formData.imagen_url || null,
        categoria_id: formData.categoria_id || null,
        disponible: formData.disponible,
        configuracion: {
          variantes: variantesFormateadas,
          grupo_extras: extrasFormateados,
        },
      };

      const res = await guardarProducto(negocioId, payload, initialData?.id);

      if (res.success) {
        toast.success(
          initialData ? "PRODUCTO ACTUALIZADO" : "PRODUCTO PUBLICADO",
          {
            icon: <CheckCircle className="text-green-500" />,
            description: `${formData.nombre.toUpperCase()} guardado correctamente.`,
          },
        );
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error con Supabase.";
      toast.error("ERROR AL GUARDAR", { description: errorMessage });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-bg-darker border-4 border-black rounded-[32px] p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-sans w-full"
    >
      {/* --- HEADER RESPONSIVE --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-black pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-xl text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter leading-none text-text-primary dark:text-text-inverse">
              {initialData ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">
              Catálogo inteligente NEO v1.5
            </p>
          </div>
        </div>

        {/* Botón de guardado rápido para Mobile (Visible solo arriba en mobile) */}
        <button
          type="submit"
          disabled={isPending}
          className="md:hidden flex items-center justify-center gap-2 bg-black text-white p-4 rounded-2xl font-black uppercase italic active:scale-95 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>Guardar</span>
        </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="space-y-10">
        <BasicInfoSection
          formData={formData}
          setFormData={setFormData}
          categorias={categorias}
        />

        <div className="border-t-4 border-dashed border-black/10 pt-8">
          <CustomizationSection
            variantes={variantes}
            setVariantes={setVariantes}
            grupoExtras={grupoExtras}
            setGrupoExtras={setGrupoExtras}
          />
        </div>
      </div>

      {/* --- FOOTER / ACCIONES --- */}
      <div className="mt-12 pt-8 border-t-4 border-black flex flex-col md:flex-row items-center justify-between gap-6">
  <p className="hidden md:block text-[10px] font-black uppercase text-text-muted italic">
    * Campos obligatorios revisados por sistema
  </p>

  <Button
    type="submit"
    isLoading={isPending}
    icon={Save}
    className="w-full md:w-auto text-lg px-12 py-6"
  >
    {initialData ? "Actualizar Cambios" : "Publicar Producto"}
  </Button>
</div>
    </form>
  );
}
