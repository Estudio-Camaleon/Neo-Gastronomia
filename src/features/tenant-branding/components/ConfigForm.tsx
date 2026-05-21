"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  CheckCircle2,
  Settings,
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
  deleteTenantBrandingAction, // Inyección de la nueva Server Action destructiva
  type UpdateTenantBrandingPayload,
} from "../actions";

// --- INTERFACES Y CONTRATOS DE TIPOS ESTRICTOS ---
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
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("El archivo excede el límite permitido de 2MB");
    }

    setUploading(field);
    try {
      const { createClient } = await import("@/core/lib/supabase/client");
      const supabase = createClient();

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
      toast.success("Archivo multimedia sincronizado y protegido en Cloud.");
    } catch {
      toast.error("Fallo crítico en el pipeline de storage multimedia.");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) {
      return toast.error("Error estructural: Falta el ID del tenant.");
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
        icon: <CheckCircle2 className="text-zinc-950 dark:text-zinc-50" />,
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
          <div className="bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl flex items-start gap-3 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block mb-0.5 text-sm text-amber-950 dark:text-amber-100">
                Advertencia: Modificación de la ruta estática (Slug)
              </span>
              La URL histórica{" "}
              <span className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">
                /{initialData?.slug}
              </span>{" "}
              dejará de operar de inmediato. Tu catálogo web se relocalizará en:{" "}
              <span className="font-mono bg-zinc-900 text-zinc-100 px-1 py-0.5 rounded">
                /{formData.slug}
              </span>
              .
            </div>
          </div>
        )}

        {/* BLOQUE MULTIMEDIA (BRANDING) */}
        <BrandingBlock
          logoUrl={formData.logo_url}
          bannerUrl={formData.banner_url}
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
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Cronograma Operativo Semanal
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Administración granular de persianas digitales y recepción
                automatizada.
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
            disabled={isPending || isDeleting}
            className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-6 py-2.5 rounded-lg text-xs font-medium shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
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

      {/* --- NUEVO SUB-BLOQUE PREMIUM: ZONA DE PELIGRO (DANGER ZONE) --- */}
      {initialData && (
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-950/60 rounded-xl overflow-hidden shadow-2xs mt-12 animate-in fade-in duration-300">
          <div className="px-5 py-3.5 border-b border-red-100 dark:border-red-950/40 bg-red-50/30 dark:bg-red-950/10 flex items-center gap-2.5">
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
            <div>
              <h2 className="font-semibold text-xs text-red-700 dark:text-red-400">
                Zona de Peligro Comercial
              </h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Acciones irreversibles de desinstalación de infraestructura
                SaaS.
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex gap-3 text-xs items-start bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100/50 dark:border-red-950/30">
              <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 w-4 h-4 mt-0.5" />
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Al confirmar la baja, tu catálogo público se cerrará de
                inmediato. Se purgarán de forma definitiva todos tus{" "}
                <strong>
                  productos, menús, categorías, historiales de comandas y
                  accesos de administración
                </strong>
                . Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="space-y-2 max-w-md">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block">
                Para confirmar, escribe{" "}
                <span className="font-semibold select-all font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">
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
                  className="flex-1 p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleDeleteBusiness}
                  disabled={
                    confirmName !== initialData.nombre ||
                    isPending ||
                    isDeleting
                  }
                  className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-2xs transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 shrink-0"
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

// --- SUB-BLOQUE: BRANDING VISUAL ---
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
      <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center gap-2.5">
        <Camera size={16} className="text-zinc-400 dark:text-zinc-500" />
        <div>
          <h2 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
            Lienzo e Identidad Visual
          </h2>
          <p className="text-[10px] text-zinc-500">
            Sincronización geométrica de activos multimedia de marca.
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 pb-5 md:pb-0 md:pr-6">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Isotipo Comercial
          </span>
          <div className="relative group">
            <div className="w-28 h-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative transition-all group-hover:border-zinc-400 dark:group-hover:border-zinc-600 shadow-2xs">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  fill
                  className="object-contain p-1.5 animate-in fade-in duration-200"
                  alt="Logo"
                  sizes="112px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                  <ImageIcon size={24} />
                </div>
              )}
              {uploading === "logo_url" && (
                <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs flex items-center justify-center">
                  <Loader2
                    className="animate-spin text-zinc-600 dark:text-zinc-400"
                    size={16}
                  />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
              <Upload size={12} />
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => onImageUpload(e, "logo_url")}
                disabled={!!uploading}
              />
            </label>
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 text-center leading-normal">
            Cuadrante estricto 1:1.
            <br />
            Máx 2MB (PNG, WEBP).
          </p>
        </div>

        <div className="md:col-span-8 flex flex-col justify-between h-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
              Banner de Cabecera
            </span>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs">
              <Upload size={11} /> Cargar lienzo
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => onImageUpload(e, "banner_url")}
                disabled={!!uploading}
              />
            </label>
          </div>
          <div className="relative w-full aspect-[21/8] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden shadow-2xs">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                fill
                className="object-cover animate-in fade-in duration-200"
                alt="Portada"
                sizes="(max-width: 768px) 100vw, 650px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                <ImageIcon size={28} className="opacity-50" />
              </div>
            )}
            {uploading === "banner_url" && (
              <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs flex items-center justify-center">
                <Loader2
                  className="animate-spin text-zinc-600 dark:text-zinc-400"
                  size={20}
                />
              </div>
            )}
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-none">
            Ratio panorámico optimizado para LCP: 1200x450px.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- SUB-BLOQUE: INFORMACIÓN GENERAL ---
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <Globe size={14} className="text-zinc-400" />
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Atributos Operacionales Nucleares
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-medium text-zinc-500 dark:text-zinc-400">
            Nombre Comercial
          </label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-xs"
            placeholder="Ej: Burger Station"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-zinc-500 dark:text-zinc-400">
            Dirección Web Estática (Slug URL)
          </label>
          <div className="relative">
            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              name="slug"
              value={formData.slug}
              onChange={onChange}
              className="w-full p-2 pl-8 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 font-mono text-xs focus:bg-white dark:focus:bg-zinc-900 transition-all"
              placeholder="burger-station"
              required
            />
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 leading-normal">
            Enlace público directo:{" "}
            <span className="font-mono text-zinc-500 dark:text-zinc-400">
              neo.app/<b>{formData.slug || "comercio"}</b>
            </span>
          </p>
        </div>

        <div className="space-y-1">
          <label className="font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Phone size={12} className="text-zinc-400" /> WhatsApp Receptor de
            Comandas
          </label>
          <input
            name="whatsapp"
            value={formData.whatsapp}
            onChange={onChange}
            type="tel"
            className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-xs"
            placeholder="5491123456789"
            required
          />
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-tight">
            Prefijo de país completo, sin espacios ni símbolos intermedios.
          </p>
        </div>

        <div className="space-y-1">
          <label className="font-medium text-zinc-500 dark:text-zinc-400">
            Localidad / Zona Administrativa
          </label>
          <input
            name="localidad"
            value={formData.localidad}
            onChange={onChange}
            className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-xs"
            placeholder="Ej: San Miguel de Tucumán"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <MapPin size={12} className="text-zinc-400" /> Eje Principal /
            Dirección Física
          </label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={onChange}
            className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-xs"
            placeholder="Ej: Av. Mate de Luna 1234"
            required
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="font-medium text-zinc-500 dark:text-zinc-400">
            Aclaraciones de Despacho u Ubicación (Opcional)
          </label>
          <textarea
            name="direccion_notas"
            value={formData.direccion_notas}
            onChange={onChange}
            className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 resize-none h-14 focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs"
            placeholder="Ej: Portón gris oscuro de doble hoja, timbre superior..."
          />
        </div>
      </div>
    </div>
  );
}

