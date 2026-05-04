"use client";

import { useState } from "react";
import { guardarProducto } from "@/app/actions/productos";
import { toast } from "sonner";
import {
  Package,
  DollarSign,
  Tag,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  FileText,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface ProductoFormProps {
  negocioId: string;
  categorias: any[];
  initialData?: any;
  onSuccess?: () => void;
}

export function ProductoForm({
  negocioId,
  categorias,
  initialData,
  onSuccess,
}: ProductoFormProps) {
  const [isPending, setIsPending] = useState(false);

  // Estado inicial sincronizado con public.productos
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio || "",
    imagen_url: initialData?.imagen_url || "",
    categoria_id: initialData?.categoria_id || "",
    disponible: initialData?.disponible ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de negocioId antes de disparar la acción
    if (!negocioId) {
      toast.error("Error de sesión: No se detectó el ID del negocio.");
      return;
    }

    setIsPending(true);

    try {
      const res = await guardarProducto(negocioId, formData, initialData?.id);

      if (res.success) {
        toast.success(
          initialData ? "PRODUCTO ACTUALIZADO" : "PRODUCTO PUBLICADO",
          {
            description: `${formData.nombre} ya está disponible en tu catálogo.`,
          },
        );

        // Si es una creación, reseteamos el formulario
        if (!initialData) {
          setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            imagen_url: "",
            categoria_id: "",
            disponible: true,
          });
        }

        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      toast.error("ERROR AL GUARDAR", {
        description: error.message || "Ocurrió un problema con Supabase.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 shadow-sm animate-in fade-in duration-500"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Package className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
            {initialData ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
            Completa los detalles técnicos del item
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* COLUMNA 1: MEDIA (IMAGE UPLOAD) */}
        <div className="lg:col-span-1">
          <ImageUpload
            value={formData.imagen_url}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, imagen_url: url }))
            }
          />
        </div>

        {/* COLUMNA 2 & 3: FORM DATA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fila 1: Nombre y Precio */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                Nombre del Producto
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-border focus:border-primary outline-none font-bold uppercase italic transition-all"
                placeholder="EJ: BURGER TRIPLE CHEESE"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                Precio de Venta
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, precio: e.target.value }))
                  }
                  className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border focus:border-primary outline-none font-black italic transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Categoría y Disponibilidad */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                Categoría
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <select
                  value={formData.categoria_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoria_id: e.target.value,
                    }))
                  }
                  className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border focus:border-primary outline-none font-bold uppercase italic appearance-none cursor-pointer"
                >
                  <option value="">Sin Categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                Estado de Stock
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    disponible: !prev.disponible,
                  }))
                }
                className={`w-full p-3.5 rounded-neo border-2 flex items-center justify-between transition-all active:scale-95 ${
                  formData.disponible
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600"
                    : "border-error bg-error/5 text-error opacity-70"
                }`}
              >
                <span className="font-black uppercase italic text-[10px] tracking-widest">
                  {formData.disponible ? "Disponible" : "Agotado / Pausado"}
                </span>
                {formData.disponible ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <XCircle size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Fila 3: Descripción */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
              <FileText size={12} /> Descripción y Detalles
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-border focus:border-primary outline-none font-medium text-sm min-h-[120px] resize-none transition-all"
              placeholder="Ej: Medallón de carne 180g, cheddar, bacon y salsa secreta..."
            />
          </div>
        </div>
      </div>

      {/* Acciones Finales */}
      <div className="mt-10 pt-6 border-t-2 border-dashed border-border flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex items-center gap-3 bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] italic hover:invert transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          <span>
            {isPending
              ? "Sincronizando..."
              : initialData
                ? "Guardar Cambios"
                : "Publicar en Menú"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
      </div>
    </form>
  );
}
