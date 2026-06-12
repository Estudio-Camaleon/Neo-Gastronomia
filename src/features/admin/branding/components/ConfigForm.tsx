"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  ImageIcon,
  Upload,
  Palette,
  Info,
  Globe,
  Phone,
  Hash,
  MapPin,
  Share2,
  Clock,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import {
  updateTenantBrandingAction,
  deleteTenantBrandingAction,
} from "../actions";
import { generateSlug } from "@/core/lib/slug";
import type { UpdateTenantBrandingPayload, DireccionFisica } from "@/core/types/domain";
import { useUnsavedChanges } from "@/core/hooks/useUnsavedChanges";
import { UnsavedChangesModal } from "@/components/ui/unsaved-changes-modal";

export interface FranjaHoraria {
  inicio: string;
  fin: string;
}

export interface HorarioDia {
  turnos?: FranjaHoraria[];
}

export interface ScheduleData {
  [dayId: string]: HorarioDia | undefined;
}

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
  logo_scale?: number;
  logo_posicion?: string;
  logo_fit?: string;
  logo_shape?: string;
  banner_url: string;
  banner_posicion?: string;
  banner_height?: string;
  banner_scale?: number;
  mostrar_nombre?: boolean;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  horarios: ScheduleData;
  direcciones?: DireccionFisica[];
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
  logo_scale: number;
  logo_posicion: string;
  logo_fit: string;
  logo_shape: string;
  banner_url: string;
  banner_posicion: string;
  banner_height: string;
  banner_scale: number;
  mostrar_nombre: boolean;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  horarios: ScheduleData;
  direcciones: DireccionFisica[];
}

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

interface ColorPaletteGroup {
  label: string;
  colors: string[];
}

const COLOR_PALETTES: ColorPaletteGroup[] = [
  {
    label: "Fríos",
    colors: [
      "#2563eb",
      "#06b6d4",
      "#0891b2",
      "#4f46e5",
      "#6366f1",
      "#0ea5e9",
      "#14b8a6",
    ],
  },
  {
    label: "Cálidos",
    colors: [
      "#dc2626",
      "#ea580c",
      "#f59e0b",
      "#eab308",
      "#f97316",
      "#b91c1c",
      "#d97706",
    ],
  },
  {
    label: "Pasteles",
    colors: [
      "#f472b6",
      "#60a5fa",
      "#818cf8",
      "#facc15",
      "#34d399",
      "#f87171",
      "#a78bfa",
    ],
  },
  {
    label: "Vibrantes",
    colors: [
      "#ff006e",
      "#8338ec",
      "#3a86ff",
      "#34a35f",
      "#ffbe0b",
      "#fb5607",
      "#06d6a0",
    ],
  },
  {
    label: "Neutros",
    colors: [
      "#0f172a",
      "#1e293b",
      "#475569",
      "#64748b",
      "#78716c",
      "#292524",
      "#000000",
    ],
  },
];

const BANNER_VERTICAL_OPTIONS = [
  { value: "top", label: "Arriba" },
  { value: "center", label: "Centro" },
  { value: "bottom", label: "Abajo" },
] as const;

const LOGO_POSITION_OPTIONS = [
  { value: "top", label: "Arriba" },
  { value: "center", label: "Centro" },
  { value: "bottom", label: "Abajo" },
] as const;

const LOGO_FIT_OPTIONS = [
  { value: "contain", label: "Ajustar" },
  { value: "cover", label: "Cubrir" },
] as const;

