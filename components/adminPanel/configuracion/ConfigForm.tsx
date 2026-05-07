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

// --- INTERFACES UNIFICADAS PARA EL FORMULARIO ---
interface HorarioDia {
  activo?: boolean; // Agregado por seguridad si tu editor lo usa
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
    color_primary: initialData?.color_primary || "#1c7a42",
    logo_url: initialData?.logo_url || "",
    banner_url: initialData?.banner_url || "",
    horarios: (initialData?.horarios as unknown as ScheduleData) || {},
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
        description: "Previsualización lista. Recordá guardar para aplicar.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error("ERROR DE STORAGE", { description: errorMessage });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!initialData?.id) {
      return toast.error("ERROR DE REFERENCIA", {
        description: "No se encontró el ID del negocio.",
      });
    }

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
        .eq("id", initialData.id);

      if (error) throw error;

      toast.success("CONFIGURACIÓN ACTUALIZADA", {
        icon: <CheckCircle2 className="text-green-500" />,
      });

      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error de base de datos.";
      toast.error("ERROR AL GUARDAR", { description: errorMessage });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 animate-in fade-in duration-700 font-sans max-w-5xl mx-auto pb-20"
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

      <section className="bg-white dark:bg-bg-darker border-4 border-black rounded-[2rem] p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
        <h3 className="text-xl font-black uppercase italic mb-6 tracking-tighter">
          Horarios de Atención
        </h3>
        {/* 
          CORRECCIÓN DEL TYPE ERROR: 
          Casteamos el retorno del onChange para asegurar compatibilidad en el build 
        */}
        <ScheduleEditor
          schedule={formData.horarios}
          onChange={(newSchedule) =>
            setFormData((prev) => ({
              ...prev,
              horarios: newSchedule as unknown as ScheduleData,
            }))
          }
        />
      </section>

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

      {/* Botón Flotante con Estilo NEO */}
      <div className="sticky bottom-10 z-50 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="group flex items-center gap-4 bg-primary text-black px-12 py-5 rounded-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all disabled:opacity-70 font-black uppercase italic tracking-widest text-sm"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          <span>{isPending ? "Sincronizando..." : "Guardar Cambios"}</span>
        </button>
      </div>
    </form>
  );
}
