"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Asegúrate de importar el cliente de navegador

export function ConfigForm({
  initialData,
}: {
  initialData: { nombre: string; whatsapp: string } | null;
}) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue al enviar
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

      alert("Datos actualizados correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100"
    >
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Nombre del negocio
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          WhatsApp (ej: 5493816000000)
        </label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="549..."
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