// --- SUB-BLOQUE: CONECTIVIDAD DIGITAL (REDES) ---
function SocialLinksBlock({
  formData,
  onChange,
}: {
  formData: { instagram_url: string; facebook_url: string; tiktok_url: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs h-full flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
          <Share2 size={14} className="text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Enlaces Digitales del Menú Público
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-zinc-500 dark:text-zinc-400 block">
              Instagram Link
            </label>
            <input
              name="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={onChange}
              placeholder="https://instagram.com/tu_marca"
              className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-zinc-500 dark:text-zinc-400 block">
              Facebook Perfil
            </label>
            <input
              name="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={onChange}
              placeholder="https://facebook.com/tu_marca"
              className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-zinc-500 dark:text-zinc-400 block">
              TikTok Canal
            </label>
            <input
              name="tiktok_url"
              type="url"
              value={formData.tiktok_url}
              onChange={onChange}
              placeholder="https://tiktok.com/@tu_marca"
              className="w-full p-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60 rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info size={12} className="shrink-0 text-zinc-400 mt-0.5" />
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
          Es obligatorio el uso de <code>https://</code> para asegurar el
          redireccionamiento nativo correcto.
        </p>
      </div>
    </div>
  );
}

// --- SUB-BLOQUE: PALETA Y COLOR DE ACENTO ---
function CatalogDesignBlock({
  colorPrimary,
  onChange,
}: {
  colorPrimary: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
          <Palette size={14} className="text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Color de Acento del Catálogo
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden relative cursor-pointer shadow-3xs"
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
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Hexadecimal
              </span>
              <input
                type="text"
                value={colorPrimary}
                onChange={(e) => onChange(e.target.value)}
                className="w-20 p-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md font-mono text-[11px] uppercase text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400"
                maxLength={7}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Acentos Homologados
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange(color)}
                  className={`w-5 h-5 rounded-md border transition-all ${colorPrimary.toLowerCase() === color.toLowerCase() ? "border-zinc-950 dark:border-white scale-110 ring-2 ring-zinc-100 dark:ring-zinc-800 shadow-2xs" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60 rounded-lg p-2.5 flex gap-2 mt-4 items-start">
        <Info size={12} className="shrink-0 text-zinc-400 mt-0.5" />
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
          Inyección directa a la variable CSS reactiva{" "}
          <code>--color-custom</code> del catálogo del cliente.
        </p>
      </div>
    </div>
  );
}

// --- SUB-BLOQUE: PERSISTENCIA HORARIA PARTIDA ---
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
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {DIAS.map((dia) => {
          const turnos = getTurnos(dia.id);
          const isOpen = turnos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row md:items-center transition-colors ${isOpen ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/40 dark:bg-zinc-950/20"}`}
            >
              <div className="w-full md:w-36 px-4 py-2.5 flex items-center justify-between md:justify-start gap-4 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 shrink-0">
                <span
                  className={`font-medium ${isOpen ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"}`}
                >
                  {dia.label}
                </span>
                <button
                  type="button"
                  onClick={() => updateDay(dia.id, !isOpen)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 outline-none ${isOpen ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-zinc-950 shadow-3xs transition duration-150 ${isOpen ? "translate-x-3" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex-1 px-4 py-1.5 flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 min-h-[44px]">
                {isOpen ? (
                  turnos.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-md p-1 animate-in zoom-in-95 duration-100"
                    >
                      <input
                        type="time"
                        value={t.inicio}
                        onChange={(e) =>
                          updateTime(dia.id, idx, "inicio", e.target.value)
                        }
                        className="bg-transparent text-xs font-medium outline-none text-zinc-800 dark:text-zinc-200 p-0.5 cursor-pointer"
                      />
                      <span className="text-[9px] font-bold text-zinc-400">
                        A
                      </span>
                      <input
                        type="time"
                        value={t.fin}
                        onChange={(e) =>
                          updateTime(dia.id, idx, "fin", e.target.value)
                        }
                        className="bg-transparent text-xs font-medium outline-none text-zinc-800 dark:text-zinc-200 p-0.5 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => removeFranja(dia.id, idx)}
                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded-md transition-colors"
                        title="Remover franja"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500 italic">
                    Cerrado (Sin operaciones)
                  </span>
                )}
              </div>

              <div className="px-4 py-1.5 flex items-center justify-end gap-1.5 shrink-0 md:w-[150px] border-t md:border-t-0 border-zinc-50 dark:border-zinc-800/40">
                {isOpen && (
                  <>
                    {turnos.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addFranja(dia.id)}
                        className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-0.5 font-medium text-[10px]"
                      >
                        <Plus size={11} /> Turno
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cloneToAll(dia.id)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-1 font-medium text-[10px]"
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
