"use client";

import { useEffect, useState, useRef } from "react";
import { X, UploadCloud } from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null;
  onChange: (_url: string) => void;
  uploadEndpoint?: string;
  alt?: string;
  compact?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  uploadEndpoint = "/api/admin/product-images",
  alt = "Vista previa de la imagen",
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Por favor subí solo imágenes.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Archivo muy pesado", { description: "Límite máximo: 5MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as {
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Error desconocido al subir la imagen",
        );
      }

      if (!payload.publicUrl) {
        throw new Error("El servidor no devolvió una URL pública.");
      }

      if (objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
      setPreviewUrl(payload.publicUrl);
      onChange(payload.publicUrl);
      toast.success("Imagen cargada");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al subir la imagen";
      toast.error("Error de carga", { description: errorMessage });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (previewUrl && !value) {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!value) return;

    try {
      const response = await fetch(uploadEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: value }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "No se pudo eliminar la imagen.");
      }

      onChange("");
      setPreviewUrl(null);
      toast.info("Imagen eliminada", {
        description: "El archivo fue removido del servidor.",
      });
    } catch (error: unknown) {
      console.error("Error al borrar:", error);
      toast.error("No se pudo eliminar la imagen");
    }
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className={`relative group flex-1 ${compact ? "min-h-[120px]" : "min-h-[250px]"}`}>
        {value || previewUrl ? (
          <div className="relative h-full w-full rounded-xl overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm transition-all hover:border-[var(--admin-accent)]">
            <img
              src={previewUrl || value || ""}
              alt={alt}
              className="h-full w-full object-cover animate-in fade-in zoom-in-95 duration-300"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)] rounded-full border border-[var(--admin-border)] shadow-sm hover:scale-105 active:scale-95 transition-all z-10"
            >
              <X size={16} />
            </button>
            {isUploading && (
              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-center text-xs font-semibold text-white">
                Subiendo imagen...
              </div>
            )}
          </div>
        ) : (
          <label
            className={`
              flex flex-col items-center justify-center h-full w-full 
              rounded-xl border-2 border-dashed transition-all cursor-pointer select-none
              ${
                isUploading
                  ? "bg-[var(--admin-bg)] border-[var(--admin-border)]"
                  : "bg-[var(--admin-bg)] border-[var(--admin-border)] hover:border-[var(--admin-border-strong)]"
              }
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <FoodMini size={24} />
                <span className="text-sm font-medium text-[var(--admin-text-muted)]">
                  Subiendo...
                </span>
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-3 ${compact ? 'p-3' : 'p-6'} text-center`}>
                <div className={`${compact ? 'p-2' : 'p-3'} bg-[var(--admin-surface)] rounded-full border border-[var(--admin-border)] shadow-sm`}>
                  <UploadCloud
                    className="text-[var(--admin-text-muted)] transition-colors"
                    size={compact ? 18 : 24}
                  />
                </div>
                {!compact && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-[var(--admin-text)] block">
                      Haga clic para subir una imagen
                    </span>
                    <span className="text-xs text-[var(--admin-text-muted)] block">
                      MAX 5MB (JPG/PNG/WEBP)
                    </span>
                  </div>
                )}
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
