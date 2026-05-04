"use client";

import { useState, useTransition } from "react";
import { actualizarNegocio } from "@/app/actions/negocios";
import { toast } from "sonner";
import { Save, Loader2, Globe, MessageCircle, MapPin } from "lucide-react";

interface ConfigFormProps {
  negocio: any;
}

export default function ConfigForm({ negocio }: ConfigFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      nombre: formData.get("nombre"),
      slug: formData.get("slug"),
      telefono: formData.get("telefono"),
      direccion: formData.get("direccion"),
      configuracion: negocio.configuracion, // Mantenemos el JSON actual por ahora
    };

    // Usamos startTransition para que la UI sepa que hay una acción de servidor en curso
    startTransition(async () => {
      const res = await actualizarNegocio(negocio.id, data);

      if (res.success) {
        toast.success("¡Configuración actualizada con éxito! 🚀");
      } else {
        toast.error(`Error: ${res.error}`);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Negocio */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 flex items-center gap-2">
            <Globe size={14} className="text-primary" /> Nombre Público
          </label>
          <input
            name="nombre"
            defaultValue={negocio.nombre}
            className="w-full p-4 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-neo outline-none focus:border-primary transition-all font-black uppercase italic"
            placeholder="Ej: NEO BURGER"
          />
        </div>

        {/* URL / Slug */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 flex items-center gap-2">
            URL del Menú (Slug)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-xs">
              neo.app/
            </span>
            <input
              name="slug"
              defaultValue={negocio.slug}
              className="w-full p-4 pl-20 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-neo outline-none focus:border-primary transition-all font-bold lowercase"
              placeholder="tu-negocio"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 flex items-center gap-2">
            <MessageCircle size={14} className="text-green-500" /> WhatsApp de
            Pedidos
          </label>
          <input
            name="telefono"
            defaultValue={negocio.telefono_whatsapp}
            className="w-full p-4 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-neo outline-none focus:border-primary transition-all font-bold"
            placeholder="3816XXXXXX"
          />
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 flex items-center gap-2">
            <MapPin size={14} className="text-error" /> Dirección Física
          </label>
          <input
            name="direccion"
            defaultValue={negocio.direccion}
            className="w-full p-4 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-neo outline-none focus:border-primary transition-all font-bold"
            placeholder="Av. Alem 123, Tucumán"
          />
        </div>
      </div>

      {/* Botón de Guardado */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          {isPending ? "Sincronizando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
