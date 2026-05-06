"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

import { BrandingSection } from "./sections/BrandingSection";
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { CatalogDesignSection } from "./sections/CatalogDesignSection";
import { ScheduleEditor } from "./editors/ScheduleEditor";

interface HorarioDia {
  inicio: string;
  fin: string;
}

interface ScheduleData {
  [dayId: string]: HorarioDia | undefined;
}

export interface NegocioInitialData {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  direccion: string;
  color_primary: string;
  logo_url: string;
  banner_url: string;
  horarios: Record<string, unknown>;
}

interface ConfigFormProps {
  initialData: NegocioInitialData | null;
  userId: string;
}

interface FormState {
  nombre: string;
  slug: string;
  whatsapp: string;
  direccion: string;
  color_primary: string;
  logo_url: string;
  banner_url: string;
  horarios: ScheduleData;
}

export function ConfigForm({ initialData, userId }: ConfigFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    direccion: initialData?.direccion || "",
    color_primary: initialData?.color_primary || "#10b981",
    logo_url: initialData?.logo_url || "",
    banner_url: initialData?.banner_url || "",
    horarios: (initialData?.horarios as ScheduleData) || {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (nuevoColor: string) => {
    setFormData((prev) => ({ ...prev, color_primary: nuevoColor }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("ARCHIVO DEMASIADO GRANDE", {
        description: "El límite permitido es de 2MB por imagen.",
      });
    }

    setUploading(field);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${field}-${Date.now()}.${fileExt}`;
      const filePath = `identidad/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes-negocios")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("imagenes-negocios").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success("IMAGEN CARGADA", {
        description:
          "Se ha actualizado la vista previa. No olvides guardar los cambios.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error("ERROR DE ALMACENAMIENTO", { description: errorMessage });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const { error } = await supabase
        .from("negocios")
        .update({
          nombre: formData.nombre.trim(),
          slug: formData.slug.trim().toLowerCase(),
          whatsapp: formData.whatsapp.trim(),
          direccion: formData.direccion.trim(),
          color_primary: formData.color_primary,
          logo_url: formData.logo_url,
          banner_url: formData.banner_url,
          horarios: formData.horarios,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("DATOS SINCRONIZADOS", {
        description: "La configuración ha sido actualizada correctamente.",
        icon: <CheckCircle2 className="text-green-500" />,
      });

      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al conectar con la base de datos.";
      toast.error("ERROR DE ACTUALIZACIÓN", { description: errorMessage });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 animate-in fade-in duration-700 font-sans"
    >
      <BrandingSection
        logoUrl={formData.logo_url}
        bannerUrl={formData.banner_url}
        uploading={uploading}
        onImageUpload={handleImageUpload}
      />

      <GeneralInfoSection
        nombre={formData.nombre}
        slug={formData.slug}
        whatsapp={formData.whatsapp}
        direccion={formData.direccion}
        onChange={handleChange}
      />

      <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 shadow-sm transition-colors">
        <ScheduleEditor
          schedule={formData.horarios}
          onChange={(newSchedule) =>
            setFormData((prev) => ({ ...prev, horarios: newSchedule }))
          }
        />
      </section>

      {/* 4. SECCIÓN DISEÑO DE CATÁLOGO */}
      {/* CORREGIDO: Removido el tipo 'any' mediante inferencia segura y firmas de tipos de unión */}
      <CatalogDesignSection
        colorPrimary={formData.color_primary}
        onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
          if (typeof e === "string") {
            handleColorChange(e);
          } else if (e && e.target) {
            handleColorChange(e.target.value);
          }
        }}
      />

      <div className="sticky bottom-10 z-50 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex items-center gap-4 bg-primary text-white px-14 py-6 rounded-full shadow-2xl shadow-primary/40 font-black uppercase tracking-[0.2em] border-4 border-white dark:border-bg-dark hover:scale-105 active:scale-95 transition-all disabled:opacity-70 select-none text-xs border-t border-white/10 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          <span>{isPending ? "SINCRONIZANDO..." : "ACTUALIZAR NEGOCIO"}</span>
        </button>
      </div>
    </form>
  );
}
