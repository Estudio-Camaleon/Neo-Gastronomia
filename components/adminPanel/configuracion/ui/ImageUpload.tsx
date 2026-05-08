"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value: string | null;
  onChange: (_url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo de archivo (Seguridad)
    if (!file.type.startsWith("image/")) {
      toast.error("FORMATO INVÁLIDO", {
        description: "Por favor subí solo imágenes.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validación de tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ARCHIVO MUY PESADO", { description: "Límite máximo: 2MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("IMAGEN CARGADA");
    } catch (error: unknown) {
      // Tipado estricto para el linter
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al subir la imagen";
      toast.error("ERROR DE CARGA", { description: errorMessage });
    } finally {
      setIsUploading(false);
      // Limpiamos el input para permitir subir el mismo archivo si se borra
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (!value) return;

    try {
      // Hacemos el parseo más robusto buscando el nombre del bucket "media/"
      if (value.includes("/media/")) {
        const path = value.split("/media/")[1];
        if (path) {
          await supabase.storage.from("media").remove([path]);
        }
      }

      onChange("");
      toast.info("IMAGEN ELIMINADA", {
        description: "El archivo fue removido del servidor.",
      });
    } catch (error: unknown) {
      console.error("Error al borrar:", error);
      // Ante cualquier fallo en el servidor, igual limpiamos el estado local
      onChange("");
    }
  };

  return (
    <div className="space-y-3 font-sans h-full flex flex-col">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic flex items-center gap-2 ml-1 select-none">
        Fotografía del Producto
      </label>

      <div className="relative group flex-1 min-h-[250px]">
        {value ? (
          <div className="relative h-full w-full rounded-neo overflow-hidden border-2 border-black group-hover:border-primary transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-bg-main dark:bg-bg-dark">
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover animate-in fade-in zoom-in-95 duration-500"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 bg-error text-white rounded-full border-2 border-black shadow-lg hover:scale-110 active:scale-90 transition-transform z-10"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <label
            className={`
              flex flex-col items-center justify-center h-full w-full 
              rounded-neo border-2 border-dashed transition-all cursor-pointer select-none
              ${
                isUploading
                  ? "bg-bg-main dark:bg-bg-dark/40 border-primary/40"
                  : "bg-bg-main dark:bg-bg-dark border-black hover:bg-primary/5 hover:border-primary"
              }
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={28} />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse font-mono">
                  Sincronizando...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="p-4 bg-white dark:bg-bg-darker rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <UploadCloud
                    className="text-text-muted group-hover:text-primary transition-colors"
                    size={24}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-primary dark:text-text-inverse block">
                    Cargar Imagen
                  </span>
                  <span className="text-[8px] font-bold uppercase text-text-muted block opacity-60 font-mono">
                    MAX 2MB (JPG/PNG)
                  </span>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
