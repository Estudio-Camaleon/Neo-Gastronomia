"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  CheckCircle2,
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
import {
  updateTenantBrandingAction,
  deleteTenantBrandingAction,
} from "../actions";
import type { UpdateTenantBrandingPayload } from "@/core/types/domain";

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

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

const PRESET_COLORS = [
  "#34a35f",
  "#0f172a",
  "#dc2626",
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#000000",
];

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
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
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
    banner_url: initialData?.banner_url || "",
    instagram_url: initialData?.instagram_url || "",
    facebook_url: initialData?.facebook_url || "",
    tiktok_url: initialData?.tiktok_url || "",
    horarios: (initialData?.horarios as unknown as ScheduleData) || {},
  });

  const initialIdRef = useRef(initialData?.id);

  useEffect(() => {
    const idCambio = initialData?.id && initialData.id !== initialIdRef.current;
    if (!idCambio && initialIdRef.current) return;
    if (initialData?.id) initialIdRef.current = initialData.id;

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
      banner_url: initialData?.banner_url || "",
      instagram_url: initialData?.instagram_url || "",
      facebook_url: initialData?.facebook_url || "",
      tiktok_url: initialData?.tiktok_url || "",
      horarios: (initialData?.horarios as unknown as ScheduleData) || {},
    });
  }, [initialData?.id]);

  const hasSlugChanged =
    initialData?.slug !== undefined && initialData?.slug !== formData.slug;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "slug") {
      const sanitizedSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-_]/g, "");

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
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return toast.error(
        `El archivo excede el límite permitido de ${MAX_IMAGE_SIZE_MB}MB`,
      );
    }

    const previousValue = formData[field];
    const previousPreview = imagePreviews[field];
    if (previousPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(previousPreview);
    }
    const objectUrl = URL.createObjectURL(file);

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
      URL.revokeObjectURL(objectUrl);
      toast.success("Archivo multimedia sincronizado y protegido en Cloud.");
    } catch (error: unknown) {
      setFormData((prev) => ({ ...prev, [field]: previousValue }));
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Fallo crítico en el pipeline de storage multimedia.";
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
      [imagePreviews.logo_url, imagePreviews.banner_url].forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews.banner_url, imagePreviews.logo_url]);

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

    setIsPending(true);
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
        banner_url: formData.banner_url,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        tiktok_url: formData.tiktok_url,
        horarios: formData.horarios as Record<string, unknown>,
      };

      const res = await updateTenantBrandingAction(payload);

      setFormData((prev) => ({ ...prev, slug: res.slugSaneado }));
      toast.success("Ajustes consolidados con éxito", {
        icon: <CheckCircle2 className="text-[var(--admin-accent)]" />,
      });

      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error de red.";
      toast.error(errorMsg);
    } finally {
      setFormData((prev) => ({ ...prev, slug: formData.slug.trim() }));
      setIsPending(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!initialData?.id) return;
    if (confirmName !== initialData.nombre) {
      return toast.error(
        "El nombre ingresado no coincide con el registro original.",
      );
    }

    setIsDeleting(true);
    try {
      await deleteTenantBrandingAction(initialData.id);
      toast.success("Estructura comercial purgada por completo del SaaS.");
      router.push("/login");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Fallo en borrado.";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 select-none">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ALERTA CRÍTICA: MUTACIÓN DE URL */}
        {hasSlugChanged && (
          <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block mb-0.5 text-sm text-amber-600 dark:text-amber-400">
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
          uploading={uploading}
          onImageUpload={handleImageUpload}
        />

        {/* BLOQUE INFORMACIÓN GENERAL */}
        <GeneralInfoBlock formData={formData} onChange={handleChange} />

        {/* BLOQUE MIXTO COMPACTO RESPONSIVE: REDES + CROMÁTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SocialLinksBlock formData={formData} onChange={handleChange} />
          </div>
          <div className="lg:col-span-5">
            <CatalogDesignBlock
              colorPrimary={formData.color_primary}
              onChange={(val) =>
                setFormData((p) => ({ ...p, color_primary: val }))
              }
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
            onChange={(newSchedule) =>
              setFormData((p) => ({ ...p, horarios: newSchedule }))
            }
          />
        </div>

        {/* BOTÓN FLOTANTE ACCIONABLE ULTRA-LIMPIO */}
        <div className="sticky bottom-5 z-40 flex justify-end">
          <button
            type="submit"
            disabled={isPending || isDeleting || !!uploading}
            className="bg-[var(--admin-accent)] text-white px-6 py-2.5 rounded-lg text-xs font-medium shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}
            <span>
              {isPending ? "Guardando ajustes..." : "Guardar Cambios"}
            </span>
          </button>
        </div>
      </form>

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
                  disabled={isPending || isDeleting}
                  placeholder="Nombre del negocio exacto"
                  className="flex-1 p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={handleDeleteBusiness}
                  disabled={
                    confirmName !== initialData.nombre ||
                    isPending ||
                    isDeleting
                  }
                  className="bg-red-500 hover:bg-red-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" size={13} />
                  ) : (
                    <Trash2 size={13} />
                  )}
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
  uploading,
  onImageUpload,
}: {
  logoUrl: string;
  bannerUrl: string;
  uploading: string | null;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url",
  ) => void;
}) {
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
        <div className="md:col-span-4 flex flex-col items-center border-b md:border-b-0 md:border-r border-[var(--admin-border)] pb-5 md:pb-0 md:pr-6">
          <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">
            Isotipo Comercial
          </span>
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-[var(--admin-bg)] overflow-hidden relative flex items-center justify-center shadow-md transition-all hover:shadow-lg ring-1 ring-transparent hover:ring-[var(--admin-accent)]">
              {logoUrl ? (
                logoUrl.startsWith("blob:") ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-full w-full object-cover animate-in fade-in duration-200"
                  />
                ) : (
                  <Image
                    src={logoUrl}
                    fill
                    className="object-cover animate-in fade-in duration-200"
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
                  <Loader2
                    className="animate-spin text-[var(--admin-accent)]"
                    size={16}
                  />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-[var(--admin-surface)] text-[var(--admin-text)] p-2 rounded-full border border-[var(--admin-border)] shadow-sm cursor-pointer hover:border-[var(--admin-accent)] transition-all">
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
          <p className="text-[9px] text-[var(--admin-text-muted)] mt-3 text-center leading-normal">
            Cuadrante estricto 1:1.
            <br />
            Máx {MAX_IMAGE_SIZE_MB}MB (JPG, PNG, WEBP).
          </p>
        </div>

        <div className="md:col-span-8 flex flex-col justify-between h-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
              Banner de Cabecera
            </span>
            <label className="text-[11px] font-medium text-[var(--admin-text)] hover:bg-[var(--admin-bg)] border border-[var(--admin-border)] px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
              <Upload size={11} /> Cargar lienzo
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg, image/webp, .jpg, .jpeg, .png, .webp"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={!!uploading}
              />
            </label>
          </div>
          <div className="relative w-full aspect-[21/8] rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] overflow-hidden shadow-sm">
            {bannerUrl ? (
              bannerUrl.startsWith("blob:") ? (
                <img
                  src={bannerUrl}
                  alt="Portada"
                  className="h-full w-full object-cover animate-in fade-in duration-200"
                />
              ) : (
                <Image
                  src={bannerUrl}
                  fill
                  className="object-cover animate-in fade-in duration-200"
                  alt="Portada"
                  sizes="(max-width: 768px) 100vw, 650px"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)] opacity-50">
                <ImageIcon size={28} />
              </div>
            )}
            {uploading === "banner_url" && (
              <div className="absolute inset-0 bg-[var(--admin-surface)]/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2
                  className="animate-spin text-[var(--admin-accent)]"
                  size={20}
                />
              </div>
            )}
          </div>
          <p className="text-[9px] text-[var(--admin-text-muted)] leading-none">
            Ratio panorámico optimizado para LCP: 1200x450px.
            <br />
            Máx {MAX_IMAGE_SIZE_MB}MB (JPG, PNG, WEBP).
          </p>
        </div>
      </div>
    </div>
  );
}

