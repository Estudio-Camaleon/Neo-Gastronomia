"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Palette,
  FileText,
  Settings2,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import {
  updateTenantBrandingAction,
  deleteTenantBrandingAction,
} from "../actions";
import { generateSlug } from "@/core/lib/slug";
import type { UpdateTenantBrandingPayload } from "@/core/types/domain";
import { useUnsavedChanges } from "@/core/hooks/useUnsavedChanges";
import { UnsavedChangesModal } from "@/components/ui/unsaved-changes-modal";
import type { NegocioInitialData, ConfigFormState } from "../types";
import { MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES } from "../types";
export type { NegocioInitialData }; // Re-export for backward compatibility
import { BrandingBlock } from "./ConfigForm/BrandingBlock";
import { GeneralInfoBlock } from "./ConfigForm/GeneralInfoBlock";
import { SocialLinksBlock } from "./ConfigForm/SocialLinksBlock";
import { CatalogDesignBlock } from "./ConfigForm/CatalogDesignBlock";
import { ScheduleBlock } from "./ConfigForm/ScheduleBlock";
import { DireccionesBlock } from "./ConfigForm/DireccionesBlock";
import { DangerZone } from "./ConfigForm/DangerZone";
import { WhatsAppMessagesBlock } from "./ConfigForm/WhatsAppMessagesBlock";

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

  const DEFAULT_WHATSAPP_MENSAJES: Record<string, string> = {
    en_preparacion: "¡Hola {cliente}! 👋 Soy de {negocio}. Te confirmo que recibimos tu pedido correctamente y ya entró a cocina. 🍳🔥 Te aviso por acá apenas esté listo. ¡Muchas gracias!",
    entregado: "¡Buenas noticias {cliente}! 🥳 Tu pedido de {negocio} ya está listo. {entrega} ¡Que lo disfrutes!",
    cancelado: "Hola {cliente}, te contactamos de {negocio}. Lamentablemente no vamos a poder procesar tu pedido en este momento. 🙏 Disculpá las molestias.",
  };

  const [formData, setFormData] = useState<ConfigFormState>({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    descripcion: initialData?.descripcion || "",
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
    twitter_url: initialData?.twitter_url || "",
    youtube_url: initialData?.youtube_url || "",
    horarios: initialData?.horarios || {},
    direcciones: initialData?.direcciones || [],
    whatsapp_mensajes: initialData?.whatsapp_mensajes || DEFAULT_WHATSAPP_MENSAJES,
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
      descripcion: initialData?.descripcion || "",
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
      twitter_url: initialData?.twitter_url || "",
      youtube_url: initialData?.youtube_url || "",
      horarios: initialData?.horarios || {},
      direcciones: initialData?.direcciones || [],
      whatsapp_mensajes: initialData?.whatsapp_mensajes || DEFAULT_WHATSAPP_MENSAJES,
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
      descripcion: initialData?.descripcion || "",
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
      twitter_url: initialData?.twitter_url || "",
      youtube_url: initialData?.youtube_url || "",
      horarios: initialData?.horarios || {},
      direcciones: initialData?.direcciones || [],
      whatsapp_mensajes: initialData?.whatsapp_mensajes || DEFAULT_WHATSAPP_MENSAJES,
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
      const direccionDerivada =
        formData.direcciones[0]?.direccion || "";
      const payload: UpdateTenantBrandingPayload = {
        id: initialData.id,
        nombre: formData.nombre,
        slug: formData.slug,
        whatsapp: formData.whatsapp,
        descripcion: formData.descripcion,
        direccion: direccionDerivada,
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
        twitter_url: formData.twitter_url,
        youtube_url: formData.youtube_url,
        horarios: formData.horarios as Record<string, unknown>,
        direcciones: formData.direcciones,
        whatsapp_mensajes: formData.whatsapp_mensajes,
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

  const handleDeleteBusiness = async (reason: string) => {
    if (!initialData?.id) return;
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTenantBrandingAction(initialData.id, reason);
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
    if (formData.direcciones.length === 0) {
      errors.direcciones = "Agregá al menos una sucursal con dirección.";
    }

    const hex = /^#[0-9a-fA-F]{6}$/;
    if (!hex.test(formData.color_primary)) {
      errors.color_primary = "Formato hexadecimal inválido (ej: #34a35f)";
    }

    const socialFields = ["instagram_url", "facebook_url", "tiktok_url", "twitter_url", "youtube_url"] as const;
    for (const field of socialFields) {
      const val = formData[field];
      if (val && !/^https:\/\/.+/i.test(val.trim())) {
        errors[field] = "Debe comenzar con https://";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const TABS = [
    { id: "identidad", label: "Identidad Visual", icon: Palette },
    { id: "informacion", label: "Información", icon: FileText },
    { id: "operacion", label: "Operación", icon: Settings2 },
    { id: "peligro", label: "Peligro", icon: AlertTriangle },
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("identidad");

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 select-none">
      {/* BARRA DE TABS */}
      <div className="sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-0 px-4 sm:px-6 lg:px-0 pt-0 lg:pt-0">
        <nav
          className="flex gap-1 bg-[var(--admin-bg)]/90 backdrop-blur-md border-b border-[var(--admin-border)] rounded-t-xl overflow-x-auto"
          role="tablist"
          aria-label="Secciones de configuración"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === id
                  ? "border-[var(--admin-accent)] text-[var(--admin-accent)]"
                  : "border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:border-[var(--admin-border)]"
              } ${id === "peligro" && activeTab !== "peligro" ? "opacity-40 hover:opacity-100" : ""}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ALERTA CRÍTICA: MUTACIÓN DE URL — visible en todos los tabs */}
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

        {/* ── TAB: IDENTIDAD VISUAL ── */}
        {activeTab === "identidad" && (
          <>
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
              nombre={formData.nombre}
              descripcion={formData.descripcion}
              mostrarNombre={formData.mostrar_nombre}
              colorPrimary={formData.color_primary}
              whatsapp={formData.whatsapp}
              instagram_url={formData.instagram_url}
              facebook_url={formData.facebook_url}
              tiktok_url={formData.tiktok_url}
              twitter_url={formData.twitter_url}
              youtube_url={formData.youtube_url}
              direcciones={formData.direcciones}
              localidad={formData.localidad}
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
              onBannerHeightChange={(val) => {
                setIsDirty(true);
                setFormData((p) => ({ ...p, banner_height: val }));
              }}
            />

            {/* VISTA PREVIA DEL CATÁLOGO */}
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
          </>
        )}

        {/* ── TAB: INFORMACIÓN ── */}
        {activeTab === "informacion" && (
          <>
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

            {/* BLOQUE REDES SOCIALES */}
            <SocialLinksBlock formData={formData} onChange={handleChange} />
          </>
        )}

        {/* ── TAB: OPERACIÓN ── */}
        {activeTab === "operacion" && (
          <>
            {/* BLOQUE MENSAJES WHATSAPP */}
            <WhatsAppMessagesBlock
              mensajes={formData.whatsapp_mensajes}
              negocioNombre={formData.nombre}
              onChange={(mensajes) => {
                setIsDirty(true);
                setFormData((p) => ({ ...p, whatsapp_mensajes: mensajes }));
              }}
            />

            {/* BLOQUE CORE: CONTROL HORARIO */}
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4">
                <div className="p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-muted)]">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--admin-text)] flex items-center gap-1">
                    Cronograma Operativo Semanal
                    <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
                  </h3>
                  <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
                    Horarios de atención. Si no configurás horarios, el negocio aparecerá como &ldquo;Sin horarios&rdquo;.
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
          </>
        )}

        {/* BOTÓN FLOTANTE ACCIONABLE ULTRA-LIMPIO — visible en todos los tabs excepto Peligro */}
        {activeTab !== "peligro" && (
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
        )}
      </form>

      {/* ── TAB: PELIGRO — fuera del <form> para evitar submit accidental */}
      {activeTab === "peligro" && (
        <DangerZone
          initialData={initialData}
          isDeleting={isDeleting}
          confirmName={confirmName}
          onConfirmNameChange={setConfirmName}
          onDelete={handleDeleteBusiness}
          saveStatus={saveStatus}
        />
      )}

      <UnsavedChangesModal
        open={showUnsavedModal}
        onConfirm={saveAndLeave}
        onCancel={stayOnPage}
        onDiscard={discardChanges}
      />
    </div>
  );
}


