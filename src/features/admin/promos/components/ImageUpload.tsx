"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { FoodMini } from "@/components/ui/food-loading";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera el límite de 5MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/promo-images", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { publicUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Error al subir");
      if (!data.publicUrl) throw new Error("No se recibió URL");
      onChange(data.publicUrl);
      toast.success("Imagen cargada");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await fetch("/api/admin/promo-images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
      } catch {
        // ignore cleanup errors
      }
    }
    onChange(null);
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--admin-border)] group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center justify-center w-28 h-20 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5 scale-105"
              : "border-[var(--admin-border)] hover:border-[var(--admin-accent)]"
          }`}
        >
          {uploading ? (
            <FoodMini size={16} />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload size={18} className="text-[var(--admin-text-muted)]" />
              <span className="text-[8px] text-[var(--admin-text-muted)]">Arrastrar o click</span>
              <span className="text-[7px] text-[var(--admin-text-muted)]/60">Máx. 5MB</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      )}
      {!value && !uploading && (
        <span className="text-[11px] text-[var(--admin-text-muted)]">
          Subí una foto para esta promo
        </span>
      )}
    </div>
  );
}
