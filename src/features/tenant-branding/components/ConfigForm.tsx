"use client";

import { useState } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  CheckCircle2,
  Settings,
  AlertTriangle,
} from "lucide-react";
import {
  updateTenantBrandingAction,
  type UpdateTenantBrandingPayload,
} from "../actions";

// Subsecciones Modulares del Core de Configuración
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

export interface ConfigFormState {
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

  // Inicialización de estado plano para sincronización perfecta con subsecciones
  const [formData, setFormData] = useState<ConfigFormState>({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    direccion: initialData?.direccion || "",
    localidad: initialData?.localidad || "",
    direccion_notas: initialData?.direccion_notas || "",
    color_primary: initialData?.color_primary || "#A3FF00",
    logo_url: initialData?.logo_url || "",
    banner_url: initialData?.banner_url || "",
    instagram_url: initialData?.instagram_url || "",
    facebook_url: initialData?.facebook_url || "",
    tiktok_url: initialData?.tiktok_url || "",
    horarios: (initialData?.horarios as unknown as ScheduleData) || {},
  });

  // UX PREVENTIVA: Monitoreo estricto del cambio de URL pública (Slug Change Radar)
  const hasSlugChanged =
    initialData?.slug !== undefined && initialData?.slug !== formData.slug;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "slug") {
      // Saneamiento en caliente: remueve espacios, acentos y fuerza minúsculas en tiempo real
      const sanitizedSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Limpia tildes
        .replace(/[^a-z0-9-_]/g, ""); // Solo permite caracteres válidos para URLs

      setFormData((prev) => ({ ...prev, [name]: sanitizedSlug }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("EL ARCHIVO EXCEDE EL LÍMITE DE 2MB");
    }

    setUploading(field);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${field}-${Date.now()}.${fileExt}`;
      const filePath = `identidad/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes-negocios")
        .upload(filePath, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("imagenes-negocios").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success("ASSET DE MARCA SINCRONIZADO EN TERMINAL");
    } catch {
      toast.error("FALLO DE CARGA DE ASSET EN SERVIDOR");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) {
      return toast.error("ERROR CRÍTICO: ID DE TENANT AUSENTE");
    }

    setIsPending(true);
    try {
      // payload blindado garantizando strings primitivos puros hacia actions.ts
      const payload: UpdateTenantBrandingPayload = {
        id: initialData.id,
        nombre: formData.nombre,
        slug: formData.slug,
        whatsapp: formData.whatsapp,
        direccion: formData.direccion,
        localidad: formData.localidad,
        direccion_notas: formData.direccion_notas,
        color_primary: formData.color_primary,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        links_sociales: {
          instagram: formData.instagram_url,
          facebook: formData.facebook_url,
          tiktok: formData.tiktok_url,
        },
        horarios: formData.horarios as Record<string, unknown>,
      };

      const res = await updateTenantBrandingAction(payload);

      setFormData((prev) => ({ ...prev, slug: res.slugSaneado }));
      toast.success("INFRAESTRUCTURA DE MARCA ACTUALIZADA", {
        icon: <CheckCircle2 className="text-[#A3FF00]" />,
      });

      router.refresh();
    } catch {
      toast.error("FALLO DE SINCRONIZACIÓN EN BASE DE DATOS");
    } finally {
      setFormData((prev) => ({ ...prev, slug: formData.slug.trim() }));
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 font-sans text-black max-w-5xl"
    >
      {/* ALERTA CRÍTICA DE SLUG (MODO UX ACTIVADO) */}
      {hasSlugChanged && (
        <div className="bg-[#FF3333] text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3 animate-pulse">
          <AlertTriangle className="h-6 w-6 shrink-0 stroke-[2.5]" />
          <div className="font-mono text-xs uppercase tracking-wide">
            <span className="font-black block text-sm mb-1">
              ⚠️ [CRITICAL SATELLITE WARNING]:
            </span>
            Estás alterando el enlace de acceso de tus clientes. Al guardar, la
            URL antigua de tu menú
            <span className="bg-black text-[#FF3333] px-1 mx-1 font-bold">
              /{initialData?.slug}
            </span>
            dejará de responder y dará error 404. La nueva ruta será
            <span className="bg-black text-[#A3FF00] px-1 mx-1 font-bold">
              /{formData.slug}
            </span>
            .
          </div>
        </div>
      )}

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
          className="group bg-[#A3FF00] border-4 border-black text-black px-10 py-5 font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer"
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
