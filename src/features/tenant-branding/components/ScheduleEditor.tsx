"use client";

import { Trash2, Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export function ScheduleEditor({
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
    if (turnos.length >= 2)
      return toast.error("LÍMITE MÁXIMO DE 2 TURNOS POR DÍA ALCANZADO");
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
    if (!source.length)
      return toast.error("DEBE DEFINIR AL MENOS UN TURNO PARA CLONAR");
    const newSchedule: ScheduleData = {};
    DIAS.forEach((d) => {
      newSchedule[d.id] = { turnos: source.map((t) => ({ ...t })) };
    });
    onChange(newSchedule);
    toast.success("CRONOGRAMA SEMANAL COPIADO EN CADENA");
  };

  return (
    <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden text-black font-sans">
      <div className="bg-black text-white px-4 py-3 border-b-2 border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#A3FF00] rounded-full animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-widest">
            Protocolo de Apertura Digital // Sincronización Realtime
          </span>
        </div>
        <ShieldCheck size={14} className="text-[#A3FF00] stroke-[2.5]" />
      </div>

      <div className="divide-y-2 divide-black/10">
        {DIAS.map((dia) => {
          const turnos = getTurnos(dia.id);
          const isOpen = turnos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row items-stretch md:items-center ${isOpen ? "bg-[#A3FF00]/5" : "bg-transparent opacity-60"}`}
            >
              {/* CHECKBOX DÍA */}
              <div className="w-full md:w-40 px-4 py-3 flex items-center gap-3 border-b md:border-b-0 md:border-r-2 border-black/10 shrink-0">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => updateDay(dia.id, e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer border-2 border-black"
                />
                <span className="text-xs font-black uppercase tracking-wider">
                  {dia.label}
                </span>
              </div>

              {/* FRANJAS OPERATIVAS */}
              <div className="flex-1 px-4 py-2 flex flex-wrap items-center gap-4 min-h-[56px]">
                {isOpen ? (
                  turnos.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000000]">
                        <input
                          type="time"
                          value={t.inicio}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "inicio", e.target.value)
                          }
                          className="bg-transparent font-mono text-xs font-black outline-none"
                        />
                        <span className="mx-1 text-[10px] font-bold opacity-30">
                          A
                        </span>
                        <input
                          type="time"
                          value={t.fin}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "fin", e.target.value)
                          }
                          className="bg-transparent font-mono text-xs font-black outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFranja(dia.id, idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-[9px] font-mono font-black uppercase text-gray-300 tracking-widest italic">
                    Cerrado / Fuera de servicio
                  </span>
                )}
              </div>

              {/* ACCIONES DE LÍNEA */}
              <div className="px-4 py-2 flex items-center justify-end gap-2 border-t md:border-t-0 border-black/5 shrink-0">
                {isOpen && (
                  <>
                    {turnos.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addFranja(dia.id)}
                        className="p-1.5 border border-black bg-white shadow-[1px_1px_0px_0px_#000000] text-black hover:bg-[#A3FF00] text-[10px] font-black"
                      >
                        + TURNO
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cloneToAll(dia.id)}
                      className="p-1.5 border border-black bg-white shadow-[1px_1px_0px_0px_#000000] text-black hover:bg-black hover:text-white text-[10px] font-black flex items-center gap-1"
                    >
                      <Copy size={10} /> REPLICAR SEMANA
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
