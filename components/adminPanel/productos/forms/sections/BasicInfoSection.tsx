"use client";

import React from "react";
import {
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  FileText,
  Info,
} from "lucide-react";
import { ImageUpload } from "@/components/adminPanel/configuracion/ui/ImageUpload";

interface CategoriaOption {
  id: string;
  nombre: string;
}

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: string | number;
  imagen_url: string | null;
  categoria_id: string;
  disponible: boolean;
}

interface BasicInfoSectionProps {
  formData: ProductoFormData;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nombre: string;
      descripcion: string;
      precio: string | number;
      imagen_url: string | null;
      categoria_id: string;
      disponible: boolean;
    }>
  >;
  categorias: CategoriaOption[];
}

export function BasicInfoSection({
  formData,
  setFormData,
  categorias,
}: BasicInfoSectionProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      {/* 📸 COLUMNA 1: CARGA DE IMAGEN (MODO DEBUG) */}
      <div className="lg:col-span-1 space-y-2 bg-red-500 p-4 border-4 border-black">
        <h1 className="text-white font-black text-2xl uppercase">¿ME VES?</h1>
        <label className="text-[10px] font-black uppercase tracking-widest text-white italic flex items-center gap-2 ml-1">
          Fotografía del Producto
        </label>
        <ImageUpload
          value={formData.imagen_url}
          onChange={(url) =>
            setFormData((prev) => ({
              ...prev,
              imagen_url: url,
            }))
          }
        />
      </div>

      {/* 📝 COLUMNA 2 & 3: DATOS DEL FORMULARIO */}
      <div className="lg:col-span-2 space-y-6">
        {/* Fila 1: Nombre y Precio */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
              <Info size={12} className="text-primary" /> Nombre del Producto
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nombre: e.target.value,
                }))
              }
              className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-black focus:border-primary text-text-primary dark:text-text-inverse outline-none font-bold uppercase italic transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="EJ: BURGER TRIPLE CHEESE"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
              <DollarSign size={12} className="text-primary" /> Precio de Venta
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10" />
              <input
                type="number"
                step="0.01"
                required
                value={formData.precio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    precio: e.target.value,
                  }))
                }
                className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-black focus:border-primary text-text-primary dark:text-text-inverse outline-none font-black italic transition-all font-mono focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Fila 2: Categoría y Disponibilidad */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
              <Tag size={12} className="text-primary" /> Categoría
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  categoria_id: e.target.value,
                }))
              }
              className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-black focus:border-primary text-text-primary dark:text-text-inverse outline-none font-bold uppercase italic appearance-none cursor-pointer focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="">Sin Categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
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
              className={`w-full p-3.5 rounded-neo border-2 border-black flex items-center justify-between transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                formData.disponible
                  ? "bg-emerald-500 text-white"
                  : "bg-error text-white opacity-70"
              }`}
            >
              <span className="font-black uppercase italic text-[10px] tracking-widest">
                {formData.disponible ? "Disponible" : "Agotado"}
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
            <FileText size={12} className="text-primary" /> Descripción y
            Detalles
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                descripcion: e.target.value,
              }))
            }
            className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-black focus:border-primary text-text-primary dark:text-text-inverse outline-none font-medium text-sm min-h-[100px] resize-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            placeholder="Ej: Medallón de carne 180g, cheddar, bacon..."
          />
        </div>
      </div>
    </div>
  );
}