const LOGO_SHAPE_OPTIONS = [
  { value: "circle", label: "Círculo" },
  { value: "rounded", label: "Redondeado" },
  { value: "square", label: "Cuadrado" },
] as const;

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function ConfigForm({
  initialData,
  userId,
}: {
  initialData: NegocioInitialData | null;
  userId: string;
}) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const [confirmName, setConfirmName] = useState("");
  const [imagePreviews, setImagePreviews] = useState({
    logo_url: initialData?.logo_url || "",
    banner_url: initialData?.banner_url || "",
  });

  const [formData, setFormData] = useState<ConfigFormState>({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    direccion: initialData?.direccion || "",
    localidad: initialData?.localidad || "",
    direccion_notas: initialData?.direccion_notas || "",
    color_primary: initialData?.color_primary || "#34a35f",
    logo_url: initialData?.logo_url || "",
    logo_scale: initialData?.logo_scale ?? 1,
    logo_posicion: initialData?.logo_posicion || "center",
    logo_fit: initialData?.logo_fit || "contain",
    logo_shape: initialData?.logo_shape || "circle",
    banner_url: initialData?.banner_url || "",
    banner_posicion: initialData?.banner_posicion || "center",
    banner_height: initialData?.banner_height || "normal",
    banner_scale: initialData?.banner_scale ?? 1,
    mostrar_nombre: initialData?.mostrar_nombre ?? true,
    instagram_url: initialData?.instagram_url || "",
    facebook_url: initialData?.facebook_url || "",
    tiktok_url: initialData?.tiktok_url || "",
    horarios: initialData?.horarios || {},
    direcciones: initialData?.direcciones || [],
  });

  const initialIdRef = useRef(initialData?.id);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const idCambio = initialData?.id && initialData.id !== initialIdRef.current;
    if (!idCambio && initialIdRef.current) return;
    if (initialData?.id) initialIdRef.current = initialData.id;
    setIsDirty(false);

    setImagePreviews({
      logo_url: initialData?.logo_url || "",
      banner_url: initialData?.banner_url || "",
    });

    setFormData({
      nombre: initialData?.nombre || "",
      slug: initialData?.slug || "",
      whatsapp: initialData?.whatsapp || "",
      direccion: initialData?.direccion || "",
      localidad: initialData?.localidad || "",
      direccion_notas: initialData?.direccion_notas || "",
      color_primary: initialData?.color_primary || "#34a35f",
      logo_url: initialData?.logo_url || "",
      logo_scale: initialData?.logo_scale ?? 1,
      logo_posicion: initialData?.logo_posicion || "center",
      logo_fit: initialData?.logo_fit || "contain",
      logo_shape: initialData?.logo_shape || "circle",
      banner_url: initialData?.banner_url || "",
      banner_posicion: initialData?.banner_posicion || "center",
      banner_height: initialData?.banner_height || "normal",
      banner_scale: initialData?.banner_scale ?? 1,
      mostrar_nombre: initialData?.mostrar_nombre ?? true,
      instagram_url: initialData?.instagram_url || "",
      facebook_url: initialData?.facebook_url || "",
      tiktok_url: initialData?.tiktok_url || "",
      horarios: initialData?.horarios || {},
      direcciones: initialData?.direcciones || [],
    });
  }, [initialData?.id]);

  const hasSlugChanged =
    initialData?.slug !== undefined && initialData?.slug !== formData.slug;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setIsDirty(true);

    if (name === "slug") {
      setFormData((prev) => ({ ...prev, [name]: generateSlug(value) }));
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
    setIsDirty(true);
    setFieldErrors((prev) => ({ ...prev, image: undefined }));
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const msg = `La imagen supera el límite permitido de ${MAX_IMAGE_SIZE_MB}MB`;
      setFieldErrors((prev) => ({ ...prev, image: msg }));
      return toast.error(msg);
    }

    const previousValue = formData[field];
    const previousPreview = imagePreviews[field];
    if (previousPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(previousPreview);
    }
    const objectUrl = URL.createObjectURL(file);
    blobUrlsRef.current.push(objectUrl);

    setImagePreviews((prev) => ({ ...prev, [field]: objectUrl }));
    setUploading(field);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", field);

      const response = await fetch("/api/admin/branding-images", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as {
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo subir la imagen.");
      }

      if (!payload.publicUrl) {
        throw new Error("El servidor no devolvió una URL pública.");
      }

      setFormData((prev) => ({ ...prev, [field]: payload.publicUrl }));
      setImagePreviews((prev) => ({ ...prev, [field]: payload.publicUrl }));
      blobUrlsRef.current = blobUrlsRef.current.filter((u) => u !== objectUrl);
      URL.revokeObjectURL(objectUrl);
      toast.success("Archivo multimedia sincronizado y protegido en Cloud.");
    } catch (error: unknown) {
      setFormData((prev) => ({ ...prev, [field]: previousValue }));
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Fallo crítico en el pipeline de storage multimedia.";
      setFieldErrors((prev) => ({ ...prev, image: errorMessage }));
      toast.error("No se pudo subir la imagen", {
        description: errorMessage,
      });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleReset = useCallback(() => {
    if (!initialData) return;
    setFormData({
      nombre: initialData?.nombre || "",
      slug: initialData?.slug || "",
      whatsapp: initialData?.whatsapp || "",
      direccion: initialData?.direccion || "",
      localidad: initialData?.localidad || "",
      direccion_notas: initialData?.direccion_notas || "",
      color_primary: initialData?.color_primary || "#34a35f",
      logo_url: initialData?.logo_url || "",
      logo_scale: initialData?.logo_scale ?? 1,
      logo_posicion: initialData?.logo_posicion || "center",
      logo_fit: initialData?.logo_fit || "contain",
      logo_shape: initialData?.logo_shape || "circle",
      banner_url: initialData?.banner_url || "",
      banner_posicion: initialData?.banner_posicion || "center",
      banner_height: initialData?.banner_height || "normal",
      banner_scale: initialData?.banner_scale ?? 1,
      mostrar_nombre: initialData?.mostrar_nombre ?? true,
      instagram_url: initialData?.instagram_url || "",
      facebook_url: initialData?.facebook_url || "",
      tiktok_url: initialData?.tiktok_url || "",
      horarios: initialData?.horarios || {},
      direcciones: initialData?.direcciones || [],
    });
    setImagePreviews({
      logo_url: initialData?.logo_url || "",
      banner_url: initialData?.banner_url || "",
    });
    setIsDirty(false);
  }, [initialData]);

  const {
    showModal: showUnsavedModal,
    confirmLeave: saveAndLeave,
    cancelLeave: stayOnPage,
    discardAndReset: discardChanges,
  } = useUnsavedChanges(isDirty, handleReset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) {
      return toast.error("Error estructural: Falta el ID del tenant.");
    }
    if (uploading) {
      return toast.error(
        "Espera a que termine la carga de la imagen antes de guardar.",
      );
    }

    if (!validate()) {
      setSaveStatus("error");
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
      return toast.error("Corregí los errores marcados en el formulario.", {
        duration: 3000,
      });
    }

    setSaveStatus("saving");
    try {
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
        logo_scale: formData.logo_scale,
        logo_posicion: formData.logo_posicion,
        logo_fit: formData.logo_fit,
        logo_shape: formData.logo_shape,
        banner_url: formData.banner_url,
        banner_posicion: formData.banner_posicion,
        banner_height: formData.banner_height,
        banner_scale: formData.banner_scale,
        mostrar_nombre: formData.mostrar_nombre,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        tiktok_url: formData.tiktok_url,
        horarios: formData.horarios as Record<string, unknown>,
        direcciones: formData.direcciones,
      };

      const res = await updateTenantBrandingAction(payload);

      setFormData((prev) => ({ ...prev, slug: res.slugSaneado }));
      setSaveStatus("success");
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);

      toast.success("Ajustes consolidados con éxito", {
        icon: <CheckCircle2 className="text-[var(--admin-accent)]" />,
      });

      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error de red.";
      setSaveStatus("error");
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
      toast.error(errorMsg);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!initialData?.id) return;
    if (isDeleting) return;
    if (confirmName !== initialData.nombre) {
      return toast.error(
        "El nombre ingresado no coincide con el registro original.",
      );
    }

    setIsDeleting(true);
    try {
      await deleteTenantBrandingAction(initialData.id);
      toast.success("Estructura comercial purgada por completo del SaaS.");
      window.location.href = "/login";
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Fallo en borrado.";
      toast.error(errorMsg);
      setIsDeleting(false);
    }
  };

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ConfigFormState | "image", string>>>({});

  const clearFieldError = (field: keyof ConfigFormState) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = useCallback((): boolean => {
    const errors: Partial<Record<keyof ConfigFormState, string>> = {};

    if (!formData.nombre.trim()) errors.nombre = "El nombre del negocio es obligatorio.";
    if (!formData.slug.trim()) errors.slug = "La URL del menú (slug) es obligatoria.";
    else if (formData.slug.length < 3) errors.slug = "El slug debe tener al menos 3 caracteres.";
    if (!formData.whatsapp.trim()) errors.whatsapp = "El WhatsApp es obligatorio para recibir pedidos.";
    if (!formData.direccion.trim()) errors.direccion = "La dirección es obligatoria.";

    const hex = /^#[0-9a-fA-F]{6}$/;
    if (!hex.test(formData.color_primary)) {
      errors.color_primary = "Formato hexadecimal inválido (ej: #34a35f)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 select-none">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ALERTA CRÍTICA: MUTACIÓN DE URL */}
        {hasSlugChanged && (
          <div className="admin-warning-bg admin-warning-border p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="h-5 w-5 shrink-0 admin-warning-text mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block mb-0.5 text-sm admin-warning-text">
                Advertencia: Modificación de la ruta estática (Slug)
              </span>
              La URL histórica{" "}
              <span className="font-mono bg-[var(--admin-bg)] px-1 py-0.5 rounded border border-[var(--admin-border)]">
                /{initialData?.slug}
              </span>{" "}
              dejará de operar de inmediato. Tu catálogo web se relocalizará en:{" "}
              <span className="font-mono bg-[var(--admin-bg)] px-1 py-0.5 rounded border border-[var(--admin-border)]">
                /{formData.slug}
              </span>
              .
            </div>
          </div>
        )}

        {/* BLOQUE MULTIMEDIA (BRANDING) */}
        <BrandingBlock
          logoUrl={imagePreviews.logo_url || formData.logo_url}
          bannerUrl={imagePreviews.banner_url || formData.banner_url}
          bannerPosicion={formData.banner_posicion}
          bannerHeight={formData.banner_height}
          bannerScale={formData.banner_scale}
          logoScale={formData.logo_scale}
          logoPosicion={formData.logo_posicion}
          logoFit={formData.logo_fit}
          logoShape={formData.logo_shape}
          uploading={uploading}
          imageError={fieldErrors.image}
          onImageUpload={handleImageUpload}
          onLogoScaleChange={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, logo_scale: val }));
          }}
          onLogoPosicionChange={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, logo_posicion: val }));
          }}
          onLogoFitChange={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, logo_fit: val }));
          }}
          onLogoShapeChange={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, logo_shape: val }));
          }}
          onBannerPosicionChange={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, banner_posicion: val }));
          }}
          onBannerScaleChange={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, banner_scale: val }));
          }}
        />

        {/* BLOQUE INFORMACIÓN GENERAL */}
        <GeneralInfoBlock
          formData={formData}
          errors={fieldErrors}
          onChange={handleChange}
          onClearError={clearFieldError}
          onToggleMostrarNombre={(val) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, mostrar_nombre: val }));
          }}
        />

        {/* BLOQUE SUCURSALES */}
        <DireccionesBlock
          direcciones={formData.direcciones}
          onChange={(direcciones) => {
            setIsDirty(true);
            setFormData((p) => ({ ...p, direcciones }));
          }}
        />

        {/* BLOQUE MIXTO COMPACTO RESPONSIVE: REDES + CROMÁTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SocialLinksBlock formData={formData} onChange={handleChange} />
          </div>
          <div className="lg:col-span-5">
            <CatalogDesignBlock
              colorPrimary={formData.color_primary}
              error={fieldErrors.color_primary}
              onChange={(val) => {
                setIsDirty(true);
                clearFieldError("color_primary");
                setFormData((p) => ({ ...p, color_primary: val }));
              }}
              bannerUrl={imagePreviews.banner_url || formData.banner_url}
              bannerScale={formData.banner_scale}
              logoUrl={imagePreviews.logo_url || formData.logo_url}
              mostrarNombre={formData.mostrar_nombre}
              nombreForm={formData.nombre}
              logoScale={formData.logo_scale}
              logoPosicion={formData.logo_posicion}
              logoFit={formData.logo_fit}
              logoShape={formData.logo_shape}
              bannerPosicion={formData.banner_posicion}
              bannerHeight={formData.banner_height}
            />
          </div>
        </div>

        {/* BLOQUE CORE: CONTROL HORARIO */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4">
            <div className="p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-muted)]">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text)]">
                Cronograma Operativo Semanal
              </h3>
              <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
                Campamento e itinerario granular de persianas digitales.
              </p>
            </div>
          </div>
          <ScheduleBlock
            schedule={formData.horarios}
            onChange={(newSchedule) => {
              setIsDirty(true);
              setFormData((p) => ({ ...p, horarios: newSchedule }));
            }}
          />
        </div>

        {/* BOTÓN FLOTANTE ACCIONABLE ULTRA-LIMPIO */}
        <div className="sticky bottom-20 md:bottom-5 z-40 flex justify-end">
          <button
            type="submit"
            disabled={saveStatus !== "idle" || isDeleting || !!uploading}
            className={`px-6 py-2.5 rounded-lg text-xs font-medium shadow-md flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 ${
              saveStatus === "success"
                ? "bg-emerald-500 text-white scale-105"
                : saveStatus === "error"
                  ? "admin-danger-bg text-white animate-[shake_0.4s_ease-in-out]"
                  : "bg-[var(--admin-accent)] text-white hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            {saveStatus === "saving" ? (
              <FoodMini size={14} />
            ) : saveStatus === "success" ? (
              <CheckCircle2
                className="animate-in zoom-in-50 duration-200"
                size={14}
              />
            ) : saveStatus === "error" ? (
              <XCircle
                className="animate-in zoom-in-50 duration-200"
                size={14}
              />
            ) : (
              <Save size={14} />
            )}
            <span>
              {saveStatus === "saving"
                ? "Guardando ajustes..."
                : saveStatus === "success"
                  ? "¡Guardado!"
                  : saveStatus === "error"
                    ? "Error al guardar"
                    : "Guardar Cambios"}
            </span>
          </button>
        </div>
      </form>

      <UnsavedChangesModal
        open={showUnsavedModal}
        onConfirm={saveAndLeave}
        onCancel={stayOnPage}
        onDiscard={discardChanges}
      />

      {/* ZONA DE PELIGRO (DANGER ZONE) */}
      {initialData && (
        <div className="bg-[var(--admin-surface)] border border-red-500/30 rounded-xl overflow-hidden shadow-sm mt-12 animate-in fade-in duration-300">
          <div className="px-5 py-3.5 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2.5">
            <Trash2 size={16} className="text-red-500" />
            <div>
              <h2 className="font-semibold text-xs text-red-500">
                Zona de Peligro Comercial
              </h2>
              <p className="text-[10px] text-[var(--admin-text-muted)]">
                Acciones irreversibles de desinstalación de infraestructura
                SaaS.
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex gap-3 text-xs items-start bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertTriangle className="text-red-500 shrink-0 w-4 h-4 mt-0.5" />
              <p className="text-[var(--admin-text)] text-[11px] leading-relaxed">
                Al confirmar la baja, tu catálogo público se cerrará de
                inmediato. Se purgarán de forma definitiva todos tus{" "}
                <strong className="text-red-500">
                  productos, menús, categorías, historiales de comandas y
                  accesos de administración
                </strong>
                . Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="space-y-2 max-w-md">
              <label className="text-[11px] font-medium text-[var(--admin-text-muted)] block">
                Para confirmar, escribe{" "}
                <span className="font-semibold select-all font-mono text-[var(--admin-text)] bg-[var(--admin-bg)] border border-[var(--admin-border)] px-1 py-0.5 rounded text-xs">
                  {initialData.nombre}
                </span>{" "}
                abajo:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  disabled={saveStatus !== "idle" || isDeleting}
                  placeholder="Nombre del negocio exacto"
                  className="flex-1 p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={handleDeleteBusiness}
                  disabled={
                    confirmName !== initialData.nombre ||
                    saveStatus !== "idle" ||
                    isDeleting
                  }
                  className="bg-red-500 hover:bg-red-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 shrink-0"
                >
                   {isDeleting ? <FoodMini size={12} /> : <Trash2 size={13} />}
                  <span>Destruir Negocio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandingBlock({
  logoUrl,
  bannerUrl,
  bannerPosicion,
  bannerHeight,
  bannerScale,
  logoScale,
  logoPosicion,
  logoFit,
  logoShape,
  uploading,
  imageError,
  onImageUpload,
  onLogoScaleChange,
  onLogoPosicionChange,
  onLogoFitChange,
  onLogoShapeChange,
  onBannerPosicionChange,
  onBannerScaleChange,
}: {
  logoUrl: string;
  bannerUrl: string;
  bannerPosicion: string;
  bannerHeight: string;
  bannerScale: number;
  logoScale: number;
  logoPosicion: string;
  logoFit: string;
  logoShape: string;
  uploading: string | null;
  imageError?: string;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => void;
  onLogoScaleChange: (val: number) => void;
  onLogoPosicionChange: (val: string) => void;
  onLogoFitChange: (val: string) => void;
  onLogoShapeChange: (val: string) => void;
  onBannerPosicionChange: (val: string) => void;
  onBannerScaleChange: (val: number) => void;
}) {
  const shapeClass = (s: string) =>
    s === "circle"
      ? "rounded-full"
      : s === "rounded"
        ? "rounded-2xl"
        : "rounded-none";

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 flex items-center gap-2.5">
        <Camera size={16} className="text-[var(--admin-text-muted)]" />
        <div>
          <h2 className="font-semibold text-xs text-[var(--admin-text)]">
            Lienzo e Identidad Visual
          </h2>
          <p className="text-[10px] text-[var(--admin-text-muted)]">
            Sincronización geométrica de activos multimedia de marca.
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LOGO */}
        <div className="md:col-span-5 flex flex-col items-center border-b md:border-b-0 md:border-r border-[var(--admin-border)] pb-5 md:pb-0 md:pr-6">
          <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">
            Isotipo Comercial
          </span>

          <div className="relative group">
            <div
              className={`w-28 h-28 ${shapeClass(logoShape)} bg-[var(--admin-bg)] overflow-hidden relative flex items-center justify-center shadow-md transition-all hover:shadow-lg ring-1 ring-transparent hover:ring-[var(--admin-accent)]`}
            >
              {logoUrl ? (
                logoUrl.startsWith("blob:") ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-full w-full animate-in fade-in duration-200"
                    style={{
                      objectFit: logoFit as "contain" | "cover",
                      objectPosition: logoPosicion,
                      transform: `scale(${logoScale})`,
                    }}
                  />
                ) : (
                  <Image
                    src={logoUrl}
                    fill
                    className="animate-in fade-in duration-200"
                    style={{
                      objectFit: logoFit as "contain" | "cover",
                      objectPosition: logoPosicion,
                      transform: `scale(${logoScale})`,
                    }}
                    alt="Logo"
                    sizes="112px"
                    priority
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                  <ImageIcon size={24} />
                </div>
              )}
              {uploading === "logo_url" && (
                <div className="absolute inset-0 bg-[var(--admin-surface)]/80 backdrop-blur-sm flex items-center justify-center">
                  <FoodMini size={18} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-[var(--admin-surface)] text-[var(--admin-text)] p-2 rounded-full border border-[var(--admin-border)] shadow-sm cursor-pointer hover:border-[var(--admin-accent)] transition-all z-10">
              <Upload size={12} />
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg, image/webp, .jpg, .jpeg, .png, .webp"
                onChange={(e) => onImageUpload(e, "logo_url")}
                disabled={!!uploading}
              />
            </label>
          </div>

          {/* LOGO CONTROLS */}
          <div className="mt-4 w-full max-w-[220px] space-y-3">
            {/* Shape selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Forma del contenedor
              </span>
              <div className="flex gap-1">
                {LOGO_SHAPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoShapeChange(opt.value)}
                    className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                      logoShape === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Ajuste de imagen
              </span>
              <div className="flex gap-1">
                {LOGO_FIT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoFitChange(opt.value)}
                    className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                      logoFit === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Posición vertical
              </span>
              <div className="flex gap-1">
                {LOGO_POSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onLogoPosicionChange(opt.value)}
                    className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                      logoPosicion === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom slider */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Escala
                </span>
                <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">
                  {logoScale.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={logoScale}
                onChange={(e) => onLogoScaleChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--admin-bg)] rounded-full appearance-none cursor-pointer accent-[var(--admin-accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--admin-accent)] [&::-webkit-slider-thumb]:shadow-sm"
              />
            </div>
          </div>

          <p className="text-[9px] text-[var(--admin-text-muted)] mt-3 text-center leading-normal">
            Espacio {logoShape === "circle" ? "1:1" : "flexible"}.
            <br />
            {logoFit === "contain"
              ? "Muestra el logo completo sin recortes."
              : "Llena el contenedor. Puede recortar bordes."}
            <br />
            Máx {MAX_IMAGE_SIZE_MB}MB (JPG, PNG, WEBP).
          </p>
        </div>

        {/* BANNER */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
              Banner de Cabecera
            </span>
            <label className="text-[11px] font-medium text-[var(--admin-text)] hover:bg-[var(--admin-bg)] border border-[var(--admin-border)] px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
              <Upload size={11} /> Cargar
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg, image/webp, .jpg, .jpeg, .png, .webp"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={!!uploading}
              />
            </label>
          </div>

          <div
            className={`relative w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] overflow-hidden shadow-sm ${
              bannerHeight === "compact"
                ? "aspect-[21/6]"
                : bannerHeight === "large"
                  ? "aspect-[21/10]"
                  : "aspect-[21/8]"
            }`}
          >
            {bannerUrl ? (
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${bannerScale ?? 1})`,
                  transformOrigin: "center top",
                }}
              >
                {bannerUrl.startsWith("blob:") ? (
                  <img
                    src={bannerUrl}
                    alt="Portada"
                    className="h-full w-full object-cover animate-in fade-in duration-200"
                    style={{ objectPosition: bannerPosicion }}
                  />
                ) : (
                  <Image
                    src={bannerUrl}
                    fill
                    className="object-cover animate-in fade-in duration-200"
                    style={{ objectPosition: bannerPosicion }}
                    alt="Portada"
                    sizes="(max-width: 768px) 100vw, 650px"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)] opacity-50">
                <ImageIcon size={28} />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,var(--admin-surface)_95%)]" />
            {uploading === "banner_url" && (
              <div className="absolute inset-0 bg-[var(--admin-surface)]/80 backdrop-blur-sm flex items-center justify-center">
                <FoodMini size={22} />
              </div>
            )}
          </div>

          {/* Banner controls */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Posición vertical
              </span>
              <div className="flex gap-1">
                {BANNER_VERTICAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onBannerPosicionChange(opt.value)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                      bannerPosicion === opt.value
                        ? "bg-[var(--admin-accent)] text-white shadow-sm"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent)]/10 border border-[var(--admin-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Banner zoom slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Escala del banner
              </span>
              <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">
                {bannerScale.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={bannerScale}
              onChange={(e) => onBannerScaleChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--admin-bg)] rounded-full appearance-none cursor-pointer accent-[var(--admin-accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--admin-accent)] [&::-webkit-slider-thumb]:shadow-sm"
            />
          </div>

          {imageError && (
            <p className="text-[11px] text-red-500 flex items-center gap-1">
              <XCircle size={12} />
              {imageError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GeneralInfoBlock({
  formData,
  errors,
  onChange,
  onClearError,
  onToggleMostrarNombre,
}: {
  formData: ConfigFormState;
  errors: Partial<Record<keyof ConfigFormState, string | undefined>>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onClearError: (field: keyof ConfigFormState) => void;
  onToggleMostrarNombre: (val: boolean) => void;
}) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <Globe size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)]">
          Atributos Operacionales Nucleares
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)]">
            Nombre Comercial
          </label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={(e) => { onChange(e); onClearError("nombre"); }}
            className={`w-full p-2 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all font-medium text-xs ${
              errors.nombre ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
            }`}
            placeholder="Ej: Burger Station"
          />
          {errors.nombre && (
            <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
              <XCircle size={10} />
              {errors.nombre}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)]">
            Dirección Web Estática (Slug URL)
          </label>
          <div className="relative">
            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
            <input
              name="slug"
              value={formData.slug}
              onChange={(e) => { onChange(e); onClearError("slug"); }}
              className={`w-full p-2 pl-8 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 font-mono text-xs transition-all ${
                errors.slug ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
              }`}
              placeholder="burger-station"
            />
          </div>
          {errors.slug && (
            <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
              <XCircle size={10} />
              {errors.slug}
            </p>
          )}
          {!errors.slug && (
            <p className="text-[9px] text-[var(--admin-text-muted)] mt-1 leading-normal">
              Enlace público directo:{" "}
              <span className="font-mono">
                neo.app/<b>{formData.slug || "comercio"}</b>
              </span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            <Phone size={12} /> WhatsApp Receptor de Comandas
          </label>
          <input
            name="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => { onChange(e); onClearError("whatsapp"); }}
            type="tel"
            className={`w-full p-2 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all font-medium text-xs ${
              errors.whatsapp ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
            }`}
            placeholder="5491123456789"
          />
          {errors.whatsapp ? (
            <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
              <XCircle size={10} />
              {errors.whatsapp}
            </p>
          ) : (
            <p className="text-[9px] text-[var(--admin-text-muted)] leading-tight">
              Prefijo de país completo, sin espacios ni símbolos intermedios.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)]">
            Localidad / Zona Administrativa
          </label>
          <input
            name="localidad"
            value={formData.localidad}
            onChange={onChange}
            className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all font-medium text-xs"
            placeholder="Ej: San Miguel de Tucumán"
          />
        </div>

        {/* Direcciones field removed — ahora se gestiona desde DireccionesBlock */}

        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.mostrar_nombre}
              onChange={(e) => onToggleMostrarNombre(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[var(--admin-text-muted)]/20 rounded-full peer peer-checked:bg-[var(--admin-accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all border border-[var(--admin-border)]" />
          </label>
          <div>
            <span className="text-xs font-semibold text-[var(--admin-text)]">
              Mostrar nombre del negocio
            </span>
            <p className="text-[10px] text-[var(--admin-text-muted)]">
              Desactivá si tu logo ya incluye el nombre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLinksBlock({
  formData,
  onChange,
}: {
  formData: { instagram_url: string; facebook_url: string; tiktok_url: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
          <Share2 size={14} className="text-[var(--admin-text-muted)]" />
          <h2 className="text-xs font-semibold text-[var(--admin-text)]">
            Enlaces Digitales del Menú Público
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] block">
              Instagram Link
            </label>
            <input
              name="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={onChange}
              placeholder="https://instagram.com/tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] block">
              Facebook Perfil
            </label>
            <input
              name="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={onChange}
              placeholder="https://facebook.com/tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-[var(--admin-text-muted)] block">
              TikTok Canal
            </label>
            <input
              name="tiktok_url"
              type="url"
              value={formData.tiktok_url}
              onChange={onChange}
              placeholder="https://tiktok.com/@tu_marca"
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          Es obligatorio el uso de <code>https://</code> para asegurar el
          redireccionamiento nativo correcto.
        </p>
      </div>
    </div>
  );
}

function CatalogDesignBlock({
  colorPrimary,
  error,
  onChange,
  bannerUrl,
  bannerPosicion,
  bannerHeight,
  bannerScale,
  logoUrl,
  logoPosicion,
  logoFit,
  logoShape,
  mostrarNombre,
  nombreForm,
  logoScale,
}: {
  colorPrimary: string;
  error?: string;
  onChange: (val: string) => void;
  bannerUrl?: string | null;
  bannerPosicion?: string;
  bannerHeight?: string;
  bannerScale?: number;
  logoUrl?: string | null;
  logoPosicion?: string;
  logoFit?: string;
  logoShape?: string;
  mostrarNombre?: boolean;
  nombreForm?: string;
  logoScale?: number;
}) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
          <Palette size={14} className="text-[var(--admin-text-muted)]" />
          <h2 className="text-xs font-semibold text-[var(--admin-text)]">
            Color de Acento del Catálogo
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg border border-[var(--admin-border)] overflow-hidden relative cursor-pointer shadow-sm"
              style={{ backgroundColor: colorPrimary }}
            >
              <input
                type="color"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </div>
            <div className="flex-1 space-y-0.5">
              <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
                Hexadecimal
              </span>
              <input
                type="text"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className={`w-20 p-1 bg-[var(--admin-bg)] border rounded-md font-mono text-[11px] uppercase text-[var(--admin-text)] focus:outline-none focus:ring-1 ${
                  error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                }`}
                maxLength={7}
              />
              {error && (
                <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                  <XCircle size={10} />
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
              Paletas de Colores
            </span>
            {COLOR_PALETTES.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[10px] font-medium text-[var(--admin-text-muted)]/70 block">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onChange(color)}
                      className={`w-5 h-5 rounded-md border transition-all ${
                        colorPrimary.toLowerCase() === color.toLowerCase()
                          ? "border-[var(--admin-text)] scale-110 ring-2 ring-[var(--admin-border)] shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Vista previa eliminada — los cambios se ven en vivo en BrandingBlock */}
        </div>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          La paleta se genera automáticamente y se inyecta como variables CSS{" "}
          <code>--color-custom-*</code> en el catálogo público.
        </p>
      </div>
    </div>
  );
}

function ScheduleBlock({
  schedule = {},
  onChange,
}: {
  schedule: ScheduleData;
  onChange: (s: ScheduleData) => void;
}) {
  const getTurnos = (dayId: string) => schedule[dayId]?.turnos || [];

  const updateDay = (day: string, active: boolean) => {
    const updated = { ...schedule };
    if (active) updated[day] = { turnos: [{ inicio: "12:00", fin: "16:00" }] };
    else delete updated[day];
    onChange(updated);
  };

  const addFranja = (day: string) => {
    const turnos = getTurnos(day);
    if (turnos.length >= 2) {
      return toast.error("Capacidad operacional máxima: 2 turnos por jornada.");
    }
    const updated = {
      ...schedule,
      [day]: { turnos: [...turnos, { inicio: "20:00", fin: "00:00" }] },
    };
    onChange(updated);
  };

  const removeFranja = (day: string, index: number) => {
    const turnos = getTurnos(day).filter((_, i) => i !== index);
    const updated = { ...schedule };
    if (turnos.length === 0) delete updated[day];
    else updated[day] = { turnos };
    onChange(updated);
  };

  const updateTime = (
    day: string,
    index: number,
    field: keyof FranjaHoraria,
    value: string,
  ) => {
    const turnos = [...getTurnos(day)];
    turnos[index] = { ...turnos[index], [field]: value };
    onChange({ ...schedule, [day]: { turnos } });
  };

  const cloneToAll = (dayId: string) => {
    const source = getTurnos(dayId);
    if (!source.length) {
      return toast.error("Debe existir una celda origen para replicar.");
    }
    const newSchedule: ScheduleData = {};
    DIAS.forEach((d) => {
      newSchedule[d.id] = { turnos: source.map((t) => ({ ...t })) };
    });
    onChange(newSchedule);
    toast.success("Esquema propagado a la matriz semanal.");
  };

  return (
    <div className="border border-[var(--admin-border)] rounded-lg overflow-hidden text-xs">
      <div className="divide-y divide-[var(--admin-border)]">
        {DIAS.map((dia) => {
          const turnos = getTurnos(dia.id);
          const isOpen = turnos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row md:items-center transition-colors ${
                isOpen ? "bg-[var(--admin-surface)]" : "bg-[var(--admin-bg)]/50"
              }`}
            >
              <div className="w-full md:w-36 px-4 py-2.5 flex items-center justify-between md:justify-start gap-4 border-b md:border-b-0 md:border-r border-[var(--admin-border)] shrink-0">
                <span
                  className={`font-medium ${
                    isOpen
                      ? "text-[var(--admin-text)]"
                      : "text-[var(--admin-text-muted)] opacity-70"
                  }`}
                >
                  {dia.label}
                </span>
                <button
                  type="button"
                  onClick={() => updateDay(dia.id, !isOpen)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 outline-none ${
                    isOpen
                      ? "bg-[var(--admin-accent)]"
                      : "bg-[var(--admin-border)]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-150 ${
                      isOpen ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 px-4 py-1.5 flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 min-h-[44px]">
                {isOpen ? (
                  <div className="flex flex-wrap gap-2">
                    {turnos.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-md p-1 animate-in zoom-in-95 duration-100"
                      >
                        <input
                          type="time"
                          value={t.inicio}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "inicio", e.target.value)
                          }
                          className="bg-transparent text-xs font-medium outline-none text-[var(--admin-text)] p-0.5 cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-[var(--admin-text-muted)]">
                          A
                        </span>
                        <input
                          type="time"
                          value={t.fin}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "fin", e.target.value)
                          }
                          className="bg-transparent text-xs font-medium outline-none text-[var(--admin-text)] p-0.5 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => removeFranja(dia.id, idx)}
                          className="text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 p-1 rounded-md transition-colors"
                          title="Remover franja"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-normal text-[var(--admin-text-muted)] opacity-70 italic">
                    Cerrado (Sin operaciones)
                  </span>
                )}
              </div>

              <div className="px-4 py-1.5 flex items-center justify-end gap-1.5 shrink-0 md:w-[150px] border-t md:border-t-0 md:border-l border-[var(--admin-border)]">
                {isOpen && (
                  <>
                    {turnos.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addFranja(dia.id)}
                        className="p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-md transition-colors flex items-center gap-0.5 font-medium text-[10px]"
                      >
                        <Plus size={11} /> Turno
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cloneToAll(dia.id)}
                      className="p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-md transition-colors flex items-center gap-1 font-medium text-[10px]"
                      title="Propagar este esquema semanalmente"
                    >
                      <Copy size={10} /> Semanal
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DireccionesBlock({
  direcciones,
  onChange,
}: {
  direcciones: DireccionFisica[];
  onChange: (d: DireccionFisica[]) => void;
}) {
  const agregar = () => {
    const nueva: DireccionFisica = {
      id: crypto.randomUUID(),
      nombre: "",
      direccion: "",
      localidad: "",
      es_principal: direcciones.length === 0,
    };
    onChange([...direcciones, nueva]);
  };

  const eliminar = (id: string) => {
    onChange(direcciones.filter((d) => d.id !== id));
  };

  const actualizar = (id: string, field: Partial<DireccionFisica>) => {
    onChange(
      direcciones.map((d) => (d.id === id ? { ...d, ...field } : d)),
    );
  };

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[var(--admin-text-muted)]" />
          <h2 className="text-xs font-semibold text-[var(--admin-text)]">
            Sucursales / Direcciones
          </h2>
        </div>
        <button
          type="button"
          onClick={agregar}
          className="text-xs font-semibold flex items-center gap-1 text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 px-2.5 py-1.5 rounded-md transition-colors"
        >
          <Plus size={13} /> Agregar sucursal
        </button>
      </div>

      {direcciones.length === 0 ? (
        <p className="text-xs text-[var(--admin-text-muted)] italic py-2">
          No hay sucursales registradas. Agregá al menos una dirección para tu negocio.
        </p>
      ) : (
        <div className="space-y-3">
          {direcciones.map((dir) => (
            <div
              key={dir.id}
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-3"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <input
                  type="text"
                  value={dir.nombre}
                  onChange={(e) => actualizar(dir.id, { nombre: e.target.value })}
                  placeholder="Nombre (Ej: Local Centro)"
                  className="w-full p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-xs font-medium text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                />
                <input
                  type="text"
                  value={dir.direccion}
                  onChange={(e) => actualizar(dir.id, { direccion: e.target.value })}
                  placeholder="Dirección"
                  className="w-full p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-xs text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                />
                <input
                  type="text"
                  value={dir.localidad}
                  onChange={(e) => actualizar(dir.id, { localidad: e.target.value })}
                  placeholder="Localidad"
                  className="w-full p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-xs text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {dir.es_principal && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => eliminar(dir.id)}
                  className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Eliminar sucursal"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
