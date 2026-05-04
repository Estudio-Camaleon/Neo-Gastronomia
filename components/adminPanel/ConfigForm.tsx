"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Palette,
  Globe,
  Save,
  Loader2,
  Hash,
  Smartphone,
  MapPin,
} from "lucide-react";
import { ScheduleEditor } from "./ScheduleEditor";

interface ConfigFormProps {
  initialData: any;
  userId: string;
}

export function ConfigForm({ initialData, userId }: ConfigFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Estado sincronizado EXACTAMENTE con las columnas de tu tabla public.negocios
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "",
    whatsapp: initialData?.whatsapp || "",
    direccion: initialData?.direccion || "", // Columna 'direccion' de tu SQL
    color_primario: initialData?.color_primario || "#000000",
    logo_url: initialData?.logo_url || "",
    horarios: initialData?.horarios || {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const { error } = await supabase
        .from("negocios")
        .update({
          nombre: formData.nombre,
          slug: formData.slug, // El trigger 'trigger_clean_slug' se encarga de limpiarlo
          whatsapp: formData.whatsapp,
          direccion: formData.direccion,
          color_primario: formData.color_primario,
          logo_url: formData.logo_url,
          horarios: formData.horarios,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("DATOS SINCRONIZADOS", {
        description:
          "La configuración de tu negocio ha sido actualizada en la base de datos.",
      });

      router.refresh();
    } catch (error: any) {
      toast.error("ERROR DE ACTUALIZACIÓN", {
        description:
          error.message || "No se pudo conectar con la tabla negocios.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 animate-in fade-in duration-700"
    >
      {/* SECCIÓN 1: IDENTIDAD (Nombre y Slug) */}
      <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="text-primary w-5 h-5" />
          <h2 className="font-black uppercase italic tracking-tight text-lg">
            Identidad Corporativa
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Nombre del Local
            </label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full bg-bg-main dark:bg-bg-dark p-4 rounded-neo border-2 border-border focus:border-primary outline-none font-bold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Slug único (URL)
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border focus:border-primary outline-none font-black italic"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              WhatsApp de Contacto
            </label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border focus:border-primary outline-none font-bold"
                placeholder="54381..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Dirección Física
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full bg-bg-main dark:bg-bg-dark p-4 pl-10 rounded-neo border-2 border-border focus:border-primary outline-none font-bold"
                placeholder="Calle, Número, Ciudad"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: OPERACIÓN (Horarios JSONB) */}
      <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 shadow-sm">
        <ScheduleEditor
          schedule={formData.horarios}
          onChange={(newSchedule) =>
            setFormData((prev) => ({ ...prev, horarios: newSchedule }))
          }
        />
      </section>

      {/* SECCIÓN 3: ESTÉTICA (Color Primario) */}
      <section className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-8 space-y-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Palette className="text-primary w-5 h-5" />
          <h2 className="font-black uppercase italic tracking-tight text-lg">
            Personalización
          </h2>
        </div>

        <div className="flex flex-col items-start gap-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Color de Marca (Botones y Acentos)
          </label>
          <div className="flex items-center gap-6">
            <input
              type="color"
              name="color_primario"
              value={formData.color_primario}
              onChange={handleChange}
              className="w-20 h-20 rounded-full border-4 border-white shadow-xl cursor-pointer"
            />
            <div className="space-y-1">
              <span className="font-mono text-xs font-black uppercase bg-bg-main px-4 py-2 rounded-neo border border-border">
                {formData.color_primario}
              </span>
              <p className="text-[9px] font-bold text-text-muted uppercase italic mt-2">
                Este color definirá la identidad de tu catálogo público.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTÓN DE GUARDADO */}
      <div className="sticky bottom-10 z-50 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex items-center gap-3 bg-primary text-white px-14 py-6 rounded-full shadow-2xl shadow-primary/30 font-black uppercase tracking-[0.3em] border-4 border-white hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={24} />
          )}
          <span>{isPending ? "GUARDANDO..." : "ACTUALIZAR NEO"}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
      </div>
    </form>
  );
}
