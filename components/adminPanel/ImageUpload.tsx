"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageIcon, Loader2, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de seguridad: Máximo 2MB y solo imágenes
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ARCHIVO MUY PESADO", {
        description: "El límite máximo para imágenes de productos es de 2MB.",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("FORMATO NO VÁLIDO", {
        description:
          "Por favor, selecciona un archivo de imagen (JPG, PNG, WebP).",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generar un nombre de archivo único para evitar colisiones en el Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Subida al bucket 'media' (debe estar creado en Supabase)
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública del archivo
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("IMAGEN CARGADA", {
        description: "La foto del producto se sincronizó correctamente.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("ERROR DE CARGA", {
        description: error.message || "No se pudo subir la imagen al servidor.",
      });
    } finally {
      setIsUploading(false);
      // Limpiar el input para permitir subir la misma imagen si se borra
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic flex items-center gap-2">
        Imagen del Producto
      </label>

      <div className="relative group w-full">
        {value ? (
          /* VISTA: IMAGEN CARGADA */
          <div className="relative aspect-square w-full rounded-neo overflow-hidden border-2 border-border group-hover:border-primary transition-all shadow-md">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 bg-error text-white rounded-full shadow-xl hover:scale-110 active:scale-90 transition-transform z-10"
              title="Eliminar imagen"
            >
              <X size={16} strokeWidth={3} />
            </button>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">
                Cambiar Foto
              </p>
            </div>
          </div>
        ) : (
          /* VISTA: DROPZONE / INPUT */
          <label
            className={`
              flex flex-col items-center justify-center aspect-square w-full 
              rounded-neo border-2 border-dashed transition-all cursor-pointer
              ${
                isUploading
                  ? "bg-gray-50 border-primary/30"
                  : "bg-bg-main border-border hover:bg-white hover:border-primary group"
              }
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">
                  Procesando...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="p-4 bg-white rounded-full border-2 border-border group-hover:border-primary group-hover:scale-110 transition-all shadow-sm">
                  <UploadCloud
                    className="text-border group-hover:text-primary"
                    size={28}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-primary block">
                    Click para subir
                  </span>
                  <span className="text-[8px] font-bold uppercase text-text-muted block opacity-60">
                    JPG, PNG O WEBP (MÁX. 2MB)
                  </span>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
