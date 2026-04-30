"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

export function ConfigForm({
  initialData,
}: {
  initialData: { nombre: string; whatsapp: string } | null;
}) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const { error } = await supabase
        .from("negocios")
        .update({ nombre, whatsapp })
        .eq("user_id", user.id);

      if (error) throw error;

      // Un feedback más moderno que un alert si prefieres,
      // pero mantengo la lógica por ahora
      alert("¡Configuración guardada con éxito!");
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al actualizar los datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* SECCIÓN: APARIENCIA (Aquí implementamos el switch) */}
      <div className="bg-surface dark:bg-surface-dark p-8 rounded-[2rem] border border-border dark:border-border-dark shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-text-primary dark:text-text-inverse">
              Apariencia del Panel
            </h3>
            <p className="text-sm text-text-secondary">
              Personaliza cómo ves tu herramienta de gestión.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-bg-main dark:bg-bg-darker p-2 rounded-2xl border border-border dark:border-border-dark">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">
              Modo Visual
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* SECCIÓN: DATOS DEL NEGOCIO */}
      <form
        onSubmit={handleSave}
        className="bg-surface dark:bg-surface-dark p-8 rounded-[2rem] border border-border dark:border-border-dark shadow-sm space-y-6"
      >
        <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
          <h3 className="text-lg font-black text-text-primary dark:text-text-inverse">
            Datos del Negocio
          </h3>
          <p className="text-sm text-text-secondary">
            Información básica que verán tus clientes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">
              Nombre Comercial
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-4 bg-bg-main dark:bg-bg-darker border border-border dark:border-border-dark rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-primary dark:text-text-inverse font-medium"
              placeholder="Ej: Mi Cafetería Premium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">
              WhatsApp de Pedidos
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">
                +
              </span>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="549381..."
                className="w-full p-4 pl-8 bg-bg-main dark:bg-bg-darker border border-border dark:border-border-dark rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-primary dark:text-text-inverse font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="group relative bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
