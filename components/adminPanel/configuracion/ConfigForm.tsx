"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

// Importación de Secciones
import { BrandingSection } from "./sections/BrandingSection";
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { CatalogDesignSection } from "./sections/CatalogDesignSection";
import { SocialLinksSection } from "./sections/SocialLinksSection";
import { ScheduleEditor, type ScheduleData } from "./editors/ScheduleEditor";

// Línea 24: Refactorizamos la interfaz de entrada
export interface NegocioInitialData {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  direccion: string;
  localidad?: string;
  direccion_notas?: string;
  color_primary: string;
  logo_url: string;
  banner_url: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  horarios: Record<string, unknown>; // Cambiado de any a unknown por seguridad
}

interface FormState {
  nombre: string;
  slug: string;
  whatsapp: string;
  direccion: string;
  localidad: string;
  direccion_notas: string;
  color_primary: string;
  logo_url: string;
  banner_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  horarios: ScheduleData;
}

export function ConfigForm({
  initialData,
  userId,
}: {
  initialData: NegocioInitialData | null;
  userId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Inicialización de estado con casteo seguro
  const [formData, setFormData] = useState<FormState>({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    direccion: initialData?.direccion || "",
    localidad: initialData?.localidad || "",
    direccion_notas: initialData?.direccion_notas || "",
    color_primary: initialData?.color_primary || "#4f46e5",
    logo_url: initialData?.logo_url || "",
    banner_url: initialData?.banner_url || "",
    instagram_url: initialData?.instagram_url || "",
    facebook_url: initialData?.facebook_url || "",
    tiktok_url: initialData?.tiktok_url || "",
    horarios: (initialData?.horarios as unknown as ScheduleData) || {},
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return toast.error("ARCHIVO DEMASIADO GRANDE", {
        description: "El límite es de 2MB.",
      });

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
      toast.success("IMAGEN SINCRONIZADA");
    } catch (error) {
      toast.error("ERROR DE CARGA", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id)
      return toast.error("ERROR CRÍTICO", {
        description: "No se encontró ID de negocio.",
      });

    setIsPending(true);

    try {
      const { error } = await supabase
        .from("negocios")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialData.id);

      if (error) throw error;

      toast.success("SISTEMA ACTUALIZADO", {
        icon: <CheckCircle2 className="text-[var(--admin-accent)]" />,
      });
      router.refresh();
    } catch (error) {
      toast.error("ERROR AL GUARDAR", {
        description:
          error instanceof Error ? error.message : "Error en el servidor",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <BrandingSection
        logoUrl={formData.logo_url}
        bannerUrl={formData.banner_url}
        uploading={uploading}
        onImageUpload={handleImageUpload}
      />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
        <GeneralInfoSection formData={formData} onChange={handleChange} />

        <div className="space-y-10">
          <SocialLinksSection formData={formData} onChange={handleChange} />
          <CatalogDesignSection
            colorPrimary={formData.color_primary}
            onChange={(val) =>
              setFormData((p) => ({ ...p, color_primary: val }))
            }
          />
        </div>
      </div>

      <section className="bg-[var(--admin-surface)] border-2 border-[var(--admin-border)] p-8 shadow-[var(--admin-shadow)]">
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter border-b border-[var(--admin-border)] pb-4">
            Gestión de Horarios
          </h3>
          <ScheduleEditor
            schedule={formData.horarios}
            onChange={(newSchedule) =>
              setFormData((p) => ({ ...p, horarios: newSchedule }))
            }
          />
        </div>
      </section>

      {/* STICKY SAVE BAR - PREMIUM LOOK */}
      <div className="sticky bottom-8 z-[60] flex justify-end animate-in slide-in-from-bottom-4 duration-500">
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex items-center gap-3 bg-[var(--admin-border)] text-[var(--admin-bg)] px-12 py-5 font-black uppercase italic tracking-widest text-sm shadow-[8px_8px_0px_0px_var(--admin-accent)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          <span>
            {isPending ? "Sincronizando..." : "Guardar Cambios Técnicos"}
          </span>

          {/* Decoración Industrial */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[var(--admin-accent)]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[var(--admin-accent)]" />
        </button>
      </div>
    </form>
  );
}
