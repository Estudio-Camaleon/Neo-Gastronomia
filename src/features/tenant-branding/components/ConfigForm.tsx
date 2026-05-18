"use client";

import { useState } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, Settings } from "lucide-react";
import {
  updateTenantBrandingAction,
  UpdateTenantBrandingPayload,
} from "../actions";

// Subsecciones Modulares
import { BrandingSection } from "../sections/BrandingSection";
import { GeneralInfoSection } from "../sections/GeneralInfoSection";
import { CatalogDesignSection } from "../sections/CatalogDesignSection";
import { SocialLinksSection } from "../sections/SocialLinksSection";
import { ScheduleEditor, type ScheduleData } from "./ScheduleEditor";

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
  horarios: Record<string, unknown>;
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

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    direccion: initialData?.direccion || "",
    localidad: initialData?.localidad || "",
    direccion_notas: initialData?.direccion_notas || "",
    color_primary: initialData?.color_primary || "#000000",
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
      return toast.error("ARCHIVO EXCEDE LÍMITE DE 2MB");

    setUploading(field);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${field}-${Date.now()}.${fileExt}`;
      const filePath = `identidad/${fileName}`;

      // Escritura en el Bucket Unificado de Supabase
      const { error: uploadError } = await supabase.storage
        .from("imagenes-negocios")
        .upload(filePath, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("imagenes-negocios").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success("ASSET DE MARCA SINCRONIZADO EN TERMINAL");
    } catch (err: any) {
      toast.error("FALLO DE CARGA DE ASSET", { description: err.message });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id)
      return toast.error("ERROR CRÍTICO: ID DE TENANT AUSENTE");

    setIsPending(true);
    try {
      const payload: UpdateTenantBrandingPayload = {
        id: initialData.id,
        ...formData,
      };

      const res = await updateTenantBrandingAction(payload);

      setFormData((prev) => ({ ...prev, slug: res.slugSaneado }));
      toast.success("INFRAESTRUCTURA DE MARCA ACTUALIZADA", {
        icon: <CheckCircle2 className="text-black" />,
      });

      router.refresh();
    } catch (error: any) {
      toast.error("FALLO DE SINCRONIZACIÓN", { description: error.message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 font-sans text-black max-w-5xl"
    >
      <BrandingSection
        logoUrl={formData.logo_url}
        bannerUrl={formData.banner_url}
        uploading={uploading}
        onImageUpload={handleImageUpload}
      />

      <div className="grid grid-cols-1 gap-8">
        <GeneralInfoSection formData={formData} onChange={handleChange} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <SocialLinksSection formData={formData} onChange={handleChange} />
          </div>
          <div className="lg:col-span-5">
            <CatalogDesignSection
              colorPrimary={formData.color_primary}
              onChange={(val) =>
                setFormData((p) => ({ ...p, color_primary: val }))
              }
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN HORARIOS BRUTALISTA DE ALTA DENSIDAD */}
      <div className="bg-white border-4 border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black uppercase italic tracking-tight border-b-4 border-black pb-3 flex items-center gap-2">
          <Settings className="h-5 w-5 stroke-[2.5]" /> GESTIÓN DE HORARIOS
          OPERATIVOS
        </h3>
        <ScheduleEditor
          schedule={formData.horarios}
          onChange={(newSchedule) =>
            setFormData((p) => ({ ...p, horarios: newSchedule }))
          }
        />
      </div>

      {/* BARRA FLOTANTE FIJA DE ACCIÓN RÍGIDA */}
      <div className="sticky bottom-6 z-50 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="group bg-[#A3FF00] border-4 border-black text-black px-10 py-5 font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-40 flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 className="animate-spin text-black" size={16} />
          ) : (
            <Save size={16} strokeWidth={2.5} />
          )}
          <span>
            {isPending
              ? "SALVANDO CONFIGURACIÓN..."
              : "GUARDAR IDENTIDAD DE MARCA"}
          </span>
        </button>
      </div>
    </form>
  );
}
