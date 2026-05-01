"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { toast } from "sonner"; // Usamos sonner para un feedback premium

// Días de la semana para el mapeo
const DIAS = [
  { id: "1", label: "Lunes" },
  { id: "2", label: "Martes" },
  { id: "3", label: "Miércoles" },
  { id: "4", label: "Jueves" },
  { id: "5", label: "Viernes" },
  { id: "6", label: "Sábado" },
  { id: "0", label: "Domingo" },
];

export function ConfigForm({
  initialData,
}: {
  initialData: { nombre: string; whatsapp: string; horarios: any } | null;
}) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  // Estado para los horarios
  const [horarios, setHorarios] = useState(initialData?.horarios || {});
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleHorarioChange = (dia: string, campo: string, valor: any) => {
    setHorarios((prev: any) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor,
      },
    }));
  };

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
        .update({
          nombre,
          whatsapp,
          horarios, // Guardamos el JSON de horarios actualizado
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("¡Configuración guardada con éxito!");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema al actualizar los datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      {/* SECCIÓN: APARIENCIA */}
      <div className="bg-surface dark:bg-surface-dark p-8 rounded-[2rem] border border-border dark:border-border-dark shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-text-primary dark:text-text-inverse">
              Apariencia del Panel
            </h3>
            <p className="text-sm text-text-secondary">
              Personaliza tu herramienta de gestión.
            </p>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECCIÓN: DATOS DEL NEGOCIO */}
        <div className="bg-surface dark:bg-surface-dark p-8 rounded-[2rem] border border-border dark:border-border-dark shadow-sm space-y-6">
          <div className="border-b border-border dark:border-border-dark pb-4">
            <h3 className="text-lg font-black text-text-primary dark:text-text-inverse">
              Datos del Negocio
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-text-muted">
                Nombre Comercial
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-4 bg-bg-main dark:bg-bg-darker border border-border dark:border-border-dark rounded-2xl outline-none focus:border-primary text-text-primary dark:text-text-inverse"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-text-muted">
                WhatsApp
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-4 bg-bg-main dark:bg-bg-darker border border-border dark:border-border-dark rounded-2xl outline-none focus:border-primary text-text-primary dark:text-text-inverse"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN NUEVA: HORARIOS DE ATENCIÓN */}
        <div className="bg-surface dark:bg-surface-dark p-8 rounded-[2rem] border border-border dark:border-border-dark shadow-sm space-y-6">
          <div className="border-b border-border dark:border-border-dark pb-4">
            <h3 className="text-lg font-black text-text-primary dark:text-text-inverse">
              Horarios de Atención
            </h3>
            <p className="text-sm text-text-secondary">
              Define cuándo tu local está listo para recibir pedidos.
            </p>
          </div>

          <div className="space-y-4">
            {DIAS.map((dia) => (
              <div
                key={dia.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-bg-main dark:bg-bg-darker border border-border dark:border-border-dark"
              >
                <div className="w-24">
                  <span className="font-bold text-text-primary dark:text-text-inverse">
                    {dia.label}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!horarios[dia.id]?.cerrado_todo_dia}
                      onChange={(e) =>
                        handleHorarioChange(
                          dia.id,
                          "cerrado_todo_dia",
                          !e.target.checked,
                        )
                      }
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-xs font-black uppercase text-text-muted">
                      Abierto
                    </span>
                  </label>

                  <div
                    className={`flex items-center gap-2 transition-opacity ${horarios[dia.id]?.cerrado_todo_dia ? "opacity-20 pointer-events-none" : "opacity-100"}`}
                  >
                    <input
                      type="time"
                      value={horarios[dia.id]?.abierto || "09:00"}
                      onChange={(e) =>
                        handleHorarioChange(dia.id, "abierto", e.target.value)
                      }
                      className="bg-surface dark:bg-bg-dark border border-border dark:border-border-dark p-2 rounded-lg text-sm font-bold"
                    />
                    <span className="text-text-muted font-bold">a</span>
                    <input
                      type="time"
                      value={horarios[dia.id]?.cerrado || "23:00"}
                      onChange={(e) =>
                        handleHorarioChange(dia.id, "cerrado", e.target.value)
                      }
                      className="bg-surface dark:bg-bg-dark border border-border dark:border-border-dark p-2 rounded-lg text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-12 py-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar toda la configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