function GeneralInfoBlock({
  formData,
  onChange,
}: {
  formData: ConfigFormState;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
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
            onChange={onChange}
            className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all font-medium text-xs"
            placeholder="Ej: Burger Station"
            required
          />
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
              onChange={onChange}
              className="w-full p-2 pl-8 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] font-mono text-xs transition-all"
              placeholder="burger-station"
              required
            />
          </div>
          <p className="text-[9px] text-[var(--admin-text-muted)] mt-1 leading-normal">
            Enlace público directo:{" "}
            <span className="font-mono">
              neo.app/<b>{formData.slug || "comercio"}</b>
            </span>
          </p>
        </div>

        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            <Phone size={12} /> WhatsApp Receptor de Comandas
          </label>
          <input
            name="whatsapp"
            value={formData.whatsapp}
            onChange={onChange}
            type="tel"
            className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all font-medium text-xs"
            placeholder="5491123456789"
            required
          />
          <p className="text-[9px] text-[var(--admin-text-muted)] leading-tight">
            Prefijo de país completo, sin espacios ni símbolos intermedios.
          </p>
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

        <div className="space-y-1 sm:col-span-2">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            <MapPin size={12} /> Eje Principal / Dirección Física
          </label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={onChange}
            className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all font-medium text-xs"
            placeholder="Ej: Av. Mate de Luna 1234"
            required
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="font-medium text-[var(--admin-text-muted)]">
            Aclaraciones de Despacho u Ubicación (Opcional)
          </label>
          <textarea
            name="direccion_notas"
            value={formData.direccion_notas}
            onChange={onChange}
            className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] resize-none h-14 transition-all text-xs"
            placeholder="Ej: Portón gris oscuro de doble hoja, timbre superior..."
          />
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
  onChange,
}: {
  colorPrimary: string;
  onChange: (val: string) => void;
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
                className="w-20 p-1 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-md font-mono text-[11px] uppercase text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                maxLength={7}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
              Acentos Homologados
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((color) => (
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
        </div>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info
          size={12}
          className="shrink-0 text-[var(--admin-text-muted)] mt-0.5"
        />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          Inyección directa a la variable CSS reactiva{" "}
          <code>--color-custom</code> del catálogo del cliente.
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
