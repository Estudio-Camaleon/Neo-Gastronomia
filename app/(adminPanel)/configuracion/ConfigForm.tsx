"use client";

import { updateNegocioConfig } from "./actions";
import { useState, ChangeEvent } from "react";
import { Upload, Phone, Clock, Image as ImageIcon } from "lucide-react";

export function ConfigForm({ negocio }: { negocio: any }) {
  const [loading, setLoading] = useState(false);
  // Estado para la previsualización del logo
  const [preview, setPreview] = useState<string | null>(
    negocio.logo_url || null,
  );

  const [hApertura, mApertura] = negocio.horarios_apertura?.split(":") || [
    "08",
    "00",
  ];
  const [hCierre, mCierre] = negocio.horarios_cierre?.split(":") || [
    "23",
    "00",
  ];

  // Manejador para detectar el cambio de archivo y generar la previsualización
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Limpieza de memoria cuando el componente se desmonte o el archivo cambie
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateNegocioConfig(formData);
    setLoading(false);

    if (result.success) {
      alert("¡Configuración actualizada con éxito!");
    } else {
      alert("Error: " + result.error);
    }
  }

  const horas = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutos = ["00", "15", "30", "45"];

  return (
    <form action={handleSubmit} className="space-y-8 pb-32">
      {/* SECCIÓN 1: IDENTIDAD VISUAL */}
      <section className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-border shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-red-600 flex items-center gap-2">
          <Upload size={14} /> Identidad Visual
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Columna de Carga y Previsualización */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase ml-1 opacity-50">
              Logo del Negocio
            </label>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Círculo de Previsualización */}
              <div className="relative w-32 h-32 rounded-[2rem] bg-gray-50 dark:bg-bg-darker border-2 border-dashed border-gray-200 dark:border-border-dark overflow-hidden flex items-center justify-center shrink-0">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
              </div>

              {/* Botón de Carga Custom */}
              <div className="relative flex-1 w-full">
                <input
                  name="logo_file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-gray-50 dark:bg-bg-darker border border-gray-200 dark:border-border-dark rounded-2xl p-6 text-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                  <Upload size={20} className="text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">
                    Seleccionar Archivo
                  </span>
                </div>
              </div>
            </div>
            {negocio.logo_url && !preview?.startsWith("blob") && (
              <p className="text-[9px] text-gray-400 mt-2 text-center sm:text-left italic">
                Logo actual guardado en la nube.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase ml-1 opacity-50">
              Color de Marca
            </label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-bg-darker p-4 rounded-2xl border border-gray-100 dark:border-border-dark">
                <input
                  name="color_primario"
                  type="color"
                  defaultValue={negocio.color_primario || "#E60000"}
                  className="h-12 w-20 rounded-xl cursor-pointer bg-transparent border-none"
                />
                <span className="font-mono text-sm font-bold opacity-60 uppercase">
                  {negocio.color_primario || "#E60000"}
                </span>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Este color se aplicará a iconos, botones y elementos destacados
                del menú.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: CONTACTO Y UBICACIÓN */}
      <section className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-border shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-red-600 flex items-center gap-2">
          <Phone size={14} /> Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-1 opacity-50">
              WhatsApp de Pedidos
            </label>
            <div className="flex gap-2">
              <select
                name="phone_code"
                className="bg-gray-50 dark:bg-bg-darker border-none rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="54">AR (+54)</option>
                <option value="591">BO (+591)</option>
                <option value="56">CL (+56)</option>
              </select>
              <input
                name="whatsapp_number"
                type="number"
                placeholder="3816554433"
                defaultValue={negocio.whatsapp?.replace(/^54|^591|^56/, "")}
                className="flex-1 bg-gray-50 dark:bg-bg-darker border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-1 opacity-50">
              Dirección
            </label>
            <input
              name="direccion"
              type="text"
              defaultValue={negocio.direccion}
              placeholder="Av. Alem 123, Tucumán"
              className="w-full bg-gray-50 dark:bg-bg-darker border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: HORARIOS */}
      <section className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-border shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-red-600 flex items-center gap-2">
          <Clock size={14} /> Horarios de Atención
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase opacity-50">
              Apertura
            </label>
            <div className="flex items-center gap-2">
              <select
                name="h_apertura"
                defaultValue={hApertura}
                className="flex-1 bg-gray-50 dark:bg-bg-darker border-none rounded-xl p-3 text-sm font-bold"
              >
                {horas.map((h) => (
                  <option key={h} value={h}>
                    {h} hs
                  </option>
                ))}
              </select>
              <span className="font-black">:</span>
              <select
                name="m_apertura"
                defaultValue={mApertura}
                className="flex-1 bg-gray-50 dark:bg-bg-darker border-none rounded-xl p-3 text-sm font-bold"
              >
                {minutos.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase opacity-50">
              Cierre
            </label>
            <div className="flex items-center gap-2">
              <select
                name="h_cierre"
                defaultValue={hCierre}
                className="flex-1 bg-gray-50 dark:bg-bg-darker border-none rounded-xl p-3 text-sm font-bold"
              >
                {horas.map((h) => (
                  <option key={h} value={h}>
                    {h} hs
                  </option>
                ))}
              </select>
              <span className="font-black">:</span>
              <select
                name="m_cierre"
                defaultValue={mCierre}
                className="flex-1 bg-gray-50 dark:bg-bg-darker border-none rounded-xl p-3 text-sm font-bold"
              >
                {minutos.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          disabled={loading}
          type="submit"
          className="bg-black text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 border border-white/10"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {loading ? "Sincronizando..." : "Guardar Configuración"}
        </button>
      </div>
    </form>
  );
}
