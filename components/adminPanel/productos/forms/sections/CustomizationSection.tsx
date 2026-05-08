"use client";

import React from "react";
import {
  Layers,
  Plus,
  Trash2,
  DollarSign,
  SplitSquareHorizontal,
  CheckSquare,
} from "lucide-react";
import { Variant, ExtraGroup } from "../ProductoForm";

interface CustomizationSectionProps {
  variantes: Variant[];
  setVariantes: (_v: Variant[]) => void;
  grupoExtras: ExtraGroup[];
  setGrupoExtras: (_g: ExtraGroup[]) => void;
}

export function CustomizationSection({
  variantes,
  setVariantes,
  grupoExtras,
  setGrupoExtras,
}: CustomizationSectionProps) {
  // --- MANEJADORES DE VARIANTES ---
  const agregarVariante = () => {
    setVariantes([...variantes, { nombre: "", precio: "" }]);
  };

  const eliminarVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  // --- MANEJADORES DE EXTRAS ---
  const agregarGrupoExtra = () => {
    setGrupoExtras([
      ...grupoExtras,
      {
        id: crypto.randomUUID(),
        titulo: "",
        requerido: false,
        multiple: false,
        items: [],
      },
    ]);
  };

  const eliminarGrupoExtra = (index: number) => {
    setGrupoExtras(grupoExtras.filter((_, i) => i !== index));
  };

  const agregarItemExtra = (grupoIndex: number) => {
    const nuevosGrupos = [...grupoExtras];
    nuevosGrupos[grupoIndex].items.push({
      id: crypto.randomUUID(),
      nombre: "",
      precio: "",
    });
    setGrupoExtras(nuevosGrupos);
  };

  const eliminarItemExtra = (grupoIndex: number, itemIndex: number) => {
    const nuevosGrupos = [...grupoExtras];
    nuevosGrupos[grupoIndex].items = nuevosGrupos[grupoIndex].items.filter(
      (_, i) => i !== itemIndex,
    );
    setGrupoExtras(nuevosGrupos);
  };

  return (
    <div className="mt-12 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      {/* ==========================================
          BLOQUE 1: VARIANTES (Ej: Tamaños)
      ========================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <div className="flex items-center gap-2">
            <SplitSquareHorizontal className="text-primary w-5 h-5" />
            <div>
              <h3 className="font-black uppercase italic tracking-tighter text-lg dark:text-text-inverse leading-none">
                Variantes Base
              </h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                Ej: Chico, Mediano, Grande (Reemplaza el precio base)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={agregarVariante}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase italic hover:bg-primary transition-all active:scale-95"
          >
            <Plus size={14} /> Nueva Variante
          </button>
        </div>

        {variantes.length > 0 ? (
          <div className="grid gap-3">
            {variantes.map((variante, vIdx) => (
              <div
                key={vIdx}
                className="flex gap-3 items-center bg-gray-50 dark:bg-bg-darker p-3 rounded-neo border-2 border-black"
              >
                <input
                  type="text"
                  placeholder="Nombre de Variante (Ej: Grande)"
                  value={variante.nombre}
                  onChange={(e) => {
                    const n = [...variantes];
                    n[vIdx].nombre = e.target.value;
                    setVariantes(n);
                  }}
                  className="flex-1 bg-white p-2 rounded-md border-2 border-black outline-none font-bold uppercase text-sm"
                />
                <div className="relative w-32">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50" />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={variante.precio}
                    onChange={(e) => {
                      const n = [...variantes];
                      n[vIdx].precio = e.target.value;
                      setVariantes(n);
                    }}
                    className="w-full bg-white p-2 pl-6 rounded-md border-2 border-black outline-none font-mono font-bold text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => eliminarVariante(vIdx)}
                  className="text-error hover:scale-110 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
              Sin variantes. Se usará el Precio Base.
            </p>
          </div>
        )}
      </div>

      {/* ==========================================
          BLOQUE 2: GRUPOS DE EXTRAS
      ========================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <div className="flex items-center gap-2">
            <Layers className="text-primary w-5 h-5" />
            <div>
              <h3 className="font-black uppercase italic tracking-tighter text-lg dark:text-text-inverse leading-none">
                Extras y Agregados
              </h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                Salsas, Puntos de cocción, Sin Cebolla, etc.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={agregarGrupoExtra}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase italic hover:bg-primary transition-all active:scale-95"
          >
            <Plus size={14} /> Nuevo Grupo
          </button>
        </div>

        <div className="grid gap-6">
          {grupoExtras.map((grupo, gIdx) => (
            <div
              key={grupo.id}
              className="bg-bg-main dark:bg-bg-dark p-6 rounded-neo border-4 border-black relative group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <button
                type="button"
                onClick={() => eliminarGrupoExtra(gIdx)}
                className="absolute -top-3 -right-3 bg-error text-white p-2 rounded-full border-2 border-black hover:scale-110 transition-transform"
              >
                <Trash2 size={14} />
              </button>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-text-muted italic">
                    Título del Grupo
                  </label>
                  <input
                    type="text"
                    value={grupo.titulo}
                    onChange={(e) => {
                      const n = [...grupoExtras];
                      n[gIdx].titulo = e.target.value;
                      setGrupoExtras(n);
                    }}
                    className="w-full bg-white dark:bg-bg-darker p-3 rounded-neo border-2 border-black outline-none font-bold uppercase italic focus:bg-yellow-50 transition-colors"
                    placeholder="Ej: Elegí tus aderezos"
                  />
                </div>

                {/* Toggles de Configuración */}
                <div className="flex flex-col justify-center gap-3 bg-white border-2 border-black rounded-neo p-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-black"
                      checked={grupo.requerido}
                      onChange={(e) => {
                        const n = [...grupoExtras];
                        n[gIdx].requerido = e.target.checked;
                        setGrupoExtras(n);
                      }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Es Obligatorio
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-black"
                      checked={grupo.multiple}
                      onChange={(e) => {
                        const n = [...grupoExtras];
                        n[gIdx].multiple = e.target.checked;
                        setGrupoExtras(n);
                      }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Permitir Múltiples
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-neo border-2 border-black">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-4 border-primary pl-2">
                  Ítems del Grupo
                </p>
                {grupo.items.map((item, iIdx) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-center animate-in fade-in zoom-in duration-300 border-b-2 border-dashed border-gray-200 pb-2"
                  >
                    <CheckSquare size={16} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nombre (ej: Cheddar)"
                      value={item.nombre}
                      onChange={(e) => {
                        const n = [...grupoExtras];
                        n[gIdx].items[iIdx].nombre = e.target.value;
                        setGrupoExtras(n);
                      }}
                      className="flex-1 bg-transparent outline-none text-sm font-bold uppercase italic"
                    />
                    <div className="relative w-28">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-600" />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.precio}
                        onChange={(e) => {
                          const n = [...grupoExtras];
                          n[gIdx].items[iIdx].precio = e.target.value;
                          setGrupoExtras(n);
                        }}
                        className="w-full bg-emerald-50 text-emerald-700 p-1 pl-6 rounded-md border border-emerald-200 outline-none text-sm font-mono font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarItemExtra(gIdx, iIdx)}
                      className="text-error hover:scale-125 transition-transform p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => agregarItemExtra(gIdx)}
                  className="w-full border-2 border-dashed border-black dark:border-border-dark p-2 rounded-md text-[9px] font-black uppercase italic hover:bg-black hover:text-white transition-all mt-2"
                >
                  + Agregar Ítem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
