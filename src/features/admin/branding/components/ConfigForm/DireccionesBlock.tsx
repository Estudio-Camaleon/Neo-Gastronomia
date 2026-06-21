"use client";

import { useMemo } from "react";
import { Plus, MapPin, Trash2 } from "lucide-react";
import type { DireccionFisica } from "@/core/types/domain";
import {
  detectarRegion,
  localidadesParaRegion,
  direccionesParaLocalidad,
} from "../../types";

export interface DireccionesBlockProps {
  direcciones: DireccionFisica[];
  onChange: (d: DireccionFisica[]) => void;
  whatsappPais: string;
  whatsappNumero: string;
}

export function DireccionesBlock({
  direcciones,
  onChange,
  whatsappPais,
  whatsappNumero,
}: DireccionesBlockProps) {
  const region = useMemo(
    () => detectarRegion(whatsappPais, whatsappNumero),
    [whatsappPais, whatsappNumero],
  );

  const localidadesDisponibles = useMemo(
    () => localidadesParaRegion(region),
    [region],
  );

  const agregar = () => {
    const localidadDefault =
      localidadesDisponibles.length > 0 ? localidadesDisponibles[0] : "";
    const direccionesDefault = direccionesParaLocalidad(localidadDefault);
    const nueva: DireccionFisica = {
      id: crypto.randomUUID(),
      nombre: "",
      direccion: direccionesDefault.length > 0 ? direccionesDefault[0] : "",
      localidad: localidadDefault,
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
          <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Obligatorio</span>
        </div>
        <button
          type="button"
          onClick={agregar}
          className="text-xs font-semibold flex items-center gap-1 text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 px-2.5 py-1.5 rounded-md transition-colors"
        >
          <Plus size={13} /> Agregar sucursal
        </button>
      </div>

      {region && (
        <p className="text-[10px] text-[var(--admin-accent)] flex items-center gap-1">
          <MapPin size={11} />
          Región detectada: <span className="font-semibold">{region}</span>
        </p>
      )}

      {direcciones.length === 0 ? (
        <p className="text-xs text-[var(--admin-text-muted)] italic py-2">
          No hay sucursales registradas. Agregá al menos una dirección para tu negocio.
          <span className="block text-[10px] text-red-500/70 not-italic mt-1 font-medium">
            * Al menos una sucursal es obligatoria para recibir pedidos.
          </span>
        </p>
      ) : (
        <div className="space-y-3">
          {direcciones.map((dir) => {
            const zonas = direccionesParaLocalidad(dir.localidad || "");
            return (
              <div
                key={dir.id}
                className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-3"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full min-w-0">
                  <input
                    type="text"
                    value={dir.nombre}
                    onChange={(e) => actualizar(dir.id, { nombre: e.target.value })}
                    placeholder="Nombre (Ej: Local Centro)"
                    className="w-full p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-xs font-medium text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                  />
                  <select
                    value={dir.localidad}
                    onChange={(e) => {
                      const loc = e.target.value;
                      const dirs = direccionesParaLocalidad(loc);
                      actualizar(dir.id, {
                        localidad: loc,
                        direccion: dirs.length > 0 ? dirs[0] : "",
                      });
                    }}
                    className="w-full p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-xs text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                  >
                    <option value="">Seleccioná localidad</option>
                    {localidadesDisponibles.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <select
                    value={dir.direccion}
                    onChange={(e) => actualizar(dir.id, { direccion: e.target.value })}
                    className="w-full p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-xs text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
                  >
                    <option value="">Seleccioná zona</option>
                    {zonas.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
